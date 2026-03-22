import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

function StatBox({ label, value, sub, alert }) {
  return (
    <div className={`stat-box ${alert ? 'stat-alert' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function CasualtiesSection() {
  const { data, isLoading } = useSWR('/api/casualties', fetcher, { refreshInterval: 1800000 });

  const formatNum = n => typeof n === 'number' ? n.toLocaleString() : n;

  return (
    <section className="panel casualties-panel">
      <div className="panel-header">
        <span className="panel-icon">⚠</span>
        <h2 className="panel-title">CASUALTY TRACKER</h2>
        <span className="panel-badge panel-badge-red">ACLED DATA</span>
      </div>

      {isLoading && <div className="loading-state">Loading conflict data...</div>}

      {data && (
        <>
          <div className="stats-row">
            <StatBox label="Total Fatalities" value={formatNum(data.summary?.totalFatalities)} alert />
            <StatBox label="Conflict Events" value={formatNum(data.summary?.totalEvents)} sub={data.summary?.eventsTrend} />
            <StatBox label="Injured" value={formatNum(data.summary?.totalInjured)} />
            <StatBox label="Displaced" value={formatNum(data.summary?.displacedPersons)} />
          </div>

          <div className="casualties-lower">
            <div className="by-actor">
              <h3 className="sub-heading">BY ACTOR</h3>
              {(data.byActor || []).map((a, i) => (
                <div key={i} className="actor-row">
                  <span className="actor-name">{a.actor}</span>
                  <div className="actor-bar-wrap">
                    <div
                      className="actor-bar"
                      style={{ width: `${Math.min(100, (a.fatalities / (data.byActor[0]?.fatalities || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="actor-count">{a.fatalities?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="recent-events">
              <h3 className="sub-heading">RECENT INCIDENTS</h3>
              {(data.recentEvents || []).map((e, i) => (
                <div key={i} className="event-row">
                  <div className="event-type-tag">{e.type}</div>
                  <div className="event-info">
                    <span className="event-location">{e.location}</span>
                    <span className="event-fatalities">{e.fatalities} killed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="panel-footer">Source: {data?.source || 'ACLED'} · Armed Conflict Location & Event Data</div>
    </section>
  );
}
