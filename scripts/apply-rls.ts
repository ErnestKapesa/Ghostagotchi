#!/usr/bin/env tsx

/**
 * Apply RLS policies to Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })
config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLS() {
  console.log('🔐 Applying Row Level Security policies...\n')

  const sqlFile = resolve(__dirname, '../prisma/migrations/01_add_rls_policies.sql')
  const sql = readFileSync(sqlFile, 'utf-8')

  // Split by statement (rough split on semicolons outside of function definitions)
  const statements = sql
    .split(/;\s*(?=(?:[^$]*\$[^$]*\$)*[^$]*$)/) // Split on ; but not inside $$ blocks
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    if (statement.includes('CREATE TRIGGER on_auth_user_created')) {
      console.log('⚠️  Skipping auth trigger (must be created in Supabase dashboard)')
      continue
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        // Try direct query if RPC doesn't work
        const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        })

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}`)
        }
      }

      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      console.log(`✅ ${preview}...`)
      successCount++
    } catch (error: any) {
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      console.log(`⚠️  ${preview}... (${error.message})`)
      errorCount++
    }
  }

  console.log(`\n📊 Summary: ${successCount} succeeded, ${errorCount} errors`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to apply them manually in Supabase SQL Editor.')
    console.log('📄 File: prisma/migrations/01_add_rls_policies.sql\n')
  } else {
    console.log('\n✅ All RLS policies applied successfully!\n')
  }
}

applyRLS().catch(console.error)
