import { getCached, setCached } from '../../lib/cache';
import { mockGdeltTone, mockEconomicImpact } from '../../lib/mockData';

const CACHE_KEY = 'gdelt_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

async function fetchGDELTData() {
  try {
    // GDELT Article Search API - no key needed
    const query = encodeURIComponent('"Israel" "Iran" OR "US military" "Middle East"');
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=10&format=json&timespan=24h`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`GDELT error: ${res.status}`);
    const data = await res.json();

    const articles = (data.articles || []).slice(0, 6).map((a, i) => ({
      id: String(i),
      title: a.title,
      url: a.url,
      domain: a.domain,
      seendate: a.seendate,
      tone: a.tone,
      country: a.sourcecountry,
    }));

    return {
      lastUpdated: new Date().toISOString(),
      source: 'GDELT Project',
      articles,
      overallTone: mockGdeltTone.overallTone,
      toneHistory: mockGdeltTone.toneHistory,
      topCountriesMentioned: mockGdeltTone.topCountriesMentioned,
    };
  } catch (err) {
    console.error('[gdelt] API error, falling back to mock:', err.message);
    return { ...mockGdeltTone, source: 'mock_fallback' };
  }
}

export default async function handler(req, res) {
  const cached = getCached(CACHE_KEY);
  if (cached) return res.status(200).json({ ...cached, cached: true });

  const data = await fetchGDELTData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
