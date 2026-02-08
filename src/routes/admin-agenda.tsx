import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import AdminAgenda from '../pages/AdminAgenda'

export const adminAgendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/agenda',
  component: AdminAgenda
})
