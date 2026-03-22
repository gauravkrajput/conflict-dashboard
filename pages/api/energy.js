import { getCached, setCached } from '../../lib/cache';
import { mockEnergyPrices } from '../../lib/mockData';

const CACHE_KEY = 'energy_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

async function fetchEnergyData() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey || apiKey === 'your_alphavantage_key_here') {
    console.log('[energy] No Alpha Vantage key, using mock data');
    return { ...mockEnergyPrices, source: 'mock' };
  }

  try {
    // Fetch Brent Crude (CBOE: BNO as proxy) and WTI
    const symbols = ['BRENT', 'WTI', 'NATURAL_GAS'];
    const results = {};

    for (const commodity of symbols) {
      const url = `https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);
      const data = await res.json();

      const dataArr = data.data || [];
      if (dataArr.length >= 2) {
        const latest = parseFloat(dataArr[0].value);
        const prev = parseFloat(dataArr[1].value);
        results[commodity] = { price: latest, change: latest - prev, changePct: ((latest - prev) / prev) * 100 };
      }
    }

    const brentData = results['BRENT'] || mockEnergyPrices.commodities[0];

    return {
      lastUpdated: new Date().toISOString(),
      source: 'Alpha Vantage',
      commodities: mockEnergyPrices.commodities.map(c => {
        if (c.symbol === 'BRENT' && brentData) {
          return { ...c, price: brentData.price, change: brentData.change, changePct: brentData.changePct };
        }
        return c;
      }),
      historicalBrent: mockEnergyPrices.historicalBrent,
      supplyRisk: mockEnergyPrices.supplyRisk,
    };
  } catch (err) {
    console.error('[energy] API error, falling back to mock:', err.message);
    return { ...mockEnergyPrices, source: 'mock_fallback' };
  }
}

export default async function handler(req, res) {
  const cached = getCached(CACHE_KEY);
  if (cached) return res.status(200).json({ ...cached, cached: true });

  const data = await fetchEnergyData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
