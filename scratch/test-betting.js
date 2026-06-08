const cp = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to run sqlite query via wrangler d1 local using temporary file
function runSql(query) {
  const tempFilePath = path.join(__dirname, 'temp.sql');
  try {
    fs.writeFileSync(tempFilePath, query, 'utf8');
    const command = `npx wrangler d1 execute pinnacle_db --local --file="${tempFilePath}"`;
    const output = cp.execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Find the JSON block in wrangler's output
    const jsonMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])[0];
    }
    return { success: true, results: [] };
  } catch (err) {
    console.error(`SQL Execution Error:`, err.message);
    if (err.stdout) console.error(`STDOUT:`, err.stdout);
    if (err.stderr) console.error(`STDERR:`, err.stderr);
    throw err;
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (e) {}
  }
}

// Seed mock database records
function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  // Clean old test records
  runSql("DELETE FROM post_purchases WHERE userId IN (100, 101);");
  runSql("DELETE FROM points_logs WHERE userId IN (100, 101);");
  runSql("DELETE FROM user_inventory WHERE userId IN (100, 101);");
  runSql("DELETE FROM notifications WHERE userId IN (100, 101);");
  runSql("DELETE FROM betting_records WHERE userId IN (100, 101);");
  runSql("DELETE FROM posts WHERE authorId IN (100, 101);");
  runSql("DELETE FROM users WHERE id IN (100, 101);");

  // Insert Users
  // User 100: 테스트유저 (points = 10000)
  runSql(`
    INSERT INTO users (id, userId, passwordHash, nickname, email, score, level, status, points, attendanceCount, nicknameColor, lastRechargeDate)
    VALUES (100, 'testuser', 'hash', '테스트유저', 'test@test.com', 0, 1, 'active', 20000, 0, NULL, NULL);
  `);
  
  // User 101: 구매자유저 (points = 2000)
  runSql(`
    INSERT INTO users (id, userId, passwordHash, nickname, email, score, level, status, points, attendanceCount, nicknameColor, lastRechargeDate)
    VALUES (101, 'buyeruser', 'hash', '구매자유저', 'buyer@test.com', 0, 1, 'active', 2000, 0, NULL, NULL);
  `);

  // Insert Inventory
  runSql("INSERT INTO user_inventory (userId, itemType, quantity) VALUES (100, 'odds_booster', 2);");
  runSql("INSERT INTO user_inventory (userId, itemType, quantity) VALUES (100, 'bet_insurance', 2);");

  // Insert Premium Locked Post written by User 100
  runSql(`
    INSERT INTO posts (id, authorId, title, content, category, isLocked, pointPrice)
    VALUES (200, 100, '프리미엄 분석글 제목', '이것은 유료 분석글 본문입니다.', 'spotlight', 1, 1000);
  `);

  console.log('✅ Database seeded successfully.');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Perform fetch call with auth cookies
async function apiCall(endpoint, method = 'GET', body = null, userId = 100) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `auth_session=${JSON.stringify({ id: userId })}`
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  };

  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  let devServerProcess = null;
  try {
    seedDatabase();

    // Start dev server
    console.log(`🚀 Starting Next.js dev server on port ${PORT}...`);
    devServerProcess = cp.spawn('npx', ['next', 'dev', '-p', PORT.toString()], {
      shell: true,
      stdio: 'inherit'
    });

    // Wait for the dev server to start
    console.log('⏳ Waiting for server to spin up...');
    let healthy = false;
    for (let i = 0; i < 20; i++) {
      await sleep(1500);
      try {
        const res = await fetch(`${BASE_URL}/api/user/profile`, {
          headers: { 'Cookie': `auth_session={"id": 100}` }
        });
        if (res.ok) {
          healthy = true;
          break;
        }
      } catch (e) {
        // Ignored, server not up yet
      }
    }

    if (!healthy) {
      throw new Error('Server failed to start in time.');
    }
    console.log('🚀 Server is running and healthy. Starting integration tests...');

    // Scenario 1: Shop Purchase (Neon Nickname Color)
    console.log('\n--- [Scenario 1] Shop Purchase (Neon Color) ---');
    const shopRes = await apiCall('/api/shop/buy', 'POST', {
      itemType: 'color_tag',
      colorValue: 'text-amber-400'
    }, 100);
    console.log('Shop buy response:', shopRes.data);
    if (!shopRes.data.success) throw new Error('Shop purchase failed');

    // Verify User 100 profile points & nicknameColor
    const profileRes1 = await apiCall('/api/user/profile', 'GET', null, 100);
    console.log('User 100 profile after purchase:', {
      points: profileRes1.data.profile.points,
      nicknameColor: profileRes1.data.profile.nicknameColor
    });
    if (profileRes1.data.profile.points !== 15000 || profileRes1.data.profile.nicknameColor !== 'text-amber-400') {
      throw new Error('User 100 points or color incorrect after purchase');
    }

    // Scenario 2: Daily Recharge
    console.log('\n--- [Scenario 2] Daily Recharge ---');
    // First try when points = 2000 (should fail as it must be < 1000)
    const rechargeFail = await apiCall('/api/user/recharge', 'POST', {}, 101);
    console.log('Recharge on 2000 VP response:', rechargeFail.data);
    if (rechargeFail.data.success) throw new Error('Recharge should have failed for 2000 VP');

    // Modify User 101 points to 500 VP to allow recharge
    console.log('Updating user 101 points to 500 VP...');
    runSql('UPDATE users SET points = 500 WHERE id = 101');

    // Try recharge again (should succeed)
    const rechargeRes = await apiCall('/api/user/recharge', 'POST', {}, 101);
    console.log('Recharge on 500 VP response:', rechargeRes.data);
    if (!rechargeRes.data.success) throw new Error('Recharge failed for 500 VP');

    // Verify User 101 profile points (500 + 5000 = 5500)
    const profileRes2 = await apiCall('/api/user/profile', 'GET', null, 101);
    console.log('User 101 profile after recharge:', profileRes2.data.profile.points);
    if (profileRes2.data.profile.points !== 5500) {
      throw new Error('User 101 points incorrect after recharge');
    }

    // Try recharging again on the same day (should fail)
    const rechargeDup = await apiCall('/api/user/recharge', 'POST', {}, 101);
    console.log('Duplicate recharge response:', rechargeDup.data);
    if (rechargeDup.data.success) throw new Error('Recharge should have failed on duplicate check');

    // Scenario 3: Place Virtual Bets
    console.log('\n--- [Scenario 3] Place Virtual Bets ---');
    
    // Bet A: Match ID 1524750 (Utah United), Won, Odds 2.50, Stake 2000, Selection "Away" (Utah United)
    console.log('Placing Bet A (No item)...');
    const betA = await apiCall('/api/betting-records', 'POST', {
      sport: 'soccer',
      league: 'USL League Two',
      match: 'Albion Colorado vs Utah United',
      matchId: '1524750',
      market: 'Match Winner',
      selection: 'Away',
      odds: 2.50,
      stake: 2000,
      isVirtual: 1
    }, 100);
    console.log('Bet A response:', betA.data);
    if (!betA.data.success) throw new Error('Bet A failed to place');

    // Bet B: Match ID 1542930 (Macara), Lost, Odds 1.80, Stake 1000, Selection "Home" (Deportivo Cuenca), odds_booster
    console.log('Placing Bet B (With odds_booster)...');
    const betB = await apiCall('/api/betting-records', 'POST', {
      sport: 'soccer',
      league: 'Copa Ecuador',
      match: 'Deportivo Cuenca Juniors vs Macara',
      matchId: '1542930',
      market: 'Match Winner',
      selection: 'Home',
      odds: 1.80,
      stake: 1000,
      isVirtual: 1,
      appliedItem: 'odds_booster'
    }, 100);
    console.log('Bet B response:', betB.data);
    if (!betB.data.success) throw new Error('Bet B failed to place');

    // Bet C: Match ID 1542930 (Macara), Lost, Odds 1.80, Stake 1000, Selection "Home" (Deportivo Cuenca), bet_insurance
    console.log('Placing Bet C (With bet_insurance)...');
    const betC = await apiCall('/api/betting-records', 'POST', {
      sport: 'soccer',
      league: 'Copa Ecuador',
      match: 'Deportivo Cuenca Juniors vs Macara',
      matchId: '1542930',
      market: 'Match Winner',
      selection: 'Home',
      odds: 1.80,
      stake: 1000,
      isVirtual: 1,
      appliedItem: 'bet_insurance'
    }, 100);
    console.log('Bet C response:', betC.data);
    if (!betC.data.success) throw new Error('Bet C failed to place');

    // Bet D: Match ID 1532114, Canceled/Void, Odds 1.90, Stake 1500, Selection "Draw"
    console.log('Placing Bet D (Void fixture)...');
    const betD = await apiCall('/api/betting-records', 'POST', {
      sport: 'soccer',
      league: 'USL W League',
      match: 'Tormenta W vs North Carolina Fusion W',
      matchId: '1532114',
      market: 'Match Winner',
      selection: 'Draw',
      odds: 1.90,
      stake: 1500,
      isVirtual: 1
    }, 100);
    console.log('Bet D response:', betD.data);
    if (!betD.data.success) throw new Error('Bet D failed to place');

    // Verify User 100 points after placing all bets:
    // Starting after shop purchase = 15000.
    // Bets: A (2000) + B (1000) + C (1000) + D (1500) = 5500 stake total.
    // Remaining points should be 9500.
    // Inventory: booster = 1, insurance = 1
    const profileRes3 = await apiCall('/api/user/profile', 'GET', null, 100);
    console.log('User 100 profile after placing bets:', {
      points: profileRes3.data.profile.points,
      inventory: profileRes3.data.profile.inventory
    });
    if (profileRes3.data.profile.points !== 9500) {
      throw new Error('User 100 points incorrect after bets');
    }

    // Scenario 4: Premium Pick Unlock
    console.log('\n--- [Scenario 4] Premium Pick Unlock ---');
    // User 101 buys post 200 (price = 1000)
    const purchaseRes = await apiCall('/api/posts/purchase', 'POST', {
      postId: 200
    }, 101);
    console.log('Post purchase response:', purchaseRes.data);
    if (!purchaseRes.data.success) throw new Error('Premium post purchase failed');

    // Check Buyer points (5500 - 1000 = 4500)
    const buyerProfile = await apiCall('/api/user/profile', 'GET', null, 101);
    console.log('Buyer (User 101) points after unlock:', buyerProfile.data.profile.points);
    if (buyerProfile.data.profile.points !== 4500) {
      throw new Error('Buyer points incorrect after unlock');
    }

    // Check Author points (3500 + 700 = 4200)
    const authorProfile = await apiCall('/api/user/profile', 'GET', null, 100);
    console.log('Author (User 100) points after unlock payout:', authorProfile.data.profile.points);
    if (authorProfile.data.profile.points !== 10200) {
      throw new Error('Author points incorrect after unlock payout');
    }

    // Scenario 5: Settlement Engine
    console.log('\n--- [Scenario 5] Auto Settlement Engine ---');
    const settleRes = await apiCall('/api/admin/settle-bets', 'POST', {}, 100);
    console.log('Settlement result:', settleRes.data);
    if (!settleRes.data.success) throw new Error('Settlement failed');

    // Let's verify final points of User 100:
    // Before Settle: 10200
    // Bet A (Utah United wins 1-3. Select Away won): Payout = 2000 * 2.50 = +5000 points.
    // Bet B (Home lost): Lost. Payout = 0 points.
    // Bet C (Home lost with insurance): Lost. Payout = 1000 * 0.50 = +500 points.
    // Bet D (Cancelled): Void. Payout = 1500 points.
    // Final Points = 10200 + 5000 + 0 + 500 + 1500 = 17200 points.
    const finalProfile = await apiCall('/api/user/profile', 'GET', null, 100);
    console.log('User 100 Final Points after settlement:', finalProfile.data.profile.points);
    console.log('User 100 Final Score/Level:', {
      score: finalProfile.data.profile.score,
      level: finalProfile.data.profile.level
    });
    if (finalProfile.data.profile.points !== 17200) {
      throw new Error(`Final points verification failed: expected 17200, got ${finalProfile.data.profile.points}`);
    }

    console.log('\n🌟 INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error('\n❌ INTEGRATION TESTS FAILED ❌');
    console.error(error);
  } finally {
    if (devServerProcess) {
      console.log('Stopping dev server...');
      devServerProcess.kill('SIGINT');
    }
  }
}

runTests();
