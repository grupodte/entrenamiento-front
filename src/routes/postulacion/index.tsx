import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { postulacionRoute } from '../postulacion'

const PostulacionWizard = lazy(() => import('./PostulacionWizard'))

export const postulacionIndexRoute = createRoute({
  getParentRoute: () => postulacionRoute,
  path: '/',
  component: PostulacionWizard
})
