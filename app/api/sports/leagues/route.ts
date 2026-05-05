import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';
  const { env } = getCloudflareContext();
  const apiKey = (env as any).APISPORTS_KEY || process.env.APISPORTS_KEY;

  if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

  let hosts = [];
  if (sport === 'all') {
    hosts = [
      { name: 'soccer', host: 'v3.football.api-sports.io' },
      { name: 'baseball', host: 'v1.baseball.api-sports.io' },
      { name: 'basketball', host: 'v1.basketball.api-sports.io' }
    ];
  } else {
    let host = '';
    switch (sport.toLowerCase()) {
      case 'soccer': host = 'v3.football.api-sports.io'; break;
      case 'baseball': host = 'v1.baseball.api-sports.io'; break;
      case 'basketball': host = 'v1.basketball.api-sports.io'; break;
      default: host = `v1.${sport}.api-sports.io`;
    }
    hosts = [{ name: sport, host }];
  }

  try {
    const grouped: Record<string, any> = {};

    await Promise.allSettled(hosts.map(async ({ name, host }) => {
      const response = await fetch(`https://${host}/leagues`, {
        method: 'GET',
        headers: { 'x-apisports-key': apiKey },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.response && Array.isArray(data.response)) {
          data.response.forEach((item: any) => {
            if (!item) return;
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
                type: leagueInfo.type || 'League',
                sport: name // 어느 종목 리그인지 표시
              });
            }
          });
        }
      }
    }));

    const result = Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));
    return NextResponse.json({ countries: result });
  } catch (error: any) {
    console.error('Leagues Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
