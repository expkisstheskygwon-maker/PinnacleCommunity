import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { uploadImageToR2 } from '@/lib/r2';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
    
    // Convert array to object
    const settings = results.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const body = await request.json();
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 만약 popups 세팅이 전달된 경우 내부의 Base64 이미지를 가로채 R2 버킷에 업로드 처리
    if (body.popups) {
      try {
        const popups = typeof body.popups === 'string' ? JSON.parse(body.popups) : body.popups;
        if (Array.isArray(popups)) {
          const processedPopups = await Promise.all(
            popups.map(async (popup: any) => {
              if (popup.image && popup.image.startsWith('data:image/')) {
                const uploadedUrl = await uploadImageToR2(popup.image);
                return { ...popup, image: uploadedUrl };
              }
              return popup;
            })
          );
          body.popups = JSON.stringify(processedPopups);
        }
      } catch (err) {
        console.error('Popups image upload preprocessing failed:', err);
      }
    }

    const statements = Object.entries(body).map(([key, value]) => {
      return db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = CURRENT_TIMESTAMP')
        .bind(key, value, value);
    });

    await db.batch(statements);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

