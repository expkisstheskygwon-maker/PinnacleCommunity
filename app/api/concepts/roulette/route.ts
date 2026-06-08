import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch user's current points
    const user: any = await db.prepare('SELECT points FROM users WHERE id = ?').bind(userId).first();
    if (!user) {
      return NextResponse.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if ((user.points || 0) < 100) {
      return NextResponse.json({ success: false, error: '포인트가 부족합니다. (최소 100 VP 필요)' }, { status: 400 });
    }

    // 2. Determine reward based on probabilities
    // Slot Configuration:
    // Slot 0 (0° - 60°): 50 VP (35%)
    // Slot 1 (60° - 120°): 100 VP (30%)
    // Slot 2 (120° - 180°): 200 VP (20%)
    // Slot 3 (180° - 240°): 500 VP (8%)
    // Slot 4 (240° - 300°): 1000 VP (2%)
    // Slot 5 (300° - 360°): 0 VP (꽝) (5%)

    const rand = Math.random() * 100;
    let reward = 0;
    let slotIndex = 5; // default 0 VP
    let label = '꽝 (아쉬워요)';

    if (rand < 35) {
      reward = 50;
      slotIndex = 0;
      label = '50 VP';
    } else if (rand < 65) {
      reward = 100;
      slotIndex = 1;
      label = '100 VP';
    } else if (rand < 85) {
      reward = 200;
      slotIndex = 2;
      label = '200 VP';
    } else if (rand < 93) {
      reward = 500;
      slotIndex = 3;
      label = '500 VP';
    } else if (rand < 95) {
      reward = 1000;
      slotIndex = 4;
      label = '1000 VP';
    } else {
      reward = 0;
      slotIndex = 5;
      label = '꽝';
    }

    // Spin math:
    // Calculate rotation angle. Spin at least 5 full rotations (1800 deg)
    // plus offset to center of the chosen slot.
    // Slots are ordered counter-clockwise or clockwise. Let's make it simple:
    // Slot 0 centers at 30 deg, Slot 1 at 90 deg, Slot 2 at 150 deg, Slot 3 at 210 deg, Slot 4 at 270 deg, Slot 5 at 330 deg.
    const slotCenter = slotIndex * 60 + 30;
    // We want the pointer to align at the top (which is 0 or 270 depending on setup).
    // Let's just pass slotIndex and target rotation degree to frontend.
    const finalAngle = 3600 - slotCenter; // Spin backwards or forward

    // 3. Subtract 100 VP and Grant Reward
    const netChange = reward - 100;
    const newPoints = (user.points || 0) + netChange;

    const statements = [
      db.prepare('UPDATE users SET points = ? WHERE id = ?').bind(newPoints, userId),
      db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, -100, 'roulette_spin', 'roulette')")
        .bind(userId)
    ];

    if (reward > 0) {
      statements.push(
        db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, ?, 'roulette_win', 'roulette')")
          .bind(userId, reward)
      );
    }

    await db.batch(statements);

    return NextResponse.json({
      success: true,
      reward,
      label,
      slotIndex,
      angle: finalAngle,
      newPoints
    });
  } catch (error: any) {
    console.error('Roulette error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
