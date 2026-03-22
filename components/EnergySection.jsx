import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = url => fetch(url).then(r => r.json());

const RISK_COLORS = { HIGH: '#ef4444', MODERATE: '#f59e0b', DISRUPTED: '#ef4444', BELOW_AVERAGE: '#f59e0b', LOW: '#22c55e' };

function PriceCard({ item }) {
  const up = item.change >= 0;
  return (
    <div className="price-card">
      <div className="price-symbol">{item.symbol}</div>
      <div className="price-name">{item.name}</div>
      <div className="price-value">{item.unit?.startsWith('USD') ? '$' : ''}{item.price?.toFixed(2)}</div>
      <div className={`price-change ${up ? 'price-up' : 'price-down'}`}>
        {up ? '▲' : '▼'} {Math.abs(item.changePct).toFixed(2)}% ({up ? '+' : ''}{item.change?.toFixed(2)})
      </div>
      <div className="price-unit">{item.unit}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date">{label}</div>
        <div className="tooltip-price">${payload[0].value?.toFixed(2)}/bbl</div>
      </div>
    );
  }
  return null;
};

export default function EnergySection() {
  const { data, isLoading } = useSWR('/api/energy', fetcher, { refreshInterval: 1800000 });

  return (
    <section className="panel energy-panel">
      <div className="panel-header">
        <span className="panel-icon">🛢</span>
        <h2 className="panel-title">ENERGY & OIL PRICES</h2>
        <span className="panel-badge panel-badge-amber">LIVE MARKET</span>
      </div>

      {isLoading && <div className="loading-state">Loading market data...</div>}

      {data && (
        <>
          <div className="price-cards-row">
            {(data.commodities || []).map((item, i) => (
              <PriceCard key={i} item={item} />
            ))}
          </div>

          <div className="energy-lower">
            <div className="brent-chart">
              <h3 className="sub-heading">BRENT CRUDE — 21-DAY TREND</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.historicalBrent || []}>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="supply-risk">
              <h3 className="sub-heading">SUPPLY RISK MATRIX</h3>
              {data.supplyRisk && Object.entries(data.supplyRisk).map(([key, val]) => (
                <div key={key} className="risk-row">
                  <span className="risk-label">{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</span>
                  <span className="risk-badge" style={{ background: RISK_COLORS[val] + '22', color: RISK_COLORS[val], border: `1px solid ${RISK_COLORS[val]}44` }}>
                    {val.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="panel-footer">Source: {data?.source || 'Alpha Vantage'} · 30-min refresh</div>
    </section>
  );
}
