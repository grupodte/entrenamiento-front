import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const Agenda = lazy(() => import('../pages/Agenda'))

function AlumnoAgenda() {
  return <Agenda mode="alumno" />
}

export const alumnoAgendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alumno-agenda',
  component: AlumnoAgenda
})
