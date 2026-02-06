import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import LandingPage from '../pages/LandingPage'

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing-page',
  component: LandingPage
})
