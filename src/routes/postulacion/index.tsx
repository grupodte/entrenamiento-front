import { createRoute } from '@tanstack/react-router'
import { postulacionRoute } from '../postulacion'
import PostulacionWizard from './PostulacionWizard'

export const postulacionIndexRoute = createRoute({
  getParentRoute: () => postulacionRoute,
  path: '/',
  component: PostulacionWizard
})
