#!/usr/bin/env tsx

/**
 * Setup verification script for Ghostagotchi backend
 * Checks if all required environment variables and dependencies are configured
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, passMsg: string, failMsg: string) {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
  })
}

function warn(name: string, message: string) {
  results.push({
    name,
    status: 'warn',
    message,
  })
}

console.log('🔍 Checking Ghostagotchi Backend Setup...\n')

// Check Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
check(
  'Node.js Version',
  majorVersion >= 18,
  `✓ Node.js ${nodeVersion} (>= 18 required)`,
  `✗ Node.js ${nodeVersion} is too old. Please upgrade to Node.js 18 or higher.`
)

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'OPENAI_API_KEY',
]

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  const isPlaceholder = value?.includes('placeholder') || value?.includes('xxxxx')
  
  if (!value) {
    check(
      envVar,
      false,
      '',
      `✗ Missing environment variable. Add to .env.local`
    )
  } else if (isPlaceholder) {
    warn(
      envVar,
      `⚠ Placeholder value detected. Replace with actual credentials.`
    )
  } else {
    check(
      envVar,
      true,
      `✓ Set (${value.substring(0, 20)}...)`,
      ''
    )
  }
}

// Check Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
  check(
    'Supabase URL Format',
    supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
    '✓ Valid Supabase URL format',
    '✗ Invalid Supabase URL format. Should be https://xxxxx.supabase.co'
  )
}

// Check DATABASE_URL format
const databaseUrl = process.env.DATABASE_URL
if (databaseUrl && !databaseUrl.includes('placeholder')) {
  check(
    'Database URL Format',
    databaseUrl.startsWith('postgresql://'),
    '✓ Valid PostgreSQL connection string',
    '✗ Invalid database URL. Should start with postgresql://'
  )
  
  if (databaseUrl.includes('6543')) {
    check(
      'Connection Pooling',
      true,
      '✓ Using connection pooling (port 6543)',
      ''
    )
  } else {
    warn(
      'Connection Pooling',
      '⚠ Not using connection pooling. Consider using port 6543 for better performance.'
    )
  }
}

// Check OpenAI API key format
const openaiKey = process.env.OPENAI_API_KEY
if (openaiKey && !openaiKey.includes('placeholder')) {
  check(
    'OpenAI API Key Format',
    openaiKey.startsWith('sk-'),
    '✓ Valid OpenAI API key format',
    '✗ Invalid OpenAI API key. Should start with sk-'
  )
}

// Check if node_modules exists
const fs = require('fs')
const nodeModulesExists = fs.existsSync(resolve(__dirname, '../node_modules'))
check(
  'Dependencies Installed',
  nodeModulesExists,
  '✓ node_modules found',
  '✗ Dependencies not installed. Run: npm install'
)

// Check if Prisma client is generated
const prismaClientExists = fs.existsSync(resolve(__dirname, '../node_modules/.prisma/client'))
if (nodeModulesExists) {
  check(
    'Prisma Client',
    prismaClientExists,
    '✓ Prisma client generated',
    '✗ Prisma client not generated. Run: npm run prisma:generate'
  )
}

// Print results
console.log('━'.repeat(70))
console.log('\n📋 Setup Check Results:\n')

let passCount = 0
let failCount = 0
let warnCount = 0

for (const result of results) {
  const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌'
  console.log(`${icon} ${result.name}`)
  console.log(`   ${result.message}\n`)
  
  if (result.status === 'pass') passCount++
  else if (result.status === 'fail') failCount++
  else warnCount++
}

console.log('━'.repeat(70))
console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`)

if (failCount > 0) {
  console.log('❌ Setup incomplete. Please fix the issues above.\n')
  console.log('📖 See SETUP.md for detailed instructions.\n')
  process.exit(1)
} else if (warnCount > 0) {
  console.log('⚠️  Setup mostly complete, but some warnings need attention.\n')
  console.log('📖 See SETUP.md for detailed instructions.\n')
  process.exit(0)
} else {
  console.log('✅ All checks passed! Your backend is ready to run.\n')
  console.log('🚀 Next steps:')
  console.log('   1. Run migrations: npm run prisma:migrate')
  console.log('   2. Start dev server: npm run dev')
  console.log('   3. Test API: curl http://localhost:3000/api/leaderboard\n')
  process.exit(0)
}
