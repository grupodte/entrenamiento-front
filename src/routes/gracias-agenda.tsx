import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import AgendaGracias from '../pages/AgendaGracias'

export const agendaGraciasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gracias-agenda',
  component: AgendaGracias
})
