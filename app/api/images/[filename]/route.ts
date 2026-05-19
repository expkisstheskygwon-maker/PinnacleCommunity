import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Next.js 15 스펙에 따라 params는 비동기로 처리(Promise)
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const bucket = env.BUCKET as any;

    if (!bucket) {
      return NextResponse.json({ error: '스토리지 바인딩을 찾을 수 없습니다.' }, { status: 500 });
    }

    // R2 버킷에서 파일 탐색
    const file = await bucket.get(filename);

    if (!file) {
      return NextResponse.json({ error: '이미지를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 스트림 및 콘텐츠 타입 획득
    const body = file.body;
    const contentType = file.httpMetadata?.contentType || 'image/png';

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable'); // 강력한 브라우저 캐싱 적용

    return new Response(body, {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error: any) {
    console.error('R2 이미지 조회 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
