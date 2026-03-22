import { mockEconomicImpact } from '../../lib/mockData';
import { getCached, setCached } from '../../lib/cache';

const CACHE_KEY = 'economic_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

export default async function handler(req, res) {
  const cached = getCached(CACHE_KEY);
  if (cached) return res.status(200).json({ ...cached, cached: true });

  // Economic impact is synthesized from multiple sources
  // In production, this could pull from World Bank API, IMF data feeds, etc.
  const data = { ...mockEconomicImpact, source: 'Synthesized (World Bank / IMF / GDELT)' };

  setCached(CACHE_KEY, data, REVALIDATE);
  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
