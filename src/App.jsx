import React, { useState } from 'react'
import BubblesBg from './components/BubblesBg.jsx'
import Sidebar from './components/Sidebar.jsx'
import MobileNav from './components/MobileNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import FoodCalculator from './components/FoodCalculator.jsx'
import AIAnalysis from './components/AIAnalysis.jsx'
import FeedLog from './components/FeedLog.jsx'
import MyMollies from './components/MyMollies.jsx'
import { INITIAL_MOLLIES, INITIAL_LOG } from './data.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mollies, setMollies]     = useState(INITIAL_MOLLIES)
  const [feedLog, setFeedLog]     = useState(INITIAL_LOG)

  const totalFish = mollies.reduce((s, m) => s + m.count, 0)
  const fedToday  = mollies.filter(m => m.fedToday).reduce((s, m) => s + m.count, 0)

  const tabs = {
    dashboard:  <Dashboard  mollies={mollies} setMollies={setMollies} feedLog={feedLog} setFeedLog={setFeedLog} />,
    calculator: <FoodCalculator />,
    analysis:   <AIAnalysis />,
    log:        <FeedLog    feedLog={feedLog} setFeedLog={setFeedLog} />,
    fish:       <MyMollies  mollies={mollies} setMollies={setMollies} />,
  }

  return (
    <div className="min-h-screen relative">
      <BubblesBg />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalFish={totalFish}
          fedToday={fedToday}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar (mobile) */}
          <header className="lg:hidden flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ocean-400 to-teal-500 flex items-center justify-center">
                <span className="text-sm">🐠</span>
              </div>
              <span className="font-display text-lg text-ocean-100">Molly Tank</span>
            </div>
            <div className="font-mono text-xs text-ocean-500">{totalFish} fish · {fedToday} fed</div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 lg:px-8 py-4 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto lg:max-w-none">
              {tabs[activeTab]}
            </div>
          </main>
        </div>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
