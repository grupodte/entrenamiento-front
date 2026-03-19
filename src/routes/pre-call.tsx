import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import PreCall from '../pages/PreCall'

export const preCallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pre-call',
  component: PreCall,
})
