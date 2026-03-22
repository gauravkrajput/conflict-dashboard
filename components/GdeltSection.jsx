import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const fetcher = url => fetch(url).then(r => r.json());

const ToneTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date">{label}</div>
        <div className="tooltip-price" style={{ color: payload[0].value < -3 ? '#ef4444' : '#f59e0b' }}>
          Tone: {payload[0].value?.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

export default function GdeltSection() {
  const { data, isLoading } = useSWR('/api/gdelt', fetcher, { refreshInterval: 1800000 });

  const tone = data?.overallTone;
  const toneColor = tone < -4 ? '#ef4444' : tone < -2 ? '#f97316' : '#f59e0b';
  const toneLabel = tone < -4 ? 'HOSTILE' : tone < -2 ? 'TENSE' : 'NEGATIVE';

  return (
    <section className="panel gdelt-panel">
      <div className="panel-header">
        <span className="panel-icon">📊</span>
        <h2 className="panel-title">GDELT SENTIMENT MONITOR</h2>
        <span className="panel-badge">GLOBAL MEDIA</span>
      </div>

      {isLoading && <div className="loading-state">Analyzing global media signals...</div>}

      {data && (
        <>
          <div className="gdelt-top">
            <div className="tone-gauge">
              <div className="tone-label">GLOBAL MEDIA TONE</div>
              <div className="tone-score" style={{ color: toneColor }}>{tone?.toFixed(2)}</div>
              <div className="tone-status" style={{ color: toneColor, border: `1px solid ${toneColor}` }}>{toneLabel}</div>
              <div className="tone-scale">Scale: -10 (hostile) to +10 (positive)</div>
            </div>

            <div className="tone-chart">
              <h3 className="sub-heading">TONE TREND — 7 DAYS</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.toneHistory || []}>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[-8, 0]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<ToneTooltip />} />
                  <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="tone" stroke={toneColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="countries-mentions">
            <h3 className="sub-heading">TOP COUNTRIES IN GLOBAL COVERAGE</h3>
            <div className="countries-grid">
              {(data.topCountriesMentioned || []).map((c, i) => (
                <div key={i} className="country-card">
                  <div className="country-name">{c.country}</div>
                  <div className="country-mentions">{(c.mentions / 1000).toFixed(1)}K mentions</div>
                  <div
                    className="country-tone"
                    style={{ color: c.tone < -4 ? '#ef4444' : c.tone < -2 ? '#f97316' : '#f59e0b' }}
                  >
                    Tone: {c.tone?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="panel-footer">Source: GDELT Project · Global Database of Events, Language, and Tone</div>
    </section>
  );
}
