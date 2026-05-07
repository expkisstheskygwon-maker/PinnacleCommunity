import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * 봇 전용 게시글 등록 API
 * Header: x-bot-key 필요
 */
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    
    // 1. API 키 인증
    const botKey = request.headers.get('x-bot-key');
    const validKey = (env as any).BOT_API_KEY || 'pinnacle_bot_secret_2026';
    
    if (!botKey || botKey !== validKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized Bot Access' }, { status: 401 });
    }

    // 2. 데이터 파싱
    const { title, content, category, subCategory, image, externalUrl } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 3. 중복 등록 방지 (제목 기준)
    const existing = await db.prepare('SELECT id FROM posts WHERE title = ?').bind(title).first();
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already exists', postId: existing.id, duplicated: true });
    }

    // 4. 관리자 유저 확인/생성
    await db.prepare(`
      INSERT OR IGNORE INTO users (id, userId, nickname, passwordHash, email) 
      VALUES (0, 'admin', '피나클 봇', 'bot_pass_hash', 'bot@pinnacle.com')
    `).run();

    // 5. 게시글 저장
    // externalUrl이 있으면 본문 하단에 출처 링크 추가 가능
    const finalContent = externalUrl 
      ? `${content}<br/><br/><p style="color:gray; font-size:12px;">출처: <a href="${externalUrl}" target="_blank" style="color:#3b82f6;">Pinnacle Betting Resources</a></p>`
      : content;

    const result = await db
      .prepare('INSERT INTO posts (title, content, authorId, category, tags, image) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(title, finalContent, 0, category, subCategory || null, image || null)
      .run();

    return NextResponse.json({ 
      success: true, 
      message: 'Post created by bot', 
      postId: result.meta.last_row_id 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Bot API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
