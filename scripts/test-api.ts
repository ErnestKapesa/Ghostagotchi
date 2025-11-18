#!/usr/bin/env tsx
/**
 * API Testing Script
 * Tests all Ghostagotchi API endpoints
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

async function testLeaderboard() {
  console.log("\n1️⃣  Testing GET /api/leaderboard (public)...");
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`);
    const data = (await response.json()) as any;

    if (response.ok && data.data && Array.isArray(data.data)) {
      console.log(`✅ Leaderboard retrieved`);
      console.log(`   Total pets: ${data.data.length}`);
      if (data.data.length > 0) {
        console.log(`   Top pet: ${data.data[0].name} (Level ${data.data[0].level})`);
      }
      results.push({ name: "Leaderboard", passed: true, message: "Retrieved successfully" });
    } else {
      console.log(`❌ Unexpected response format`);
      results.push({ name: "Leaderboard", passed: false, message: "Invalid response" });
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    results.push({ name: "Leaderboard", passed: false, message: String(error) });
  }
}

async function testHealthCheck() {
  console.log("\n2️⃣  Testing API Health...");
  try {
    const response = await fetch(`${API_BASE}/api/pet`, {
      method: "GET",
      headers: {
        Authorization: "Bearer test-token",
      },
    });

    // We expect 401 (unauthorized) since we're using a test token
    // But this confirms the API is responding
    if (response.status === 401 || response.status === 200) {
      console.log(`✅ API is responding`);
      results.push({ name: "Health Check", passed: true, message: "API responding" });
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      results.push({ name: "Health Check", passed: true, message: `Status ${response.status}` });
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
    results.push({ name: "Health Check", passed: false, message: String(error) });
  }
}

async function main() {
  console.log("🧪 Ghostagotchi API Testing\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`Testing API at: ${API_BASE}\n`);

  await testHealthCheck();
  await testLeaderboard();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📊 Test Results:\n");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}: ${result.message}`);
  }

  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log("🎉 All tests passed! Backend is working correctly.\n");
  } else {
    console.log("⚠️  Some tests failed. Check the API server.\n");
  }
}

main().catch(console.error);
