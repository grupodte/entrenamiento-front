import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const LandingPage = lazy(() => import('../pages/LandingPage'))

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing-page',
  component: LandingPage
})
