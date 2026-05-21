import { useEffect, useState } from 'react'
import { loadCatalog } from '../lib/catalog'
import type { CatalogData } from '../types/catalog'

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const nextCatalog = await loadCatalog()
        if (!active) {
          return
        }

        setCatalog(nextCatalog)
        setError(null)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Impossibile caricare il catalogo.'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  return {
    catalog,
    loading,
    error,
  }
}
