import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { uploadImageToR2 } from '@/lib/r2';

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

    const { title, content, category, subCategory, image: rawImage, isHtml } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 카테고리는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // Base64 이미지를 R2에 업로드
    const image = rawImage ? await uploadImageToR2(rawImage) : null;

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
        'INSERT INTO posts (title, content, authorId, category, tags, image, isHtml) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(title, content, 0, category, subCategory || null, image || null, isHtml ? 1 : 0)
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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db.prepare(`
      SELECT p.id, p.title, p.content, p.image, p.category, p.views, p.likes, p.createdAt as date, p.status, p.isHtml, u.nickname as author
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC
    `).all();

    return NextResponse.json({ success: true, posts: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { postId, title, content, category, subCategory, image: rawImage, status, views, likes, isHtml } = await request.json();
    if (!postId) return NextResponse.json({ success: false, error: '잘못된 요청: postId 누락' }, { status: 400 });

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let setClauses: string[] = [];
    let bindParams: any[] = [];

    if (title !== undefined) {
      setClauses.push('title = ?');
      bindParams.push(title);
    }
    if (content !== undefined) {
      setClauses.push('content = ?');
      bindParams.push(content);
    }
    if (category !== undefined) {
      setClauses.push('category = ?');
      bindParams.push(category);
    }
    if (subCategory !== undefined) {
      setClauses.push('tags = ?');
      bindParams.push(subCategory);
    }
    if (rawImage !== undefined) {
      const image = rawImage && rawImage.startsWith('data:') ? await uploadImageToR2(rawImage) : rawImage;
      setClauses.push('image = ?');
      bindParams.push(image);
    }
    if (status !== undefined) {
      setClauses.push('status = ?');
      bindParams.push(status);
    }
    if (views !== undefined) {
      setClauses.push('views = ?');
      bindParams.push(parseInt(views));
    }
    if (likes !== undefined) {
      setClauses.push('likes = ?');
      bindParams.push(parseInt(likes));
    }
    if (isHtml !== undefined) {
      setClauses.push('isHtml = ?');
      bindParams.push(isHtml ? 1 : 0);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: '수정할 데이터가 제공되지 않았습니다.' }, { status: 400 });
    }

    setClauses.push('updatedAt = CURRENT_TIMESTAMP');
    bindParams.push(postId);

    const query = `UPDATE posts SET ${setClauses.join(', ')} WHERE id = ?`;
    const result = await db.prepare(query).bind(...bindParams).run();

    if (!result.success) throw new Error('업데이트 실패');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    if (!postId) return NextResponse.json({ success: false, error: '잘못된 요청' }, { status: 400 });

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const result = await db.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
    if (!result.success) throw new Error('삭제 실패');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

