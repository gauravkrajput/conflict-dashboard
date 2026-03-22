import { getCached, setCached } from '../../lib/cache';
import { mockNews } from '../../lib/mockData';

const CACHE_KEY = 'news_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

// ─── QUERY STRATEGY ───────────────────────────────────────────────────────────
// We run 3 separate API calls with different query strategies and merge+dedupe
// results, sorted by publish date. This maximises coverage within free tier
// (200 req/day). At 30-min refresh = 48 req/day × 3 queries = 144 req/day,
// leaving headroom for other usage.
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_CONFIGS = [
  {
    // Query 1: Operation codenames + key 2026 escalation terms (highest precision)
    label: 'operations',
    params: {
      q: '"Operation Epic Fury" OR "Roaring Lion" OR "Twelve-Day War" OR "Israel Iran war 2026" OR "US-Israeli conflict with Iran"',
      language: 'en',
      tag: 'war',
      sentiment: 'negative',
      size: 5,
    },
  },
  {
    // Query 2: Key locations and infrastructure (Strait of Hormuz, energy targets)
    label: 'locations',
    params: {
      q: '"Strait of Hormuz" OR "Kharg Island" OR "South Pars" OR "ballistic missile" OR "cyber offensive Iran"',
      language: 'en',
      region: 'iran,israel',
      tag: 'politics',
      sentiment: 'negative',
      size: 5,
    },
  },
  {
    // Query 3: Key figures + broad conflict terms filtered by country source
    label: 'figures',
    params: {
      q: '"Ali Khamenei" OR "Mojtaba Khamenei" OR "Tel Aviv strike" OR "Iran missile" OR "Israel airstrike"',
      language: 'en',
      country: 'us,il,ir,gb',
      size: 5,
    },
  },
];

function buildUrl(apiKey, params) {
  const base = 'https://newsdata.io/api/1/latest'; // /latest endpoint always returns freshest articles
  const qs = new URLSearchParams({ apikey: apiKey, ...params });
  return `${base}?${qs.toString()}`;
}

function normaliseArticle(item, i) {
  return {
    id: item.article_id || `art-${i}`,
    title: item.title || '',
    description: item.description || item.content?.slice(0, 220) || '',
    source: item.source_id || item.source_name || 'NewsData.io',
    pubDate: item.pubDate || item.publishedAt || new Date().toISOString(),
    link: item.link || '#',
    category: Array.isArray(item.category) ? item.category[0] : (item.category || 'general'),
    sentiment: item.sentiment || null,
    country: item.country?.[0] || null,
  };
}

async function runQuery(apiKey, config) {
  const url = buildUrl(apiKey, config.params);
  const res = await fetch(url, {
    // No Next.js cache — we handle caching ourselves so we always get fresh data
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`NewsData [${config.label}] HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();

  if (data.status !== 'success') {
    throw new Error(`NewsData [${config.label}] API error: ${data.results?.message || JSON.stringify(data)}`);
  }

  return (data.results || []).map(normaliseArticle);
}

async function fetchNewsData() {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey || apiKey === 'your_newsdata_api_key_here' || apiKey === 'placeholder') {
    console.log('[news] No API key configured, using mock data');
    return { articles: mockNews, source: 'mock', cached: false, queriesRun: 0 };
  }

  const results = [];
  const errors = [];

  // Run all 3 queries, collecting successes and logging failures
  await Promise.allSettled(
    QUERY_CONFIGS.map(config =>
      runQuery(apiKey, config)
        .then(articles => results.push(...articles))
        .catch(err => {
          console.error(`[news] Query "${config.label}" failed:`, err.message);
          errors.push(config.label);
        })
    )
  );

  // If all 3 queries failed, fall back to mock
  if (results.length === 0) {
    console.warn('[news] All queries failed, falling back to mock data. Errors:', errors);
    return { articles: mockNews, source: 'mock_fallback', cached: false, errors };
  }

  // Deduplicate by article_id, then sort newest first
  const seen = new Set();
  const unique = results.filter(a => {
    if (!a.title || seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Cap at 12 articles for the UI grid
  const articles = unique.slice(0, 12);

  console.log(`[news] Fetched ${articles.length} unique articles (${errors.length} queries failed: ${errors.join(', ') || 'none'})`);

  return {
    articles,
    source: 'newsdata.io',
    cached: false,
    queriesRun: QUERY_CONFIGS.length - errors.length,
    failedQueries: errors,
    fetchedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  // Allow manual cache-bust via ?refresh=1 (useful for testing)
  const forceRefresh = req.query.refresh === '1';

  if (!forceRefresh) {
    const cached = getCached(CACHE_KEY);
    if (cached) {
      return res.status(200).json({ ...cached, cached: true });
    }
  }

  const data = await fetchNewsData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
