import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

const ITEM_PRICES: Record<string, number> = {
  odds_booster: 2000,
  bet_insurance: 1500,
  color_tag: 5000
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { itemType, colorValue } = await request.json();

    if (!itemType || !ITEM_PRICES[itemType]) {
      return NextResponse.json({ success: false, error: '올바른 아이템 타입을 선택해주세요.' }, { status: 400 });
    }

    const price = ITEM_PRICES[itemType];

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Fetch user points
    const user: any = await db
      .prepare('SELECT points FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.points < price) {
      return NextResponse.json({ success: false, error: '보유한 포인트가 부족합니다.' }, { status: 400 });
    }

    const statements = [];

    if (itemType === 'color_tag') {
      if (!colorValue) {
        return NextResponse.json({ success: false, error: '원하는 닉네임 색상을 선택해주세요.' }, { status: 400 });
      }

      // 1. Deduct points and apply nickname color directly
      statements.push(
        db.prepare('UPDATE users SET points = points - ?, nicknameColor = ? WHERE id = ?')
          .bind(price, colorValue, userId)
      );

      // 2. Log point transaction
      statements.push(
        db.prepare(`
          INSERT INTO points_logs (userId, amount, reason)
          VALUES (?, ?, 'shop_buy_color')
        `).bind(userId, -price)
      );
    } else {
      // Inventory items (booster, insurance)
      // 1. Deduct points
      statements.push(
        db.prepare('UPDATE users SET points = points - ? WHERE id = ?')
          .bind(price, userId)
      );

      // 2. Ensure row exists in inventory
      statements.push(
        db.prepare('INSERT OR IGNORE INTO user_inventory (userId, itemType, quantity) VALUES (?, ?, 0)')
          .bind(userId, itemType)
      );

      // 3. Increment quantity
      statements.push(
        db.prepare('UPDATE user_inventory SET quantity = quantity + 1, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND itemType = ?')
          .bind(userId, itemType)
      );

      // 4. Log point transaction
      statements.push(
        db.prepare(`
          INSERT INTO points_logs (userId, amount, reason)
          VALUES (?, ?, 'shop_buy_item')
        `).bind(userId, -price)
      );
    }

    // Execute all atomically
    await db.batch(statements);

    return NextResponse.json({ 
      success: true, 
      message: `${itemType === 'color_tag' ? '닉네임 색상이 적용되었습니다.' : '아이템을 성공적으로 구매하여 인벤토리에 추가했습니다.'}` 
    });

  } catch (error: any) {
    console.error('Buy shop item API error:', error);
    return NextResponse.json({ success: false, error: '아이템 구매 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
