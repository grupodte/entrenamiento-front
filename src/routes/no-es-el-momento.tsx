import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const NoEsElMomento = lazy(() => import('../pages/NoEsElMomento'))

export const noEsElMomentoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/no-es-el-momento',
  component: NoEsElMomento,
})
