## 🧪 Ghostagotchi API Testing Guide

This guide provides example requests for testing all API endpoints.

### Prerequisites

- Backend running locally (`npm run dev`) or deployed
- Supabase project configured
- Valid authentication token (for protected endpoints)

### Base URL

```bash
# Local development
BASE_URL=http://localhost:3000

# Production (replace with your Vercel URL)
BASE_URL=https://your-project.vercel.app
```

---

## 🔓 Public Endpoints

### Get Leaderboard

```bash
# Get top 10 ghosts
curl $BASE_URL/api/leaderboard

# Get top 20 ghosts
curl "$BASE_URL/api/leaderboard?limit=20"
```

**Expected Response:**
```json
{
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "ghostName": "Phantom",
        "level": 7,
        "experience": 650,
        "owner": "phantom_keeper",
        "age": "2 days old"
      }
    ],
    "total": 5,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🔐 Protected Endpoints

For protected endpoints, you need a valid Supabase JWT token.

### Getting an Auth Token

**Option 1: Using Supabase Client (Recommended)**
```javascript
// In your web app or test script
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'your-password'
})

const token = data.session?.access_token
```

**Option 2: Using curl**
```bash
# Sign up
curl -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'

# Sign in
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

Save the `access_token` from the response.

---

### Pet Management

#### Create Pet

```bash
curl -X POST $BASE_URL/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Casper"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "name": "Casper",
    "level": 1,
    "experience": 0,
    "hunger": 100,
    "mood": 100,
    "lastFedAt": null,
    "lastPlayedAt": null,
    "ghostPersona": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Pet created successfully"
}
```

#### Get Pet

```bash
curl $BASE_URL/api/pet \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "data": {
    "id": "uuid-here",
    "name": "Casper",
    "level": 2,
    "experience": 150,
    "hunger": 85,
    "mood": 90,
    "profile": {
      "username": "ghostmaster"
    }
  }
}
```

---

### Pet Actions

#### Feed Pet

```bash
curl -X POST $BASE_URL/api/pet/feed \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "data": {
    "pet": {
      "id": "uuid-here",
      "hunger": 100,
      "experience": 160,
      "level": 2,
      "lastFedAt": "2024-01-15T10:30:00.000Z"
    },
    "leveledUp": false,
    "xpGained": 10
  },
  "message": "Fed! Your ghost is happy! 👻"
}
```

**Level Up Response:**
```json
{
  "data": {
    "pet": {
      "hunger": 100,
      "experience": 200,
      "level": 3,
      "lastFedAt": "2024-01-15T10:35:00.000Z"
    },
    "leveledUp": true,
    "xpGained": 10
  },
  "message": "Fed! Your ghost leveled up to 3! 🎉"
}
```

#### Play with Pet

```bash
curl -X POST $BASE_URL/api/pet/play \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "data": {
    "pet": {
      "mood": 100,
      "experience": 165,
      "level": 2,
      "lastPlayedAt": "2024-01-15T10:32:00.000Z"
    },
    "leveledUp": false,
    "xpGained": 5
  },
  "message": "Played! Your ghost is cheerful! 😊"
}
```

---

### AI Chat

#### Chat with Ghost

```bash
curl -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "How are you feeling today?"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "reply": "Boo! 👻 I'm feeling absolutely spook-tacular today! Thanks for asking! How about you?",
    "petName": "Casper",
    "tokensUsed": 45
  }
}
```

**Error Response (OpenAI unavailable):**
```json
{
  "data": {
    "reply": "Oops! 👻 My ghostly connection got a bit fuzzy. Can you say that again?",
    "petName": "Casper",
    "error": "OpenAI API temporarily unavailable"
  }
}
```

---

### Profile Management

#### Update Username

```bash
curl -X POST $BASE_URL/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "ghostmaster"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "user-uuid",
    "username": "ghostmaster",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Missing required fields: name"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Pet not found"
}
```

### 409 Conflict

```json
{
  "error": "Conflict",
  "message": "User already has a pet"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 🧪 Testing Workflow

### Complete User Flow

```bash
# 1. Sign up (using Supabase)
# 2. Get auth token
# 3. Create pet
curl -X POST $BASE_URL/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"TestGhost"}'

# 4. Get pet details
curl $BASE_URL/api/pet \
  -H "Authorization: Bearer $TOKEN"

# 5. Feed the ghost
curl -X POST $BASE_URL/api/pet/feed \
  -H "Authorization: Bearer $TOKEN"

# 6. Play with the ghost
curl -X POST $BASE_URL/api/pet/play \
  -H "Authorization: Bearer $TOKEN"

# 7. Chat with the ghost
curl -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Tell me a ghost joke!"}'

# 8. Update username
curl -X POST $BASE_URL/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"test_user"}'

# 9. Check leaderboard
curl $BASE_URL/api/leaderboard
```

---

## 🔧 Testing Tools

### Postman Collection

Import this collection to test all endpoints:

1. Create new collection in Postman
2. Add environment variables:
   - `BASE_URL`: Your API URL
   - `TOKEN`: Your auth token
3. Import requests from this guide

### Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new collection
3. Add requests with `{{BASE_URL}}` and `{{TOKEN}}` variables

### HTTPie (CLI)

```bash
# Install
brew install httpie  # macOS
pip install httpie   # Python

# Usage
http GET $BASE_URL/api/leaderboard
http POST $BASE_URL/api/pet name=Casper Authorization:"Bearer $TOKEN"
```

---

## 📊 Performance Testing

### Load Testing with Apache Bench

```bash
# Test leaderboard endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 $BASE_URL/api/leaderboard

# Test with auth (requires token in file)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" $BASE_URL/api/pet
```

### Expected Response Times

- Leaderboard: < 200ms
- Pet CRUD: < 150ms
- Feed/Play: < 200ms
- Chat: 1-3s (depends on OpenAI)

---

## 🐛 Debugging Tips

### Enable Verbose Logging

```bash
# Set in .env.local
NODE_ENV=development
```

### Check Prisma Queries

```bash
# In lib/prisma.ts, logging is enabled in development
# Check console for SQL queries
```

### Monitor OpenAI Usage

```bash
# Check OpenAI dashboard for:
# - Request count
# - Token usage
# - Error rates
```

### Supabase Logs

1. Go to Supabase dashboard
2. Navigate to Logs
3. Filter by:
   - API requests
   - Database queries
   - Auth events
