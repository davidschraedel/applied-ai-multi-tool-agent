#!/usr/bin/env bash
# scripts/test.sh — Phase 1 smoke-test runner
# Usage: bash scripts/test.sh
# Exit 0 = all checks pass, non-zero = failure
set -euo pipefail

PASS=0
FAIL=0

ok()   { echo "  ✅  $*"; PASS=$((PASS + 1)); }
fail() { echo "  ❌  $*"; FAIL=$((FAIL + 1)); }

echo ""
echo "======================================="
echo "  AI Agent — Test Suite"
echo "======================================="
echo ""

# ── 1. Node version check (require >= 20) ─────────────────────────────────────
echo "[ 1 ] Node.js version"
NODE_MAJOR=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
echo "      Detected: $(node --version)"
if [ "$NODE_MAJOR" -ge 20 ]; then
  ok "Node.js >= 20 requirement satisfied"
else
  fail "Node.js >= 20 required, found v${NODE_MAJOR}"
fi

# ── 2. Secrets audit: .env must NOT be tracked by git ─────────────────────────
echo ""
echo "[ 2 ] Secrets audit"
if git ls-files --error-unmatch .env 2>/dev/null; then
  fail ".env is tracked in git — SECURITY RISK"
else
  ok ".env is NOT tracked in git"
fi

# Check git history for raw API key patterns
if git log --all -p 2>/dev/null | grep -qE "sk-[a-zA-Z0-9]{32,}|ANTHROPIC_API_KEY=[^\s#]+|OPENAI_API_KEY=[^\s#]+|TAVILY_API_KEY=[^\s#]+" 2>/dev/null; then
  fail "API key value found in git history — run git-filter-repo to clean"
else
  ok "No API key values found in git history"
fi

# ── 3. TypeScript compile check ────────────────────────────────────────────────
echo ""
echo "[ 3 ] TypeScript compile"
if npx tsc --noEmit 2>&1; then
  ok "TypeScript compiles with no errors"
else
  fail "TypeScript compile errors found"
fi

# ── 4. Environment variables present ──────────────────────────────────────────
echo ""
echo "[ 4 ] Environment variables"
# Load .env if it exists (for local runs outside npm)
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

MISSING_VARS=0
for var in ANTHROPIC_API_KEY OPENAI_API_KEY TAVILY_API_KEY; do
  if [ -z "${!var:-}" ]; then
    fail "$var is not set"
    MISSING_VARS=1
  else
    ok "$var is set"
  fi
done

# ── 5. Calculator tool smoke test ──────────────────────────────────────────────
echo ""
echo "[ 5 ] Calculator tool"
CALC_OUTPUT=$(npx tsx scripts/test-calculator.ts 2>/dev/null || true)
if echo "$CALC_OUTPUT" | grep -q "^PASS"; then
  ok "Calculator: 2+2=4, 42*17=714, invalid input returns error"
else
  fail "Calculator test failed: $CALC_OUTPUT"
fi

# ── 6. Web search tool smoke test (skipped if no Tavily key) ──────────────────
echo ""
echo "[ 6 ] Web search tool"
if [ -z "${TAVILY_API_KEY:-}" ]; then
  echo "      SKIP: TAVILY_API_KEY not set"
else
  SEARCH_OUTPUT=$(npx tsx scripts/test-webSearch.ts 2>/dev/null || true)
  if echo "$SEARCH_OUTPUT" | grep -q "^PASS"; then
    ok "Web search returned non-empty result"
  else
    fail "Web search test failed: $SEARCH_OUTPUT"
  fi
fi

# ── 7. RAG tool smoke test (skipped if no OpenAI key) ─────────────────────────
echo ""
echo "[ 7 ] RAG / document search tool"
if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "      SKIP: OPENAI_API_KEY not set"
else
  RAG_OUTPUT=$(npx tsx scripts/test-rag.ts 2>/dev/null || true)
  if echo "$RAG_OUTPUT" | grep -q "^PASS"; then
    ok "RAG: document retrieved with source attribution"
  else
    fail "RAG test failed: $RAG_OUTPUT"
  fi
fi

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo "======================================="
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo "======================================="
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
