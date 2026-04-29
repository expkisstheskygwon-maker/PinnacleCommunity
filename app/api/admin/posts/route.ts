import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, error: '관리자 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { title, content, category, subCategory } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 카테고리는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 관리자 유저(id=0)가 없으면 생성 (글 작성 시 JOIN을 위해 필요)
    try {
      await db.prepare(`
        INSERT OR IGNORE INTO users (id, userId, nickname, passwordHash, email) 
        VALUES (0, 'admin', '관리자', 'admin_pass_hash', 'admin@pinnacle.com')
      `).run();
    } catch(e) {
      console.warn("Failed to insert dummy admin user:", e);
    }

    // 관리자 글 등록
    // category는 대분류 (예: notices), subCategory는 소분류 (예: maintenance)
    // 실제 사이트의 posts 테이블 스키마에 맞춤
    const result = await db
      .prepare(
        'INSERT INTO posts (title, content, authorId, category, tags) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(title, content, 0, category, subCategory || null)
      .run();

    if (!result.success) {
      throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
    }

    return NextResponse.json(
      { 
        success: true, 
        message: '게시글이 성공적으로 발행되었습니다.',
        postId: result.meta.last_row_id 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
