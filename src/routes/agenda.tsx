import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import Agenda from '../pages/Agenda'

export const agendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agenda',
  component: Agenda
})
