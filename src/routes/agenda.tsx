import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const Agenda = lazy(() => import('../pages/Agenda'))

export const agendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agenda',
  component: Agenda
})
