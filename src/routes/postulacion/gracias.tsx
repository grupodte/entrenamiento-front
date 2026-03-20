import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { postulacionRoute } from '../postulacion'

const GraciasPage = lazy(() => import('./GraciasPage'))

export const postulacionGraciasRoute = createRoute({
  getParentRoute: () => postulacionRoute,
  path: 'gracias',
  component: GraciasPage
})
