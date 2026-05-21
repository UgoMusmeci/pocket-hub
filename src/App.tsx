import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteHeader } from './components/SiteHeader'
import { CardDetailPage } from './pages/CardDetailPage'
import { CatalogHome } from './pages/CatalogHome'
import { CardsPage } from './pages/CardsPage'
import { DeckDetailPage } from './pages/DeckDetailPage'
import { DecksPage } from './pages/DecksPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { EventsPage } from './pages/EventsPage'
import { ExpansionDetailPage } from './pages/ExpansionDetailPage'
import { ExpansionsPage } from './pages/ExpansionsPage'
import { RewardDetailPage } from './pages/RewardDetailPage'
import { RewardsPage } from './pages/RewardsPage'

function App() {
  return (
    <>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<CatalogHome />} />
        <Route path="/carte" element={<CardsPage />} />
        <Route path="/carte/:cardId" element={<CardDetailPage />} />
        <Route path="/espansioni" element={<ExpansionsPage />} />
        <Route path="/espansioni/:setId" element={<ExpansionDetailPage />} />
        <Route path="/eventi" element={<EventsPage />} />
        <Route path="/eventi/:eventSlug" element={<EventDetailPage />} />
        <Route path="/mazzi" element={<DecksPage />} />
        <Route path="/mazzi/:slug" element={<DeckDetailPage />} />
        <Route path="/ricompense" element={<RewardsPage />} />
        <Route path="/ricompense/:rewardSlug" element={<RewardDetailPage />} />
        <Route path="/cards/:cardId" element={<CardDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
