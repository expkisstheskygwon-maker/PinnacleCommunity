import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { uploadImageToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(authSession.value);
    const { title, content, category, tags, image: rawImage, isLocked, pointPrice } = (await request.json()) as any;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 카테고리는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // Base64 이미지가 업로드된 경우 R2에 저장하고 저장 경로 획득
    const image = rawImage ? await uploadImageToR2(rawImage) : null;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Insert post
    const result = await db
      .prepare(
        'INSERT INTO posts (title, content, authorId, category, tags, image, isLocked, pointPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        title, 
        content, 
        sessionData.id, 
        category, 
        tags || null, 
        image || null, 
        (isLocked === 1 || isLocked === true) ? 1 : 0, 
        (isLocked === 1 || isLocked === true) ? (pointPrice || 0) : 0
      )
      .run();

    if (!result.success) {
      throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
    }

    const postId = result.meta.last_row_id;

    // 2. Bonus: Increase user's activity score (+20 score, +50 VP)
    const userData: any = await db.prepare('SELECT score, points FROM users WHERE id = ?').bind(sessionData.id).first();
    const newScore = (userData?.score || 0) + 20;
    const newPoints = (userData?.points || 0) + 50;
    
    const { calculateLevel } = await import('@/lib/gamification');
    const newLevel = calculateLevel(newScore);

    const statements = [
      db.prepare('UPDATE users SET score = ?, level = ?, points = ? WHERE id = ?')
        .bind(newScore, newLevel, newPoints, sessionData.id),
      db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, 50, 'post_write', ?)")
        .bind(sessionData.id, postId)
    ];

    await db.batch(statements);

    return NextResponse.json(
      { 
        success: true, 
        message: '글이 성공적으로 등록되었습니다. (+20 활동점수, +50 VP)',
        postId: postId 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let countQuery = `SELECT COUNT(*) as total FROM posts p JOIN users u ON p.authorId = u.id`;
    let query = `
      SELECT p.*, u.nickname as author, u.avatar as authorAvatar, u.level,
        (SELECT COUNT(*) FROM betting_records WHERE userId = u.id AND status IN ('won', 'lost', 'half-won', 'half-lost')) as totalBets,
        (SELECT ((SUM(resultAmount) - SUM(stake)) / SUM(stake) * 100) FROM betting_records WHERE userId = u.id AND status IN ('won', 'lost', 'half-won', 'half-lost')) as roi
      FROM posts p 
      JOIN users u ON p.authorId = u.id 
    `;
    let params: any[] = [];
    let whereClauses: string[] = [];

    if (category && category !== 'all') {
      if (category.includes(',')) {
        const cats = category.split(',');
        whereClauses.push(` p.category IN (${cats.map(() => '?').join(',')}) `);
        params.push(...cats);
      } else {
        whereClauses.push(' p.category = ? ');
        params.push(category);
      }
    }

    if (tag) {
      whereClauses.push(' p.tags LIKE ? ');
      params.push(`%${tag}%`);
    }

    if (search) {
      if (search.startsWith('#')) {
        const tagName = search.substring(1);
        whereClauses.push(' p.tags LIKE ? ');
        params.push(`%${tagName}%`);
      } else {
        whereClauses.push(' (p.title LIKE ? OR p.tags LIKE ?) ');
        params.push(`%${search}%`, `%${search}%`);
      }
    }

    if (whereClauses.length > 0) {
      const whereString = ' WHERE ' + whereClauses.join(' AND ');
      query += whereString;
      countQuery += whereString;
    }

    const { results: countResults } = await db.prepare(countQuery).bind(...params).all();
    const total = countResults[0]?.total || 0;

    query += ' ORDER BY p.createdAt DESC LIMIT ? OFFSET ? ';
    params.push(limit, offset);

    const { results } = await db.prepare(query).bind(...params).all();

    return NextResponse.json({ success: true, posts: results, total });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    return NextResponse.json(
      { success: false, error: '글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
