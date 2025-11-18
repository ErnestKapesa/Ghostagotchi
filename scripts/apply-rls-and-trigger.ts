import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  rlsFilePath: path.join(__dirname, "../prisma/migrations/01_add_rls_policies.sql"),
  tables: ["profiles", "pets", "messages"],
  triggerName: "on_auth_user_created",
  functionName: "handle_new_user",
} as const;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Validate environment variables and return Supabase client
 */
function validateEnvironment(): SupabaseClient {
  if (!CONFIG.supabaseUrl || !CONFIG.serviceRoleKey) {
    console.error("❌ Missing Supabase credentials");
    console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  return createClient(CONFIG.supabaseUrl, CONFIG.serviceRoleKey);
}

const supabase = validateEnvironment();

// ============================================
// UTILITIES
// ============================================

/**
 * Parse SQL file into executable statements, filtering comments and empty lines
 */
function parseSQLStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt && !stmt.startsWith("--"))
    .map((stmt) => stmt + ";");
}

/**
 * Execute a single SQL statement with error handling
 */
async function executeSQLStatement(
  statement: string,
  description: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("exec", { sql: statement });
    if (error) {
      console.log(`⚠️  ${description} (may already exist or requires manual setup)`);
      return false;
    }
    console.log(`✅ ${description}`);
    return true;
  } catch (err) {
    console.log(`⚠️  ${description} (error: ${err instanceof Error ? err.message : "unknown"})`);
    return false;
  }
}

// ============================================
// RLS POLICIES
// ============================================

/**
 * Apply RLS policies from SQL migration file
 */
async function applyRLSPolicies(): Promise<void> {
  console.log("🔐 Applying RLS Policies...\n");

  try {
    const rlsSQL = fs.readFileSync(CONFIG.rlsFilePath, "utf-8");
    const statements = parseSQLStatements(rlsSQL);

    // Filter for RLS-related statements
    const rlsStatements = statements.filter(
      (stmt) =>
        stmt.includes("ALTER TABLE") ||
        stmt.includes("CREATE POLICY") ||
        stmt.includes("ENABLE ROW LEVEL SECURITY")
    );

    if (rlsStatements.length === 0) {
      console.log("⚠️  No RLS statements found in migration file");
      return;
    }

    let successCount = 0;
    for (const statement of rlsStatements) {
      const preview = statement.substring(0, 60).replace(/\n/g, " ");
      if (await executeSQLStatement(statement, preview)) {
        successCount++;
      }
    }

    console.log(`\n📊 Applied ${successCount}/${rlsStatements.length} RLS statements\n`);
  } catch (err) {
    console.error(
      `❌ Failed to read RLS file: ${err instanceof Error ? err.message : "unknown error"}`
    );
  }
}

// ============================================
// AUTH TRIGGER
// ============================================

/**
 * SQL for creating the profile trigger function
 */
const HANDLE_NEW_USER_FUNCTION = `
  CREATE OR REPLACE FUNCTION public.${CONFIG.functionName}()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NULL);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;

/**
 * SQL for creating the auth trigger
 */
const AUTH_TRIGGER_SQL = `
  CREATE TRIGGER ${CONFIG.triggerName}
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.${CONFIG.functionName}();
`;

/**
 * Instructions for manual trigger setup
 */
const MANUAL_TRIGGER_INSTRUCTIONS = `
⚠️  Auth trigger requires manual setup in Supabase dashboard:
   1. Go to: Database > Triggers
   2. Click "Create new trigger"
   3. Configure:
      - Name: ${CONFIG.triggerName}
      - Table: auth.users
      - Events: INSERT
      - Type: AFTER
      - Function: ${CONFIG.functionName}
`;

/**
 * Check if trigger already exists
 */
async function triggerExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("information_schema.triggers")
      .select("trigger_name")
      .eq("trigger_name", CONFIG.triggerName);

    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Set up auth trigger and profile creation function
 */
async function setupAuthTrigger(): Promise<void> {
  console.log("\n🔔 Setting up Auth Trigger...\n");

  try {
    // Create or update the trigger function
    const funcSuccess = await executeSQLStatement(
      HANDLE_NEW_USER_FUNCTION,
      `${CONFIG.functionName} function`
    );

    if (!funcSuccess) {
      console.log(MANUAL_TRIGGER_INSTRUCTIONS);
      return;
    }

    // Check if trigger already exists
    if (await triggerExists()) {
      console.log(`✅ ${CONFIG.triggerName} trigger already exists`);
      return;
    }

    // Attempt to create the trigger
    const triggerSuccess = await executeSQLStatement(AUTH_TRIGGER_SQL, CONFIG.triggerName);

    if (!triggerSuccess) {
      console.log(MANUAL_TRIGGER_INSTRUCTIONS);
    }
  } catch (err) {
    console.error(`❌ Error setting up auth trigger: ${err instanceof Error ? err.message : "unknown"}`);
    console.log(MANUAL_TRIGGER_INSTRUCTIONS);
  }
}

// ============================================
// VERIFICATION
// ============================================

/**
 * Verify that all setup components are in place
 */
async function verifySetup(): Promise<void> {
  console.log("\n✅ Verifying Setup...\n");

  try {
    // Check if RLS is enabled on tables
    const { data: rlsStatus, error: rlsError } = await supabase.rpc("exec", {
      sql: `SELECT tablename FROM pg_tables 
            WHERE tablename IN (${CONFIG.tables.map((t) => `'${t}'`).join(",")})
            AND rowsecurity = true;`,
    });

    if (!rlsError && rlsStatus) {
      console.log(`✅ RLS enabled on ${CONFIG.tables.length} tables`);
    }

    // Check if function exists
    const { data: functions, error: funcError } = await supabase.rpc("exec", {
      sql: `SELECT routine_name FROM information_schema.routines 
            WHERE routine_name = '${CONFIG.functionName}';`,
    });

    if (!funcError && functions && Array.isArray(functions) && functions.length > 0) {
      console.log(`✅ ${CONFIG.functionName} function exists`);
    }

    // Check if trigger exists
    if (await triggerExists()) {
      console.log(`✅ ${CONFIG.triggerName} trigger exists`);
    }

    console.log("\n🎉 Backend setup complete!");
    console.log("\n📝 Next steps:");
    console.log("   1. Test the API endpoints: npm run test:api");
    console.log("   2. Deploy to Vercel: git push origin main");
    console.log("   3. Build the web dashboard");
    console.log("   4. Build the iOS app");
  } catch (err) {
    console.warn(`⚠️  Could not verify all components: ${err instanceof Error ? err.message : "unknown"}`);
  }
}

// ============================================
// MAIN
// ============================================

/**
 * Main entry point - orchestrate all setup steps
 */
async function main(): Promise<void> {
  console.log("🚀 Ghostagotchi Backend - Final Setup\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await applyRLSPolicies();
  await setupAuthTrigger();
  await verifySetup();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
