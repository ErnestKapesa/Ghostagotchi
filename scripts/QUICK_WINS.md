# Quick Wins - Remaining Test Script Improvements

## 🚀 Apply These Changes Now (5 minutes)

### 1. Refactor Remaining Test Functions
Apply the `executeApiTest()` pattern to the remaining 5 test functions:

```typescript
// testPetCreation
async function testPetCreation(token: string): Promise<TestResult> {
  return executeApiTest<Pet>(
    'Create Pet',
    2,
    'POST /api/pet',
    () => measureTime(() => apiRequest<Pet>('/api/pet', {
      method: 'POST',
      token,
      body: { name: 'TestGhost' },
    })),
    validatePet,
    (pet, duration) => {
      logger.success('Pet created successfully')
      logger.data('Name', pet.name)
      logger.data('Level', pet.level)
      logger.data('Duration', `${duration}ms`)
    }
  )
}

// testFeedAction
async function testFeedAction(token: string): Promise<TestResult> {
  return executeApiTest<FeedPlayResponse>(
    'Feed Ghost',
    4,
    'POST /api/pet/feed',
    () => measureTime(() => apiRequest<FeedPlayResponse>('/api/pet/feed', {
      method: 'POST',
      token,
    })),
    undefined, // No custom validator needed
    (data, duration) => {
      logger.success('Fed ghost successfully')
      logger.data('Hunger', data.pet.hunger)
      logger.data('XP Gained', data.xpGained)
      logger.data('Level', data.pet.level)
      logger.data('Leveled Up', data.leveledUp ? 'Yes! 🎉' : 'No')
      logger.data('Duration', `${duration}ms`)
    }
  )
}

// testPlayAction
async function testPlayAction(token: string): Promise<TestResult> {
  return executeApiTest<FeedPlayResponse>(
    'Play with Ghost',
    5,
    'POST /api/pet/play',
    () => measureTime(() => apiRequest<FeedPlayResponse>('/api/pet/play', {
      method: 'POST',
      token,
    })),
    undefined,
    (data, duration) => {
      logger.success('Played with ghost successfully')
      logger.data('Mood', data.pet.mood)
      logger.data('XP Gained', data.xpGained)
      logger.data('Level', data.pet.level)
      logger.data('Duration', `${duration}ms`)
    }
  )
}

// testChatEndpoint
async function testChatEndpoint(token: string): Promise<TestResult> {
  return executeApiTest<ChatResponse>(
    'Chat with Ghost',
    6,
    'POST /api/chat',
    () => measureTime(() => apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      token,
      body: { message: 'Hello! Tell me a ghost joke!' },
    })),
    undefined,
    (data, duration) => {
      logger.success('Ghost responded')
      logger.data('Ghost', data.reply)
      logger.data('Tokens Used', data.tokensUsed)
      logger.data('Duration', `${duration}ms`)
      if (data.error) {
        logger.warn(`API warning: ${data.error}`)
      }
    }
  )
}

// testLeaderboard
async function testLeaderboard(): Promise<TestResult> {
  return executeApiTest<LeaderboardResponse>(
    'Get Leaderboard',
    7,
    'GET /api/leaderboard',
    () => measureTime(() => apiRequest<LeaderboardResponse>('/api/leaderboard')),
    undefined,
    (data, duration) => {
      logger.success('Leaderboard retrieved')
      logger.data('Total Ghosts', data.total)
      
      if (data.leaderboard.length > 0) {
        logger.info('Top 3:')
        data.leaderboard.slice(0, GAME_CONSTANTS.LEADERBOARD_TOP_N).forEach((entry) => {
          console.log(`   ${entry.rank}. ${entry.ghostName} - Level ${entry.level} (${entry.owner})`)
        })
      }
      
      logger.data('Duration', `${duration}ms`)
    }
  )
}
```

**Impact**: Reduces code by ~100 lines, ensures consistency.

---

### 2. Add Retry to Chat Endpoint
Wrap the chat API call with retry logic:

```typescript
async function testChatEndpoint(token: string): Promise<TestResult> {
  return executeApiTest<ChatResponse>(
    'Chat with Ghost',
    6,
    'POST /api/chat',
    () => withRetry(
      () => measureTime(() => apiRequest<ChatResponse>('/api/chat', {
        method: 'POST',
        token,
        body: { message: 'Hello! Tell me a ghost joke!' },
      })),
      {
        maxRetries: 3,
        shouldRetry: (error) => 
          error.message.includes('timeout') || 
          error.message.includes('rate limit')
      }
    ),
    // ... rest of the function
  )
}
```

**Impact**: Reduces false negatives from OpenAI API flakiness.

---

### 3. Validate Stats Against Constants
Add validation to pet data:

```typescript
function validatePet(data: any): data is Pet {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.level === 'number' &&
    typeof data.hunger === 'number' &&
    typeof data.mood === 'number' &&
    typeof data.experience === 'number' &&
    // Add range validation
    data.hunger >= GAME_CONSTANTS.MIN_STAT &&
    data.hunger <= GAME_CONSTANTS.MAX_STAT &&
    data.mood >= GAME_CONSTANTS.MIN_STAT &&
    data.mood <= GAME_CONSTANTS.MAX_STAT &&
    data.level >= 1
  )
}
```

**Impact**: Catches backend bugs early.

---

## 🎯 Optional Enhancements (10 minutes)

### 4. Options Object Pattern for executeApiTest
Reduce parameter count:

```typescript
interface ApiTestOptions<T> {
  name: string
  step: number
  endpoint: string
  apiCall: () => Promise<{ result: any; duration: number }>
  validator?: (data: T) => boolean
  onSuccess?: (data: T, duration: number) => void
}

async function executeApiTest<T>(options: ApiTestOptions<T>): Promise<TestResult> {
  const { name, step, endpoint, apiCall, validator, onSuccess } = options
  // ... rest of implementation
}

// Usage
return executeApiTest({
  name: 'Get Pet',
  step: 3,
  endpoint: 'GET /api/pet',
  apiCall: () => measureTime(() => apiRequest<Pet>('/api/pet', { token })),
  validator: validatePet,
  onSuccess: (pet, duration) => {
    logger.success('Pet retrieved successfully')
    logger.data('Name', pet.name)
    logger.data('Duration', `${duration}ms`)
  }
})
```

**Impact**: More readable, easier to extend.

---

### 5. Create TestLogger Class
Better organization:

```typescript
class TestLogger {
  private indent = '   '
  
  step(num: number, msg: string) {
    console.log(`\n${num}️⃣  ${msg}`)
  }
  
  success(msg: string) {
    console.log(`${this.indent}✅ ${msg}`)
  }
  
  error(msg: string) {
    console.log(`${this.indent}❌ ${msg}`)
  }
  
  data(label: string, value: any) {
    console.log(`${this.indent}${label}: ${value}`)
  }
  
  // Add methods for structured logging
  logPet(pet: Pet) {
    this.data('Name', pet.name)
    this.data('Level', pet.level)
    this.data('Hunger', pet.hunger)
    this.data('Mood', pet.mood)
  }
}

const logger = new TestLogger()
```

**Impact**: More maintainable, reusable logging logic.

---

## 📊 Estimated Time Savings

| Improvement | Time to Implement | Time Saved per Run | ROI |
|-------------|-------------------|-------------------|-----|
| Refactor 5 functions | 5 min | 0 min | Better maintainability |
| Add retry logic | 2 min | 30 sec (fewer false negatives) | High |
| Validate stats | 1 min | 5 min (catches bugs early) | Very High |
| Options object | 3 min | 0 min | Better readability |
| TestLogger class | 5 min | 0 min | Better organization |

**Total**: 16 minutes of work for significant quality improvements.

---

## 🎯 Priority Order

1. **Refactor remaining test functions** (consistency)
2. **Add retry to chat endpoint** (reliability)
3. **Validate stats against constants** (correctness)
4. Options object pattern (readability)
5. TestLogger class (organization)

---

## ✅ Checklist

- [ ] Apply `executeApiTest()` to all 5 remaining test functions
- [ ] Add retry logic to chat endpoint
- [ ] Enhance `validatePet()` with range checks
- [ ] Run `npx tsx scripts/test-api.ts` to verify
- [ ] Run `npm run type-check` to ensure no TypeScript errors
- [ ] Update documentation if needed

---

## 🚀 Run This Command to Test

```bash
cd web
npx tsx scripts/test-api.ts
```

Expected output:
- All tests pass
- No TypeScript errors
- Cleaner, more consistent logging
- Better error messages
