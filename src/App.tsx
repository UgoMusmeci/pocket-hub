import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteHeader } from './components/SiteHeader'

const CatalogHome = lazy(() =>
  import('./pages/CatalogHome').then((module) => ({ default: module.CatalogHome })),
)
const CardsPage = lazy(() =>
  import('./pages/CardsPage').then((module) => ({ default: module.CardsPage })),
)
const CardDetailPage = lazy(() =>
  import('./pages/CardDetailPage').then((module) => ({ default: module.CardDetailPage })),
)
const ExpansionsPage = lazy(() =>
  import('./pages/ExpansionsPage').then((module) => ({ default: module.ExpansionsPage })),
)
const ExpansionDetailPage = lazy(() =>
  import('./pages/ExpansionDetailPage').then((module) => ({
    default: module.ExpansionDetailPage,
  })),
)
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((module) => ({ default: module.EventsPage })),
)
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage').then((module) => ({ default: module.EventDetailPage })),
)
const DecksPage = lazy(() =>
  import('./pages/DecksPage').then((module) => ({ default: module.DecksPage })),
)
const DeckDetailPage = lazy(() =>
  import('./pages/DeckDetailPage').then((module) => ({ default: module.DeckDetailPage })),
)
const RewardsPage = lazy(() =>
  import('./pages/RewardsPage').then((module) => ({ default: module.RewardsPage })),
)
const RewardDetailPage = lazy(() =>
  import('./pages/RewardDetailPage').then((module) => ({ default: module.RewardDetailPage })),
)

function App() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="page-shell">
            <main className="cards-page">
              <article className="empty-state">
                <h3>Sto caricando la pagina</h3>
                <p>Recupero i contenuti richiesti del portale.</p>
              </article>
            </main>
          </div>
        }
      >
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
      </Suspense>
    </>
  )
}

export default App
