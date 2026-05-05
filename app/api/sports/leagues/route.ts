import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';
  const { env } = getCloudflareContext();
  const apiKey = (env as any).APISPORTS_KEY || process.env.APISPORTS_KEY;

  if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

  let host = '';
  switch (sport) {
    case 'soccer': host = 'v3.football.api-sports.io'; break;
    case 'baseball': host = 'v1.baseball.api-sports.io'; break;
    case 'basketball': host = 'v1.basketball.api-sports.io'; break;
    default: host = `v1.${sport}.api-sports.io`;
  }

  try {
    const response = await fetch(`https://${host}/leagues`, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 3600 } // 리그 정보는 자주 안바뀌므로 1시간 캐싱
    });

    if (!response.ok) throw new Error(`API 서버 응답 오류 (${response.status}): ${host}`);
    const data = await response.json();
    
    // API-level error check
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      throw new Error(`API 오류: ${errorMsg}`);
    }

    const rawLeagues = data.response || [];

    // 국가별로 그룹화
    const grouped: Record<string, any> = {};
    
    rawLeagues.forEach((item: any) => {
      if (!item) return;
      
      // Soccer uses nested league object, others might be flat
      const leagueInfo = item.league || item;
      const countryInfo = item.country || {};
      
      const countryName = countryInfo.name || (leagueInfo.type === 'Cup' ? 'International' : 'Unknown');
      const countryFlag = countryInfo.flag || '';
      
      if (!grouped[countryName]) {
        grouped[countryName] = {
          name: countryName,
          flag: countryFlag,
          leagues: []
        };
      }
      
      if (leagueInfo.id) {
        grouped[countryName].leagues.push({
          id: leagueInfo.id,
          name: leagueInfo.name || 'Unknown League',
          logo: leagueInfo.logo || '',
          type: leagueInfo.type || 'League'
        });
      }
    });

    // 배열로 변환 및 정렬 (인기 국가 우선 또는 이름순)
    const result = Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ countries: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
