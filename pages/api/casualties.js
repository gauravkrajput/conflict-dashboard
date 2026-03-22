import { getCached, setCached } from '../../lib/cache';
import { mockCasualties } from '../../lib/mockData';

const CACHE_KEY = 'casualties_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

async function fetchACLEDData() {
  const apiKey = process.env.ACLED_API_KEY;
  const email = process.env.ACLED_EMAIL;

  if (!apiKey || apiKey === 'your_acled_api_key_here') {
    console.log('[casualties] No ACLED key, using mock data');
    return { ...mockCasualties, source: 'mock' };
  }

  try {
    // ACLED API - filter for Israel, Iran, Lebanon conflict events
    const countries = 'Israel;Iran;Lebanon;Gaza Strip;Syria';
    const encodedCountries = encodeURIComponent(countries);
    const url = `https://api.acleddata.com/acled/read?key=${apiKey}&email=${email}&country=${encodedCountries}&event_date=2024-10-01|2025-12-31&event_date_where=BETWEEN&fields=event_date,event_type,actor1,actor2,country,location,fatalities,notes&limit=500`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`ACLED API error: ${res.status}`);
    const data = await res.json();
    const events = data.data || [];

    // Aggregate stats
    const totalFatalities = events.reduce((sum, e) => sum + parseInt(e.fatalities || 0), 0);
    const totalEvents = events.length;

    // Group by actor
    const actorMap = {};
    events.forEach(e => {
      const actor = e.actor1 || 'Unknown';
      if (!actorMap[actor]) actorMap[actor] = { actor, fatalities: 0, events: 0 };
      actorMap[actor].fatalities += parseInt(e.fatalities || 0);
      actorMap[actor].events += 1;
    });

    const byActor = Object.values(actorMap)
      .sort((a, b) => b.fatalities - a.fatalities)
      .slice(0, 5);

    const recentEvents = events.slice(0, 4).map(e => ({
      date: e.event_date,
      location: `${e.location}, ${e.country}`,
      type: e.event_type,
      fatalities: parseInt(e.fatalities || 0),
    }));

    return {
      lastUpdated: new Date().toISOString(),
      source: 'ACLED',
      summary: { totalEvents, totalFatalities, totalInjured: 'N/A', displacedPersons: 'N/A' },
      byActor,
      recentEvents,
    };
  } catch (err) {
    console.error('[casualties] API error, falling back to mock:', err.message);
    return { ...mockCasualties, source: 'mock_fallback' };
  }
}

export default async function handler(req, res) {
  const cached = getCached(CACHE_KEY);
  if (cached) return res.status(200).json({ ...cached, cached: true });

  const data = await fetchACLEDData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
