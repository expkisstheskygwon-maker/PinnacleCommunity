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

    const {
      editType,
      startId,
      endId,
      startDate,
      endDate,
      category,
      modifyViews,
      viewsMin,
      viewsMax,
      modifyLikes,
      likesMin,
      likesMax
    } = await request.json();

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let whereClauses: string[] = [];
    let bindParams: any[] = [];

    // Filter by category if specified (and not 'all')
    if (category && category !== 'all') {
      whereClauses.push('category = ?');
      bindParams.push(category);
    }

    if (editType === 'range') {
      if (!startId && !endId) {
        return NextResponse.json({ success: false, error: '구간 범위(시작 ID 또는 종료 ID)를 입력해주세요.' }, { status: 400 });
      }
      if (startId) {
        whereClauses.push('id >= ?');
        bindParams.push(parseInt(startId));
      }
      if (endId) {
        whereClauses.push('id <= ?');
        bindParams.push(parseInt(endId));
      }
    } else if (editType === 'date') {
      if (!startDate && !endDate) {
        return NextResponse.json({ success: false, error: '기간 범위(시작일 또는 종료일)를 입력해주세요.' }, { status: 400 });
      }
      if (startDate) {
        whereClauses.push('date(createdAt) >= date(?)');
        bindParams.push(startDate);
      }
      if (endDate) {
        whereClauses.push('date(createdAt) <= date(?)');
        bindParams.push(endDate);
      }
    } else if (editType === 'category') {
      if (!category || category === 'all') {
        return NextResponse.json({ success: false, error: '카테고리를 지정해 주세요.' }, { status: 400 });
      }
    } else if (editType === 'all') {
      // No extra range filter
    } else {
      return NextResponse.json({ success: false, error: '올바르지 않은 범위 설정 유형입니다.' }, { status: 400 });
    }

    if (!modifyViews && !modifyLikes) {
      return NextResponse.json({ success: false, error: '조회수 또는 추천수 수정 옵션을 하나 이상 선택해주세요.' }, { status: 400 });
    }

    let setClauses: string[] = [];
    let setBindParams: any[] = [];

    if (modifyViews) {
      const min = Math.min(parseInt(viewsMin || 0), parseInt(viewsMax || 0));
      const max = Math.max(parseInt(viewsMin || 0), parseInt(viewsMax || 0));
      const range = max - min + 1;
      
      // ABS(RANDOM() % range) + min
      setClauses.push('views = ABS(RANDOM() % ?) + ?');
      setBindParams.push(range, min);
    }

    if (modifyLikes) {
      const min = Math.min(parseInt(likesMin || 0), parseInt(likesMax || 0));
      const max = Math.max(parseInt(likesMin || 0), parseInt(likesMax || 0));
      const range = max - min + 1;

      setClauses.push('likes = ABS(RANDOM() % ?) + ?');
      setBindParams.push(range, min);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `UPDATE posts SET ${setClauses.join(', ')} ${whereStr}`;

    // Combine bindings: set parameters first, then where clause parameters
    const allBindParams = [...setBindParams, ...bindParams];

    const result = await db.prepare(query).bind(...allBindParams).run();

    return NextResponse.json({
      success: true,
      message: '성공적으로 조회수/추천수가 일괄 수정되었습니다.',
      count: result.meta.changes || 0
    });

  } catch (error: any) {
    console.error('Bulk edit views/likes error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
