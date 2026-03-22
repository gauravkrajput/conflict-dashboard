import Head from 'next/head'
import Header from '../components/Header'
import NewsSection from '../components/NewsSection'
import CasualtiesSection from '../components/CasualtiesSection'
import EnergySection from '../components/EnergySection'
import EconomicSection from '../components/EconomicSection'
import GdeltSection from '../components/GdeltSection'

export default function Home() {
  return (
    <>
      <Head>
        <title>WARWATCH — US · Israel · Iran Intelligence Dashboard</title>
        <meta name="description" content="Real-time intelligence dashboard tracking the US-Israel-Iran conflict: casualties, energy prices, economic impact, and global media sentiment." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>" />
      </Head>

      <Header />

      <main className="dashboard">
        {/* Full-width news feed at top */}
        <div className="full-width">
          <NewsSection />
        </div>

        {/* Casualties + Energy side by side */}
        <CasualtiesSection />
        <EnergySection />

        {/* Economic impact full width */}
        <div className="full-width">
          <EconomicSection />
        </div>

        {/* GDELT sentiment full width */}
        <div className="full-width">
          <GdeltSection />
        </div>
      </main>

      <footer className="footer">
        WARWATCH INTELLIGENCE DASHBOARD · DATA REFRESHES EVERY 30 MINUTES · SOURCES: NEWSDATA.IO · ACLED · GDELT PROJECT · ALPHA VANTAGE
        <br />
        FOR INFORMATIONAL PURPOSES ONLY · NOT AFFILIATED WITH ANY GOVERNMENT OR INTELLIGENCE AGENCY
      </footer>
    </>
  )
}
