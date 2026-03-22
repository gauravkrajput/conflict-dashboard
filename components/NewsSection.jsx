import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

const CATEGORY_COLORS = {
  military: '#ef4444',
  economy: '#f59e0b',
  diplomacy: '#3b82f6',
  general: '#6b7280',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

export default function NewsSection() {
  const { data, error, isLoading } = useSWR('/api/news', fetcher, { refreshInterval: 1800000 });

  return (
    <section className="panel news-panel">
      <div className="panel-header">
        <span className="panel-icon">📡</span>
        <h2 className="panel-title">LATEST INTELLIGENCE</h2>
        <span className="panel-badge">{data?.articles?.length || 0} REPORTS</span>
      </div>

      {isLoading && <div className="loading-state">Scanning news feeds...</div>}
      {error && <div className="error-state">Feed unavailable</div>}

      {data?.articles && (
        <div className="news-grid">
          {data.articles.map((article, i) => (
            <a
              key={article.id}
              href={article.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
              style={{ '--accent': CATEGORY_COLORS[article.category] || '#6b7280', animationDelay: `${i * 0.07}s` }}
            >
              <div className="news-card-top">
                <span className="news-category" style={{ color: CATEGORY_COLORS[article.category] || '#6b7280' }}>
                  {(article.category || 'general').toUpperCase()}
                </span>
                <span className="news-time">{timeAgo(article.pubDate)}</span>
              </div>
              <h3 className="news-title">{article.title}</h3>
              {article.description && (
                <p className="news-desc">{article.description.slice(0, 120)}...</p>
              )}
              <div className="news-source">↗ {article.source}</div>
            </a>
          ))}
        </div>
      )}
      <div className="panel-footer">Source: {data?.source || 'NewsData.io'} · Refreshes every 30 min</div>
    </section>
  );
}
