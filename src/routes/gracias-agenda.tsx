import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const AgendaGracias = lazy(() => import('../pages/AgendaGracias'))

type GraciasSearch = { origen?: 'alumno'; inicio?: string }

function AgendaGraciasRoute() {
  const { origen, inicio } = agendaGraciasRoute.useSearch()
  return <AgendaGracias fromAlumnoAgenda={origen === 'alumno'} startIso={inicio} />
}

export const agendaGraciasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gracias-agenda',
  validateSearch: (search): GraciasSearch => {
    const result: GraciasSearch = {}
    if (search.origen === 'alumno') result.origen = 'alumno'
    // Solo aceptamos una fecha ISO válida; cualquier otra cosa se ignora.
    if (typeof search.inicio === 'string' && !Number.isNaN(Date.parse(search.inicio))) {
      result.inicio = search.inicio
    }
    return result
  },
  component: AgendaGraciasRoute,
})
