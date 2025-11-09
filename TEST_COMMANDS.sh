#!/bin/bash
# Senior Care System - API Testing Script
# Tests data flow through API Gateway, Games Service, and MongoDB

echo "=========================================="
echo "Senior Care System - Data Flow Tests"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4

    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo "URL: $url"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo "Response Code: $http_code"
    echo "Response Body: $body"

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAIL++))
    fi
    echo "----------------------------------------"
    echo ""
}

echo "=========================================="
echo "PART 1: API Gateway Basic Tests"
echo "=========================================="
echo ""

# Test 1: Homepage
test_endpoint "API Gateway - Homepage" "http://localhost:8080/"

# Test 2: About Page
test_endpoint "API Gateway - About" "http://localhost:8080/about"

echo ""
echo "=========================================="
echo "PART 2: User Management Tests"
echo "=========================================="
echo ""

# Test 3: Register a Senior User
echo -e "${YELLOW}Test 3: Register Senior User${NC}"
SENIOR_DATA='{
  "username": "mary_senior",
  "password": "senior123",
  "role": "senior",
  "profile": {
    "name": "Mary Johnson",
    "age": 72,
    "email": "mary@example.com",
    "contact": "+1-555-0101"
  }
}'
test_endpoint "Register Senior User" "http://localhost:8080/register" "POST" "$SENIOR_DATA"

# Test 4: Register a Family Member
echo -e "${YELLOW}Test 4: Register Family Member${NC}"
FAMILY_DATA='{
  "username": "john_family",
  "password": "family123",
  "role": "family",
  "profile": {
    "name": "John Johnson",
    "age": 45,
    "email": "john@example.com",
    "contact": "+1-555-0102"
  }
}'
test_endpoint "Register Family Member" "http://localhost:8080/register" "POST" "$FAMILY_DATA"

# Test 5: Register an Admin
echo -e "${YELLOW}Test 5: Register Admin${NC}"
ADMIN_DATA='{
  "username": "admin_user",
  "password": "admin123",
  "role": "admin",
  "profile": {
    "name": "System Admin",
    "email": "admin@example.com"
  }
}'
test_endpoint "Register Admin User" "http://localhost:8080/register" "POST" "$ADMIN_DATA"

echo ""
echo "=========================================="
echo "PART 3: Authentication Tests"
echo "=========================================="
echo ""

# Test 6: Login as Senior
echo -e "${YELLOW}Test 6: Login as Senior${NC}"
LOGIN_DATA='{"username": "mary_senior", "password": "senior123"}'
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "http://localhost:8080/login")
echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful - Token received${NC}"
    echo "Token: ${TOKEN:0:20}..."
    ((PASS++))
else
    echo -e "${RED}✗ Login failed - No token received${NC}"
    ((FAIL++))
fi
echo "----------------------------------------"
echo ""

# Test 7: Login with wrong password
echo -e "${YELLOW}Test 7: Login with Wrong Password (Should Fail)${NC}"
WRONG_LOGIN='{"username": "mary_senior", "password": "wrongpassword"}'
test_endpoint "Login with Wrong Password" "http://localhost:8080/login" "POST" "$WRONG_LOGIN"

echo ""
echo "=========================================="
echo "PART 4: Games Service Tests (via Proxy)"
echo "=========================================="
echo ""

# Test 8: Games Service Health
test_endpoint "Games Service Health" "http://localhost:8080/games/health"

echo ""
echo "=========================================="
echo "PART 5: Database Verification"
echo "=========================================="
echo ""

echo -e "${YELLOW}Test: Verify Users in Database${NC}"
echo "Command: docker exec mongodb mongosh --quiet --eval 'db.users.find({}, {username:1, role:1, _id:0}).toArray()' senior_care"
echo ""
docker exec mongodb mongosh --quiet --eval "db.users.find({}, {username:1, role:1, 'profile.name':1, _id:0}).toArray()" senior_care
echo ""
echo "----------------------------------------"
echo ""

echo -e "${YELLOW}Test: Count Users by Role${NC}"
echo "Command: Count users in each role"
echo ""
SENIOR_COUNT=$(docker exec mongodb mongosh --quiet --eval "db.users.countDocuments({role: 'senior'})" senior_care)
FAMILY_COUNT=$(docker exec mongodb mongosh --quiet --eval "db.users.countDocuments({role: 'family'})" senior_care)
ADMIN_COUNT=$(docker exec mongodb mongosh --quiet --eval "db.users.countDocuments({role: 'admin'})" senior_care)

echo "Seniors: $SENIOR_COUNT"
echo "Family: $FAMILY_COUNT"
echo "Admins: $ADMIN_COUNT"
echo "----------------------------------------"
echo ""

echo ""
echo "=========================================="
echo "PART 6: Cross-Service Data Flow Test"
echo "=========================================="
echo ""

echo -e "${YELLOW}Test: Check All Collections${NC}"
echo "Verifying data can be stored across all collections..."
echo ""

docker exec mongodb mongosh --quiet --eval "
  print('Collections in senior_care database:');
  print('=====================================');
  db.getCollectionNames().forEach(function(col) {
    var count = db[col].countDocuments();
    print(col + ': ' + count + ' documents');
  });
" senior_care

echo ""
echo "----------------------------------------"
echo ""

echo ""
echo "=========================================="
echo "PART 7: Service Communication Test"
echo "=========================================="
echo ""

echo -e "${YELLOW}Test: API Gateway → Games Service → MongoDB${NC}"
echo "This tests the full proxy chain and database connectivity"
echo ""

# Games service health shows MongoDB connection
GAMES_HEALTH=$(curl -s "http://localhost:8080/games/health")
echo "Games Service Status: $GAMES_HEALTH"
echo ""

# Check if MongoDB is connected
if echo "$GAMES_HEALTH" | grep -q '"mongodb":"connected"'; then
    echo -e "${GREEN}✓ Games Service → MongoDB: Connected${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Games Service → MongoDB: Not Connected${NC}"
    ((FAIL++))
fi

# Check if MQTT is connected
if echo "$GAMES_HEALTH" | grep -q '"mqtt":"connected"'; then
    echo -e "${GREEN}✓ Games Service → MQTT: Connected${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Games Service → MQTT: Not Connected${NC}"
    ((FAIL++))
fi

echo ""
echo "----------------------------------------"
echo ""

echo ""
echo "=========================================="
echo "PART 8: Data Persistence Test"
echo "=========================================="
echo ""

echo -e "${YELLOW}Test: Verify Registered Users Persist in Database${NC}"
echo ""

# Check if mary_senior exists
MARY_EXISTS=$(docker exec mongodb mongosh --quiet --eval "db.users.findOne({username: 'mary_senior'}) ? 'YES' : 'NO'" senior_care)
if echo "$MARY_EXISTS" | grep -q "YES"; then
    echo -e "${GREEN}✓ Senior user persisted in database${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Senior user NOT found in database${NC}"
    ((FAIL++))
fi

# Check if john_family exists
JOHN_EXISTS=$(docker exec mongodb mongosh --quiet --eval "db.users.findOne({username: 'john_family'}) ? 'YES' : 'NO'" senior_care)
if echo "$JOHN_EXISTS" | grep -q "YES"; then
    echo -e "${GREEN}✓ Family user persisted in database${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Family user NOT found in database${NC}"
    ((FAIL++))
fi

# Check if admin_user exists
ADMIN_EXISTS=$(docker exec mongodb mongosh --quiet --eval "db.users.findOne({username: 'admin_user'}) ? 'YES' : 'NO'" senior_care)
if echo "$ADMIN_EXISTS" | grep -q "YES"; then
    echo -e "${GREEN}✓ Admin user persisted in database${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Admin user NOT found in database${NC}"
    ((FAIL++))
fi

echo ""
echo "----------------------------------------"
echo ""

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo -e "Total Tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED! System is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed. Review the output above.${NC}"
fi

echo ""
echo "=========================================="
echo "CLEANUP (Optional)"
echo "=========================================="
echo ""
echo "To remove test users from database, run:"
echo "docker exec mongodb mongosh --quiet --eval \"db.users.deleteMany({username: {\$in: ['mary_senior', 'john_family', 'admin_user']}})\" senior_care"
echo ""
