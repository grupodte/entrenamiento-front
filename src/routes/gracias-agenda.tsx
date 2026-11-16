import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const AgendaGracias = lazy(() => import('../pages/AgendaGracias'))

function AgendaGraciasRoute() {
  const { origen } = agendaGraciasRoute.useSearch()
  return <AgendaGracias fromAlumnoAgenda={origen === 'alumno'} />
}

export const agendaGraciasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gracias-agenda',
  validateSearch: (search): { origen?: 'alumno' } => (
    search.origen === 'alumno' ? { origen: 'alumno' } : {}
  ),
  component: AgendaGraciasRoute,
})
