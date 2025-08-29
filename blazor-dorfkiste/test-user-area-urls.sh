#!/bin/bash

# Simple cURL-based test for user area pages
# Tests HTTP status codes for user-related pages

echo "=== Dorfkiste User Area URL Tests ==="
echo "Testing user area pages with cURL..."
echo

BASE_URL="https://localhost:5001"
USER_PAGES=(
    "/profile"
    "/my-items"
    "/my-rentals"
    "/watchlist"
    "/notifications"
    "/items/new"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "Testing against: $BASE_URL"
echo "=============================================="

# Function to test a URL
test_url() {
    local url="$1"
    local full_url="${BASE_URL}${url}"
    
    # Use curl to get status code, following redirects but limiting to 3
    local status_code=$(curl -k -s -o /dev/null -w "%{http_code}" -L --max-redirs 3 "$full_url" 2>/dev/null)
    local curl_exit=$?
    
    printf "Testing %-15s" "$url"
    
    if [ $curl_exit -ne 0 ]; then
        printf "${RED}ERROR: Connection failed${NC}\n"
        return 1
    fi
    
    case $status_code in
        200)
            printf "${GREEN}%s (OK - Page loaded successfully)${NC}\n" "$status_code"
            return 0
            ;;
        301|302)
            printf "${CYAN}%s (Redirect - likely to login page)${NC}\n" "$status_code"
            return 0
            ;;
        401)
            printf "${YELLOW}%s (Unauthorized - authentication required)${NC}\n" "$status_code"
            return 0
            ;;
        403)
            printf "${YELLOW}%s (Forbidden - access denied)${NC}\n" "$status_code"
            return 0
            ;;
        404)
            printf "${RED}%s (Not Found - PAGE MISSING!)${NC}\n" "$status_code"
            return 1
            ;;
        500|502|503)
            printf "${RED}%s (Server Error - APPLICATION ISSUE!)${NC}\n" "$status_code"
            return 1
            ;;
        *)
            printf "${YELLOW}%s (Unexpected status code)${NC}\n" "$status_code"
            return 1
            ;;
    esac
}

# Test all user area pages
failed_tests=0
total_tests=${#USER_PAGES[@]}

for page in "${USER_PAGES[@]}"; do
    if ! test_url "$page"; then
        ((failed_tests++))
    fi
    sleep 0.5  # Small delay between requests
done

echo "=============================================="
echo

# Summary
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! ($total_tests/$total_tests)${NC}"
    echo "All user area pages return acceptable status codes."
else
    echo -e "${RED}❌ Some tests failed! ($((total_tests - failed_tests))/$total_tests passed)${NC}"
    echo "Check the output above for pages returning 404 or 500 errors."
fi

echo
echo "Expected status codes:"
echo "  • 200 (OK) - Page loads successfully"
echo "  • 302 (Redirect) - Redirected to login (normal for protected pages)"
echo "  • 401 (Unauthorized) - Authentication required"
echo "  • 403 (Forbidden) - User lacks permissions"
echo
echo "Problematic status codes:"
echo "  • 404 (Not Found) - Page doesn't exist"
echo "  • 500 (Server Error) - Application error"

exit $failed_tests