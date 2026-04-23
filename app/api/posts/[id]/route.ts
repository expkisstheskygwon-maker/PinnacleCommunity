import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch post with author info
    const post: any = await db
      .prepare(`
        SELECT p.*, u.nickname as author, u.avatar as authorAvatar, u.level as authorLevel
        FROM posts p
        JOIN users u ON p.authorId = u.id
        WHERE p.id = ?
      `)
      .bind(id)
      .first();

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. Increment view count (async-ish)
    await db
      .prepare('UPDATE posts SET views = views + 1 WHERE id = ?')
      .bind(id)
      .run();

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Fetch post detail error:', error);
    return NextResponse.json(
      { success: false, error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
