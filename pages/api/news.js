import { getCached, setCached } from '../../lib/cache';
import { mockNews } from '../../lib/mockData';

const CACHE_KEY = 'news_data';
const REVALIDATE = parseInt(process.env.REVALIDATE_INTERVAL || '1800');

async function fetchNewsData() {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey || apiKey === 'your_newsdata_api_key_here') {
    console.log('[news] No API key, using mock data');
    return { articles: mockNews, source: 'mock', cached: false };
  }

  try {
    // NewsData.io API - filter for Middle East conflict news
    const query = encodeURIComponent('Israel OR Iran OR "Middle East conflict" OR "US military Middle East"');
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${query}&language=en&category=politics,world&size=10`;

    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) throw new Error(`NewsData API error: ${res.status}`);
    const data = await res.json();

    const articles = (data.results || []).map((item, i) => ({
      id: item.article_id || String(i),
      title: item.title,
      description: item.description || item.content?.slice(0, 200),
      source: item.source_id || 'NewsData.io',
      pubDate: item.pubDate,
      link: item.link,
      category: item.category?.[0] || 'general',
      imageUrl: item.image_url,
    }));

    return { articles, source: 'newsdata.io', cached: false };
  } catch (err) {
    console.error('[news] API error, falling back to mock:', err.message);
    return { articles: mockNews, source: 'mock_fallback', cached: false };
  }
}

export default async function handler(req, res) {
  const cached = getCached(CACHE_KEY);
  if (cached) {
    return res.status(200).json({ ...cached, cached: true });
  }

  const data = await fetchNewsData();
  setCached(CACHE_KEY, data, REVALIDATE);

  res.setHeader('Cache-Control', `s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`);
  res.status(200).json(data);
}
