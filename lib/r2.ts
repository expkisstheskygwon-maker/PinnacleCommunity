import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Base64 이미지 데이터를 Cloudflare R2 버킷에 업로드하고, 조회 가능한 이미지 API URL을 리턴합니다.
 * R2 버킷 바인딩이 누락되거나 오류 발생 시, 원본 Base64 데이터를 그대로 반환하는 Fallback 방식을 취합니다.
 */
export async function uploadImageToR2(base64Data: string): Promise<string> {
  // 1. Base64 형식이 아닌 경우 (이미 URL 형태이거나 빈 값인 경우) 그대로 리턴
  if (!base64Data || !base64Data.startsWith('data:image/')) {
    return base64Data;
  }

  try {
    // 2. MIME 타입 및 Base64 실제 데이터 본문 추출
    // 예: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('올바르지 않은 Base64 이미지 형식입니다.');
    }

    const contentType = matches[1];
    const base64Content = matches[2];

    // 3. 파일 확장자 결정 (MIME 타입 기반)
    let ext = 'png';
    const subType = contentType.split('/')[1];
    if (subType) {
      // jpeg 등 예외적인 확장자 보정
      ext = subType.toLowerCase() === 'jpeg' ? 'jpg' : subType.toLowerCase();
    }

    // 4. 고유한 파일명 생성 (crypto.randomUUID() 사용)
    const filename = `${crypto.randomUUID()}.${ext}`;

    // 5. Binary Buffer 생성 (Node.js 호환 Buffer 사용)
    const buffer = Buffer.from(base64Content, 'base64');

    // 6. Cloudflare Context에서 R2 버킷 객체 획득
    const { env } = getCloudflareContext();
    const bucket = env.BUCKET as any;

    if (!bucket) {
      console.warn('R2 BUCKET 바인딩을 찾을 수 없습니다. Base64 데이터를 유지합니다.');
      return base64Data;
    }

    // 7. R2 버킷에 파일 업로드
    await bucket.put(filename, buffer, {
      httpMetadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=31536000', // 1년 캐시 유지
      },
    });

    // 8. 로컬 이미지 조회 엔드포인트 URL 반환
    return `/api/images/${filename}`;
  } catch (error) {
    console.error('R2 이미지 업로드 중 오류 발생:', error);
    // 실패 시 데이터가 날아가지 않도록 Base64 원본 데이터를 그대로 유지 (Fallback)
    return base64Data;
  }
}
