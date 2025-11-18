# Ghostagotchi API Documentation

Complete API reference for the Ghostagotchi backend.

## Base URL

```
Development: http://localhost:3000
Production:  https://your-project.vercel.app
```

## Authentication

Most endpoints require authentication via Supabase JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by signing in through Supabase Auth:

```javascript
const { data } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
const token = data.session?.access_token
```

---

## Endpoints

### 🔓 Public Endpoints

#### GET /api/leaderboard

Get the top ghosts ranked by level and experience.

**Authentication:** Not required

**Query Parameters:**
- `limit` (optional): Number of results (default: 10, max: 100)

**Response:**
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

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### 🔐 Protected Endpoints

#### POST /api/pet

Create a new ghost pet for the authenticated user.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Casper"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Casper",
    "level": 1,
    "experience": 0,
    "hunger": 100,
    "mood": 100,
    "lastFedAt": null,
    "lastPlayedAt": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Pet created successfully"
}
```

**Status Codes:**
- `201`: Pet created successfully
- `400`: Missing or invalid name
- `401`: Unauthorized (no valid token)
- `409`: User already has a pet
- `500`: Server error

---

#### GET /api/pet

Get the authenticated user's ghost pet.

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Casper",
    "level": 2,
    "experience": 150,
    "hunger": 85,
    "mood": 90,
    "lastFedAt": "2024-01-15T09:30:00.000Z",
    "lastPlayedAt": "2024-01-15T09:45:00.000Z",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T09:45:00.000Z",
    "profile": {
      "username": "ghostmaster"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Pet not found
- `500`: Server error

---

#### POST /api/pet/feed

Feed the ghost pet, restoring hunger to 100 and gaining 10 XP.

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "pet": {
      "id": "uuid",
      "hunger": 100,
      "experience": 160,
      "level": 2,
      "lastFedAt": "2024-01-15T10:30:00.000Z"
    },
    "xpGained": 10,
    "leveledUp": false
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
    "xpGained": 10,
    "leveledUp": true
  },
  "message": "Fed! Your ghost leveled up to 3! 🎉"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Pet not found
- `500`: Server error

**Game Mechanics:**
- Restores hunger to 100
- Grants 10 XP
- Level = 1 + floor(experience / 100)
- Updates `lastFedAt` timestamp

---

#### POST /api/pet/play

Play with the ghost pet, restoring mood to 100 and gaining 5 XP.

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "pet": {
      "id": "uuid",
      "mood": 100,
      "experience": 165,
      "level": 2,
      "lastPlayedAt": "2024-01-15T10:32:00.000Z"
    },
    "xpGained": 5,
    "leveledUp": false
  },
  "message": "Played! Your ghost is cheerful! 😊"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Pet not found
- `500`: Server error

**Game Mechanics:**
- Restores mood to 100
- Grants 5 XP
- Level = 1 + floor(experience / 100)
- Updates `lastPlayedAt` timestamp

---

#### POST /api/chat

Chat with your ghost pet using AI (OpenAI GPT).

**Authentication:** Required

**Request Body:**
```json
{
  "message": "How are you feeling today?"
}
```

**Response:**
```json
{
  "data": {
    "reply": "Boo! 👻 I'm feeling absolutely spook-tacular today! Thanks for asking!",
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

**Status Codes:**
- `200`: Success (even if OpenAI fails, returns fallback message)
- `400`: Missing or invalid message
- `401`: Unauthorized
- `404`: Pet not found
- `500`: Server error

**Constraints:**
- Message max length: 500 characters
- Response timeout: 10 seconds
- Uses GPT-3.5-turbo or GPT-4 model

---

#### POST /api/profile

Update the authenticated user's profile (username).

**Authentication:** Required

**Request Body:**
```json
{
  "username": "ghostmaster"
}
```

**Response:**
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

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid username
- `401`: Unauthorized
- `409`: Username already taken
- `500`: Server error

**Constraints:**
- Username must be 3-20 characters
- Alphanumeric and underscores only
- Must be unique across all users

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description"
}
```

### Common Error Codes

#### 400 Bad Request
Missing or invalid request parameters.

```json
{
  "error": "Bad Request",
  "message": "Missing required fields: name"
}
```

#### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 404 Not Found
Requested resource doesn't exist.

```json
{
  "error": "Not Found",
  "message": "Pet not found"
}
```

#### 409 Conflict
Resource already exists or constraint violation.

```json
{
  "error": "Conflict",
  "message": "User already has a pet"
}
```

#### 500 Internal Server Error
Unexpected server error.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Data Models

### Pet

```typescript
{
  id: string              // UUID
  userId: string          // Owner's user ID
  name: string            // Ghost name (3-20 chars)
  level: number           // Current level (>= 1)
  experience: number      // Total XP earned
  hunger: number          // 0-100 (100 = full)
  mood: number            // 0-100 (100 = happy)
  lastFedAt: string?      // ISO timestamp
  lastPlayedAt: string?   // ISO timestamp
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

### Profile

```typescript
{
  id: string              // User ID (matches auth.users)
  username: string?       // Display name (3-20 chars)
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

### LeaderboardEntry

```typescript
{
  rank: number            // Position (1, 2, 3...)
  ghostName: string       // Pet name
  level: number           // Pet level
  experience: number      // Total XP
  owner: string           // Username or "Anonymous"
  age: string             // Human-readable age
}
```

---

## Rate Limits

Current implementation has no rate limiting, but consider these recommendations for production:

- **Chat endpoint**: 10 requests/minute per user (OpenAI costs)
- **Feed/Play**: 60 requests/minute per user (prevent abuse)
- **Leaderboard**: 100 requests/minute (public endpoint)

---

## Testing

### Quick Test Flow

```bash
# 1. Get auth token (sign in via Supabase)
TOKEN="your-jwt-token"

# 2. Create pet
curl -X POST http://localhost:3000/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"TestGhost"}'

# 3. Get pet
curl http://localhost:3000/api/pet \
  -H "Authorization: Bearer $TOKEN"

# 4. Feed pet
curl -X POST http://localhost:3000/api/pet/feed \
  -H "Authorization: Bearer $TOKEN"

# 5. Play with pet
curl -X POST http://localhost:3000/api/pet/play \
  -H "Authorization: Bearer $TOKEN"

# 6. Chat with pet
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Tell me a ghost joke!"}'

# 7. Update username
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"test_user"}'

# 8. Check leaderboard
curl http://localhost:3000/api/leaderboard
```

### Automated Testing

Run the comprehensive test suite:

```bash
cd web
npx tsx scripts/test-api.ts
```

---

## Performance

### Expected Response Times

- **Leaderboard**: < 200ms
- **Pet CRUD**: < 150ms
- **Feed/Play**: < 200ms
- **Chat**: 1-3s (depends on OpenAI)

### Database Queries

All endpoints use optimized Prisma queries with:
- Indexes on frequently queried columns
- Connection pooling for serverless
- Row Level Security for data isolation

---

## Security

### Authentication
- JWT tokens validated on every protected endpoint
- Tokens expire after 1 hour (configurable in Supabase)
- Refresh tokens handled by Supabase client

### Authorization
- Row Level Security (RLS) enforces data isolation
- Users can only access their own pets and profiles
- Service role key used only for leaderboard (read-only)

### Input Validation
- All inputs sanitized and validated
- SQL injection prevented by Prisma
- XSS prevented by proper escaping

---

## Support

For issues or questions:
- Check [SETUP.md](../web/SETUP.md) for configuration help
- Check [DEPLOYMENT.md](../web/DEPLOYMENT.md) for deployment issues
- Review [API_TESTING.md](../web/API_TESTING.md) for testing examples
