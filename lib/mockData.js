/**
 * Fallback mock data used when APIs are unavailable or keys are not set.
 * Replace with real API calls once keys are configured.
 */

export const mockNews = [
  {
    id: "1",
    title: "Iran Launches Retaliatory Strikes as Regional Tensions Escalate",
    description: "Iranian forces conducted drone and missile strikes in response to Israeli operations, marking a significant escalation in the regional conflict.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    link: "#",
    category: "military"
  },
  {
    id: "2",
    title: "US Carrier Group Repositioned to Eastern Mediterranean",
    description: "The Pentagon confirmed the movement of a carrier strike group to support Israel, as diplomatic efforts continue in parallel.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    link: "#",
    category: "military"
  },
  {
    id: "3",
    title: "Oil Prices Surge 8% Amid Strait of Hormuz Transit Concerns",
    description: "Crude oil futures jumped sharply as markets priced in the risk of disrupted shipping through the strategically vital strait.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 8 * 3600000).toISOString(),
    link: "#",
    category: "economy"
  },
  {
    id: "4",
    title: "UN Security Council Convenes Emergency Session on Middle East Crisis",
    description: "World powers gathered for an emergency meeting as the conflict threatened to draw in wider regional actors.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    link: "#",
    category: "diplomacy"
  },
  {
    id: "5",
    title: "Saudi Arabia, UAE Call for Immediate Ceasefire",
    description: "Gulf states urged restraint from all parties as the risk of broader regional war grew, offering to mediate talks.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    link: "#",
    category: "diplomacy"
  },
  {
    id: "6",
    title: "Israel Intercepts Majority of Incoming Projectiles with Iron Dome",
    description: "Israeli air defense systems successfully neutralized a large wave of incoming threats, with limited damage reported in northern Israel.",
    source: "NewsData.io",
    pubDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    link: "#",
    category: "military"
  }
];

export const mockCasualties = {
  lastUpdated: new Date().toISOString(),
  source: "ACLED",
  summary: {
    totalEvents: 847,
    totalFatalities: 3240,
    totalInjured: 8900,
    displacedPersons: 420000,
    eventsTrend: "+12% vs last week"
  },
  byActor: [
    { actor: "Israeli Forces", fatalities: 890, events: 312 },
    { actor: "Iranian Forces / IRGC", fatalities: 1240, events: 198 },
    { actor: "Hezbollah", fatalities: 670, events: 187 },
    { actor: "US Forces", fatalities: 24, events: 31 },
    { actor: "Civilian", fatalities: 416, events: 119 }
  ],
  recentEvents: [
    { date: new Date(Date.now() - 1 * 3600000).toISOString(), location: "Southern Lebanon", type: "Air strike", fatalities: 14 },
    { date: new Date(Date.now() - 4 * 3600000).toISOString(), location: "Northern Gaza", type: "Shelling", fatalities: 8 },
    { date: new Date(Date.now() - 9 * 3600000).toISOString(), location: "Syrian Border", type: "Ground battle", fatalities: 22 },
    { date: new Date(Date.now() - 16 * 3600000).toISOString(), location: "Strait of Hormuz", type: "Naval incident", fatalities: 3 },
  ]
};

export const mockEnergyPrices = {
  lastUpdated: new Date().toISOString(),
  source: "Alpha Vantage / Market Data",
  commodities: [
    { symbol: "BRENT", name: "Brent Crude Oil", price: 96.42, change: +7.83, changePct: +8.84, unit: "USD/bbl" },
    { symbol: "WTI", name: "WTI Crude Oil", price: 93.18, change: +7.21, changePct: +8.38, unit: "USD/bbl" },
    { symbol: "NATGAS", name: "Natural Gas (Henry Hub)", price: 4.82, change: +0.63, changePct: +15.02, unit: "USD/MMBtu" },
    { symbol: "RBOB", name: "Gasoline (RBOB)", price: 2.89, change: +0.19, changePct: +7.04, unit: "USD/gal" },
    { symbol: "HEATING", name: "Heating Oil", price: 3.12, change: +0.24, changePct: +8.33, unit: "USD/gal" },
  ],
  historicalBrent: [
    { date: "Mar 01", price: 82.10 },
    { date: "Mar 05", price: 83.40 },
    { date: "Mar 08", price: 84.20 },
    { date: "Mar 10", price: 85.90 },
    { date: "Mar 12", price: 87.30 },
    { date: "Mar 14", price: 86.80 },
    { date: "Mar 16", price: 88.60 },
    { date: "Mar 17", price: 89.20 },
    { date: "Mar 18", price: 91.40 },
    { date: "Mar 19", price: 94.10 },
    { date: "Mar 20", price: 95.80 },
    { date: "Mar 21", price: 96.42 },
  ],
  supplyRisk: {
    hormuzTransit: "HIGH",
    iranProduction: "DISRUPTED",
    saudiStability: "MODERATE",
    globalInventory: "BELOW_AVERAGE"
  }
};

export const mockEconomicImpact = {
  lastUpdated: new Date().toISOString(),
  source: "GDELT / World Bank",
  globalMetrics: [
    { label: "Global GDP at Risk", value: "$2.1T", trend: "up", detail: "If conflict spreads 6+ months" },
    { label: "Shipping Insurance Premium", value: "+340%", trend: "up", detail: "Red Sea / Gulf routes" },
    { label: "Inflation Pressure (CPI)", value: "+1.8pp", trend: "up", detail: "Projected 12-month impact" },
    { label: "USD Index (DXY)", value: "107.4", trend: "up", detail: "Safe haven demand" },
    { label: "Gold Price", value: "$2,387", trend: "up", detail: "All-time high zone" },
    { label: "Global Air Freight Cost", value: "+28%", trend: "up", detail: "Middle East routing" },
  ],
  mostImpactedSectors: [
    { sector: "Energy & Oil", impact: 95, direction: "bearish_supply" },
    { sector: "Shipping & Logistics", impact: 87, direction: "bearish" },
    { sector: "Defense & Aerospace", impact: 82, direction: "bullish" },
    { sector: "Airlines", impact: 76, direction: "bearish" },
    { sector: "Agriculture / Food", impact: 68, direction: "bearish" },
    { sector: "Technology (Semiconductors)", impact: 54, direction: "mixed" },
  ],
  regionalExposure: [
    { region: "Europe", exposure: "High", detail: "Energy import dependency" },
    { region: "East Asia", exposure: "High", detail: "Oil transit via Hormuz" },
    { region: "South Asia", exposure: "Medium-High", detail: "Remittances, fuel costs" },
    { region: "North America", exposure: "Medium", detail: "Inflation, oil price" },
    { region: "Sub-Saharan Africa", exposure: "Medium", detail: "Food & fuel import costs" },
    { region: "Latin America", exposure: "Low-Medium", detail: "Commodity price exposure" },
  ]
};

export const mockGdeltTone = {
  lastUpdated: new Date().toISOString(),
  source: "GDELT Project",
  overallTone: -4.82,
  toneHistory: [
    { date: "Mar 15", tone: -2.1 },
    { date: "Mar 16", tone: -2.8 },
    { date: "Mar 17", tone: -3.4 },
    { date: "Mar 18", tone: -3.9 },
    { date: "Mar 19", tone: -4.2 },
    { date: "Mar 20", tone: -4.6 },
    { date: "Mar 21", tone: -4.82 },
  ],
  topCountriesMentioned: [
    { country: "Iran", mentions: 48420, tone: -6.2 },
    { country: "Israel", mentions: 52310, tone: -4.8 },
    { country: "United States", mentions: 38900, tone: -2.1 },
    { country: "Lebanon", mentions: 21300, tone: -5.9 },
    { country: "Saudi Arabia", mentions: 14200, tone: -1.4 },
    { country: "Russia", mentions: 11800, tone: -3.2 },
  ]
};
