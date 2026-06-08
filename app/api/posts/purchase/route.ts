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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ success: false, error: '분석글 ID가 필요합니다.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch post details
    const post: any = await db
      .prepare('SELECT id, authorId, title, isLocked, pointPrice FROM posts WHERE id = ?')
      .bind(postId)
      .first();

    if (!post) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. Check if post is actually locked
    if (post.isLocked !== 1 || (post.pointPrice || 0) <= 0) {
      return NextResponse.json({ success: true, message: '잠금 해제가 필요 없는 게시글입니다.' });
    }

    // 3. Check if owner of the post is trying to buy it
    if (post.authorId === userId) {
      return NextResponse.json({ success: true, message: '본인의 분석글은 자동으로 열람 가능합니다.' });
    }

    // 4. Check if already purchased
    const purchase: any = await db
      .prepare('SELECT id FROM post_purchases WHERE userId = ? AND postId = ?')
      .bind(userId, postId)
      .first();

    if (purchase) {
      return NextResponse.json({ success: true, message: '이미 구매 완료된 분석글입니다.' });
    }

    // 5. Fetch buyer balance
    const buyer: any = await db
      .prepare('SELECT points FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!buyer) {
      return NextResponse.json({ success: false, error: '구매자 정보를 조회할 수 없습니다.' }, { status: 404 });
    }

    const price = post.pointPrice;

    if (buyer.points < price) {
      return NextResponse.json({ success: false, error: '보유한 포인트가 부족합니다.' }, { status: 400 });
    }

    // 6. Calculate commissions (70% author, 30% system fee/burn)
    const authorWinnings = Math.floor(price * 0.70);

    const statements = [
      // 1. Deduct points from buyer
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?').bind(price, userId),
      // 2. Add points to author
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').bind(authorWinnings, post.authorId),
      // 3. Record purchase
      db.prepare('INSERT INTO post_purchases (userId, postId, price) VALUES (?, ?, ?)').bind(userId, postId, price),
      // 4. Log point transaction for buyer
      db.prepare(`
        INSERT INTO points_logs (userId, amount, reason, referenceId)
        VALUES (?, ?, 'pick_unlock', ?)
      `).bind(userId, -price, postId),
      // 5. Log point transaction for author
      db.prepare(`
        INSERT INTO points_logs (userId, amount, reason, referenceId)
        VALUES (?, ?, 'pick_sold', ?)
      `).bind(post.authorId, authorWinnings, postId),
      // 6. Send notification to author
      db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
        .bind(
          post.authorId,
          `💰 분석글 판매 수익 적립 (+${authorWinnings.toLocaleString()} VP)`,
          `올리신 [${post.title}] 분석글을 다른 회원이 구매하여 70% 수익금이 입금되었습니다.`
        )
    ];

    await db.batch(statements);

    return NextResponse.json({ 
      success: true, 
      message: '분석글이 잠금 해제되었습니다.',
      postId 
    });

  } catch (error: any) {
    console.error('Purchase post API error:', error);
    return NextResponse.json({ success: false, error: '게시글 구매 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
