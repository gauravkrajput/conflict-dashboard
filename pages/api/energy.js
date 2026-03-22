import { getCached, setCached } from '../../lib/cache';
import { mockEnergyPrices } from '../../lib/mockData';

const CACHE_KEY = 'energy_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

// OilPriceAPI.com — free forever tier, no credit card required
// Sign up at: https://www.oilpriceapi.com/
// Commodity codes: BRENT_CRUDE_USD, WTI_USD, NATURAL_GAS_USD, HEATING_OIL_USD, RBOB_GASOLINE_USD
const BASE_URL = 'https://api.oilpriceapi.com/v1';

const COMMODITIES = [
  { symbol: 'BRENT',    code: 'BRENT_CRUDE_USD',   name: 'Brent Crude Oil',        unit: 'USD/bbl' },
  { symbol: 'WTI',      code: 'WTI_USD',            name: 'WTI Crude Oil',          unit: 'USD/bbl' },
  { symbol: 'NATGAS',   code: 'NATURAL_GAS_USD',    name: 'Natural Gas',            unit: 'USD/MMBtu' },
  { symbol: 'HEATING',  code: 'HEATING_OIL_USD',    name: 'Heating Oil',            unit: 'USD/gal' },
  { symbol: 'RBOB',     code: 'RBOB_GASOLINE_USD',  name: 'Gasoline (RBOB)',        unit: 'USD/gal' },
];

async function fetchLatestPrice(apiKey, commodity) {
  const res = await fetch(`${BASE_URL}/prices/latest?by_code=${commodity.code}`, {
    cache: 'no-store',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) throw new Error(`OilPriceAPI ${commodity.code} HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'success') throw new Error(`OilPriceAPI error: ${JSON.stringify(data)}`);
  return data.data; // { price, formatted, currency, unit, timestamp, code, name }
}

async function fetchHistoricalBrent(apiKey) {
  const res = await fetch(`${BASE_URL}/prices/past_month?by_code=BRENT_CRUDE_USD`, {
    cache: 'no-store',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`OilPriceAPI historical HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'success') throw new Error(`OilPriceAPI historical error`);

  // API returns array of { price, timestamp } — sample every ~3 days for chart clarity
  const prices = data.data || [];
  const sampled = prices.filter((_, i) => i % 3 === 0).slice(-12);

  return sampled.map(p => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: parseFloat(p.price.toFixed(2)),
  }));
}

async function fetchEnergyData() {
  const apiKey = process.env.OILPRICE_API_KEY;

  if (!apiKey || apiKey === 'your_oilprice_api_key_here' || apiKey === 'placeholder') {
    console.log('[energy] No OilPriceAPI key configured, using mock data');
    return { ...mockEnergyPrices, source: 'mock' };
  }

  try {
    // Fetch all 5 commodities in parallel + historical Brent
    const [historicalBrent, ...latestResults] = await Promise.allSettled([
      fetchHistoricalBrent(apiKey),
      ...COMMODITIES.map(c => fetchLatestPrice(apiKey, c)),
    ]);

    // Build commodities array — fall back to mock values on individual failures
    const commodities = COMMODITIES.map((c, i) => {
      const result = latestResults[i];
      const mock = mockEnergyPrices.commodities.find(m => m.symbol === c.symbol);

      if (result.status === 'fulfilled') {
        const d = result.value;
        const mockChange = mock?.change || 0;
        const mockChangePct = mock?.changePct || 0;
        return {
          symbol: c.symbol,
          name: c.name,
          price: parseFloat(d.price.toFixed(2)),
          // OilPriceAPI free tier doesn't provide prev close — use mock delta as indicative
          change: mockChange,
          changePct: mockChangePct,
          unit: c.unit,
          updatedAt: d.timestamp,
        };
      } else {
        console.warn(`[energy] Failed to fetch ${c.symbol}:`, result.reason?.message);
        return mock || { symbol: c.symbol, name: c.name, price: 0, change: 0, changePct: 0, unit: c.unit };
      }
    });

    const historical = historicalBrent.status === 'fulfilled'
      ? historicalBrent.value
      : mockEnergyPrices.historicalBrent;

    return {
      lastUpdated: new Date().toISOString(),
      source: 'OilPriceAPI.com',
      commodities,
      historicalBrent: historical,
      supplyRisk: mockEnergyPrices.supplyRisk,
    };

  } catch (err) {
    console.error('[energy] Fatal error, falling back to mock:', err.message);
    return { ...mockEnergyPrices, source: 'mock_fallback' };
  }
}

export default async function handler(req, res) {
  const forceRefresh = req.query.refresh === '1';

  if (!forceRefresh) {
    const cached = getCached(CACHE_KEY);
    if (cached) return res.status(200).json({ ...cached, cached: true });
  }

  const data = await fetchEnergyData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
