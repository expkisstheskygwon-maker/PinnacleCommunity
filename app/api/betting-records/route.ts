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

    const { sport, league, match, matchId, market, selection, odds, stake, betDate, isVirtual, appliedItem } = await request.json();

    if (!sport || !market || !selection || !odds || !stake) {
      return NextResponse.json({ success: false, error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    if (isVirtual === 1 || isVirtual === true) {
      // 가상 배팅 처리
      const user: any = await db
        .prepare('SELECT betMoney FROM users WHERE id = ?')
        .bind(userId)
        .first();

      if (!user) {
        return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
      }

      if (user.betMoney < stake) {
        return NextResponse.json({ success: false, error: '보유한 배팅 머니가 부족합니다.' }, { status: 400 });
      }

      if (appliedItem) {
        const inventory: any = await db
          .prepare('SELECT quantity FROM user_inventory WHERE userId = ? AND itemType = ?')
          .bind(userId, appliedItem)
          .first();

        if (!inventory || inventory.quantity <= 0) {
          return NextResponse.json({ 
            success: false, 
            error: `보유한 ${appliedItem === 'odds_booster' ? '배당 부스터' : '배팅 보험'} 카드가 없습니다.` 
          }, { status: 400 });
        }
      }

      // Batch transaction to execute atomically
      const statements = [];
      
      // 1. Insert virtual bet
      statements.push(
        db.prepare(`
          INSERT INTO betting_records (userId, sport, league, match, matchId, market, selection, odds, stake, isVirtual, appliedItem, status, betDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'pending', ?)
        `).bind(userId, sport, league || null, match || null, matchId || null, market, selection, odds, stake, appliedItem || null, betDate || new Date().toISOString())
      );

      // 2. Deduct betMoney
      statements.push(
        db.prepare('UPDATE users SET betMoney = betMoney - ? WHERE id = ?').bind(stake, userId)
      );

      // 3. Log betMoney transaction
      statements.push(
        db.prepare(`
          INSERT INTO bet_money_logs (userId, amount, reason)
          VALUES (?, ?, 'bet_stake')
        `).bind(userId, -stake)
      );

      // 4. Deduct inventory if applied
      if (appliedItem) {
        statements.push(
          db.prepare('UPDATE user_inventory SET quantity = quantity - 1 WHERE userId = ? AND itemType = ?').bind(userId, appliedItem)
        );
      }

      await db.batch(statements);

      return NextResponse.json({ success: true, message: '가상 배팅이 성공적으로 접수되었습니다.' });
    } else {
      // 기존 수동 배팅 저널 저장
      await db.prepare(`
        INSERT INTO betting_records (userId, sport, league, match, matchId, market, selection, odds, stake, isVirtual, betDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `)
      .bind(userId, sport, league || null, match || null, matchId || null, market, selection, odds, stake, betDate || new Date().toISOString())
      .run();

      return NextResponse.json({ success: true, message: '베팅 기록이 저장되었습니다.' });
    }
  } catch (error: any) {
    console.error('Create betting record error:', error);
    return NextResponse.json({ success: false, error: '기록 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db.prepare('SELECT * FROM betting_records WHERE userId = ? ORDER BY betDate DESC')
      .bind(userId)
      .all();

    return NextResponse.json({ success: true, records: results });
  } catch (error: any) {
    console.error('Fetch betting records error:', error);
    return NextResponse.json({ success: false, error: '기록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { id, status, resultAmount } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID와 상태를 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 가상 배팅 검증 (수정 불가 처리)
    const record: any = await db
      .prepare('SELECT isVirtual FROM betting_records WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!record) {
      return NextResponse.json({ success: false, error: '기록을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (record.isVirtual === 1) {
      return NextResponse.json({ success: false, error: '가상 배팅 기록은 수동으로 정산할 수 없습니다.' }, { status: 403 });
    }

    await db.prepare(`
      UPDATE betting_records 
      SET status = ?, resultAmount = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND userId = ?
    `)
    .bind(status, resultAmount || 0, id, userId)
    .run();

    return NextResponse.json({ success: true, message: '상태가 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('Update betting record error:', error);
    return NextResponse.json({ success: false, error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID가 필요합니다.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const record: any = await db
      .prepare('SELECT isVirtual, status, stake FROM betting_records WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (!record) {
      return NextResponse.json({ success: false, error: '기록을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (record.isVirtual === 1) {
      if (record.status !== 'pending') {
        return NextResponse.json({ success: false, error: '정산이 완료된 가상 배팅은 삭제할 수 없습니다.' }, { status: 400 });
      }

      // 대기 중인 가상 배팅 삭제 시 베팅금 환급
      const statements = [
        db.prepare('DELETE FROM betting_records WHERE id = ? AND userId = ?').bind(id, userId),
        db.prepare('UPDATE users SET betMoney = betMoney + ? WHERE id = ?').bind(record.stake, userId),
        db.prepare(`
          INSERT INTO bet_money_logs (userId, amount, reason, referenceId)
          VALUES (?, ?, 'bet_refund', ?)
        `).bind(userId, record.stake, id)
      ];

      await db.batch(statements);
      return NextResponse.json({ success: true, message: '가상 배팅이 취소 및 환급되었습니다.' });
    }

    await db.prepare('DELETE FROM betting_records WHERE id = ? AND userId = ?')
      .bind(id, userId)
      .run();

    return NextResponse.json({ success: true, message: '기록이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Delete betting record error:', error);
    return NextResponse.json({ success: false, error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
