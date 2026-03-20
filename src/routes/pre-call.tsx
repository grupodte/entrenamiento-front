import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const PreCall = lazy(() => import('../pages/PreCall'))

export const preCallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pre-call',
  component: PreCall,
})
