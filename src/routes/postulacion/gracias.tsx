import { createRoute } from '@tanstack/react-router'
import { postulacionRoute } from '../postulacion'
import GraciasPage from './GraciasPage'

export const postulacionGraciasRoute = createRoute({
  getParentRoute: () => postulacionRoute,
  path: 'gracias',
  component: GraciasPage
})
