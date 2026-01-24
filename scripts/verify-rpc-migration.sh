#!/bin/bash

# =====================================================
# RPC Migration Verification Script
# =====================================================
# 
# Purpose: 
#   - Verify the find_similar_fragments_aso RPC migration
#   - Check security settings (SECURITY INVOKER, permissions)
#   - Validate dependencies (views, tables, extensions)
#
# Usage:
#   bash scripts/verify-rpc-migration.sh
#
# @version 1.0.0
# @date 2026-01-12
# =====================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# =====================================================
# Helper Functions
# =====================================================

check_pass() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo -e "${GREEN}✅ PASS:${NC} $1"
}

check_fail() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
  echo -e "${RED}❌ FAIL:${NC} $1"
}

check_warn() {
  echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

info() {
  echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

# =====================================================
# Step 1: Environment Check
# =====================================================

echo ""
echo "=========================================="
echo "  RPC Migration Verification Script"
echo "  Version: 1.0.0"
echo "=========================================="
echo ""

info "Step 1: Environment Check"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
  check_pass "Supabase CLI is installed"
else
  check_fail "Supabase CLI is not installed"
  exit 1
fi

# Check if Supabase is running
if supabase status &> /dev/null; then
  check_pass "Supabase is running"
else
  check_fail "Supabase is not running"
  info "Run: supabase start"
  exit 1
fi

# Check DB connection
if supabase db execute "SELECT 1" &> /dev/null; then
  check_pass "Database connection is OK"
else
  check_fail "Cannot connect to database"
  exit 1
fi

# =====================================================
# Step 2: Dependency Check
# =====================================================

echo ""
info "Step 2: Dependency Check"
echo ""

# Check aso_fragment_vectors view
VIEW_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_views 
  WHERE viewname = 'aso_fragment_vectors';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$VIEW_EXISTS" = "1" ]; then
  check_pass "aso_fragment_vectors view exists"
else
  check_fail "aso_fragment_vectors view does not exist"
fi

# Check user_tenants table
USER_TENANTS_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_tables 
  WHERE tablename = 'user_tenants';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$USER_TENANTS_EXISTS" = "1" ]; then
  check_pass "user_tenants table exists"
else
  check_fail "user_tenants table does not exist"
fi

# Check clavi.client_analyses table
CLIENT_ANALYSES_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_tables 
  WHERE schemaname = 'clavi' AND tablename = 'client_analyses';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$CLIENT_ANALYSES_EXISTS" = "1" ]; then
  check_pass "clavi.client_analyses table exists"
else
  check_fail "clavi.client_analyses table does not exist"
fi

# Check clavi.fragment_vectors table
FRAGMENT_VECTORS_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_tables 
  WHERE schemaname = 'clavi' AND tablename = 'fragment_vectors';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$FRAGMENT_VECTORS_EXISTS" = "1" ]; then
  check_pass "clavi.fragment_vectors table exists"
else
  check_fail "clavi.fragment_vectors table does not exist"
fi

# Check pgvector extension
PGVECTOR_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_extension 
  WHERE extname = 'vector';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$PGVECTOR_EXISTS" = "1" ]; then
  check_pass "pgvector extension is enabled"
else
  check_fail "pgvector extension is not enabled"
fi

# =====================================================
# Step 3: RPC Function Check
# =====================================================

echo ""
info "Step 3: RPC Function Check"
echo ""

# Check if function exists
FUNCTION_EXISTS=$(supabase db execute "
  SELECT COUNT(*) 
  FROM pg_proc 
  WHERE proname = 'find_similar_fragments_aso';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$FUNCTION_EXISTS" = "0" ]; then
  check_fail "RPC function 'find_similar_fragments_aso' does not exist"
  info "Migration may not have been applied yet"
  echo ""
  echo "=========================================="
  echo "  Summary: Migration Not Applied"
  echo "=========================================="
  echo ""
  echo "Next step: Run 'supabase db push' to apply migration"
  exit 1
elif [ "$FUNCTION_EXISTS" = "1" ]; then
  check_pass "RPC function 'find_similar_fragments_aso' exists"
else
  check_warn "Multiple functions with the same name found (count: $FUNCTION_EXISTS)"
fi

# Check SECURITY setting (prosecdef = false means SECURITY INVOKER)
SECURITY_INVOKER=$(supabase db execute "
  SELECT prosecdef 
  FROM pg_proc 
  WHERE proname = 'find_similar_fragments_aso'
  LIMIT 1;
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$SECURITY_INVOKER" = "f" ]; then
  check_pass "Function is SECURITY INVOKER (prosecdef = false)"
else
  check_fail "Function is SECURITY DEFINER (prosecdef = true) - SECURITY RISK!"
fi

# Check number of arguments
ARG_COUNT=$(supabase db execute "
  SELECT pronargs 
  FROM pg_proc 
  WHERE proname = 'find_similar_fragments_aso'
  LIMIT 1;
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$ARG_COUNT" = "4" ]; then
  check_pass "Function has 4 arguments (p_tenant_id removed)"
else
  check_fail "Function has $ARG_COUNT arguments (expected 4)"
fi

# Check volatility (should be 's' for STABLE)
VOLATILITY=$(supabase db execute "
  SELECT provolatile 
  FROM pg_proc 
  WHERE proname = 'find_similar_fragments_aso'
  LIMIT 1;
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$VOLATILITY" = "s" ]; then
  check_pass "Function is STABLE (provolatile = s)"
else
  check_warn "Function volatility is '$VOLATILITY' (expected 's')"
fi

# =====================================================
# Step 4: Permission Check
# =====================================================

echo ""
info "Step 4: Permission Check"
echo ""

# Check if authenticated role has EXECUTE permission
AUTHENTICATED_PERM=$(supabase db execute "
  SELECT COUNT(*) 
  FROM information_schema.routine_privileges 
  WHERE routine_name = 'find_similar_fragments_aso' 
    AND grantee = 'authenticated' 
    AND privilege_type = 'EXECUTE';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$AUTHENTICATED_PERM" = "1" ]; then
  check_pass "authenticated role has EXECUTE permission"
else
  check_fail "authenticated role does NOT have EXECUTE permission"
fi

# Check if anon role does NOT have EXECUTE permission
ANON_PERM=$(supabase db execute "
  SELECT COUNT(*) 
  FROM information_schema.routine_privileges 
  WHERE routine_name = 'find_similar_fragments_aso' 
    AND grantee = 'anon' 
    AND privilege_type = 'EXECUTE';
" 2>/dev/null | tail -1 | tr -d ' ')

if [ "$ANON_PERM" = "0" ]; then
  check_pass "anon role does NOT have EXECUTE permission (secure)"
else
  check_fail "anon role HAS EXECUTE permission - SECURITY RISK!"
fi

# =====================================================
# Summary
# =====================================================

echo ""
echo "=========================================="
echo "  Verification Summary"
echo "=========================================="
echo ""
echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo ""

if [ "$FAILED_CHECKS" = "0" ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Next step: Proceed to 48-hour gate testing"
  echo "Guide: docs/saas-product/PHASE4_48H_GATE_PLAN.md"
  exit 0
else
  echo -e "${RED}❌ Some checks failed!${NC}"
  echo ""
  echo "Please review the failed checks and take corrective action."
  echo "Guide: docs/saas-product/MIGRATION_CHECKLIST_v2.md"
  exit 1
fi

