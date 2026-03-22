import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

const IMPACT_COLORS = { bearish: '#ef4444', bearish_supply: '#dc2626', bullish: '#22c55e', mixed: '#f59e0b' };
const EXPOSURE_COLORS = { High: '#ef4444', 'Medium-High': '#f97316', Medium: '#f59e0b', 'Low-Medium': '#84cc16', Low: '#22c55e' };

export default function EconomicSection() {
  const { data, isLoading } = useSWR('/api/economic', fetcher, { refreshInterval: 1800000 });

  return (
    <section className="panel economic-panel">
      <div className="panel-header">
        <span className="panel-icon">🌐</span>
        <h2 className="panel-title">GLOBAL ECONOMIC IMPACT</h2>
        <span className="panel-badge">MACRO RISK</span>
      </div>

      {isLoading && <div className="loading-state">Calculating economic exposure...</div>}

      {data && (
        <>
          <div className="metric-grid">
            {(data.globalMetrics || []).map((m, i) => (
              <div key={i} className="metric-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="metric-value">{m.value}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-detail">{m.detail}</div>
              </div>
            ))}
          </div>

          <div className="econ-lower">
            <div className="sector-impact">
              <h3 className="sub-heading">SECTOR IMPACT INDEX</h3>
              {(data.mostImpactedSectors || []).map((s, i) => (
                <div key={i} className="sector-row">
                  <span className="sector-name">{s.sector}</span>
                  <div className="sector-bar-wrap">
                    <div
                      className="sector-bar"
                      style={{
                        width: `${s.impact}%`,
                        background: IMPACT_COLORS[s.direction] || '#6b7280'
                      }}
                    />
                  </div>
                  <span
                    className="sector-direction"
                    style={{ color: IMPACT_COLORS[s.direction] || '#6b7280' }}
                  >
                    {s.direction === 'bullish' ? '▲' : s.direction === 'mixed' ? '◆' : '▼'}
                  </span>
                </div>
              ))}
            </div>

            <div className="regional-exposure">
              <h3 className="sub-heading">REGIONAL EXPOSURE</h3>
              {(data.regionalExposure || []).map((r, i) => (
                <div key={i} className="region-row">
                  <span className="region-name">{r.region}</span>
                  <span
                    className="region-badge"
                    style={{
                      background: (EXPOSURE_COLORS[r.exposure] || '#6b7280') + '22',
                      color: EXPOSURE_COLORS[r.exposure] || '#6b7280',
                      border: `1px solid ${(EXPOSURE_COLORS[r.exposure] || '#6b7280')}44`
                    }}
                  >
                    {r.exposure}
                  </span>
                  <span className="region-detail">{r.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="panel-footer">Source: {data?.source || 'World Bank / IMF / GDELT'}</div>
    </section>
  );
}
