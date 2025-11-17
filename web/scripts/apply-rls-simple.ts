#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })
config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyRLS() {
  console.log('🔐 Applying Row Level Security policies...\n')

  const sqlFile = resolve(__dirname, '../prisma/migrations/01_add_rls_policies.sql')
  const sql = readFileSync(sqlFile, 'utf-8')

  try {
    // Use Supabase's REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) {
      console.log('✅ RLS policies applied successfully!\n')
      console.log('📋 Next steps:')
      console.log('   1. Go to Supabase Dashboard → Database → Triggers')
      console.log('   2. Create trigger: on_auth_user_created')
      console.log('   3. Table: auth.users, Event: INSERT, Function: handle_new_user\n')
      return true
    } else {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }
  } catch (error: any) {
    console.log('⚠️  Could not apply via API. Please apply manually:\n')
    console.log('1. Go to: https://supabase.com/dashboard/project/bhdyiudgtwddysontnrb/sql')
    console.log('2. Copy contents of: web/prisma/migrations/01_add_rls_policies.sql')
    console.log('3. Paste and click "Run"\n')
    console.log(`Error: ${error.message}\n`)
    return false
  }
}

applyRLS()
