import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const AgendaGracias = lazy(() => import('../pages/AgendaGracias'))

export const agendaGraciasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gracias-agenda',
  component: AgendaGracias
})
