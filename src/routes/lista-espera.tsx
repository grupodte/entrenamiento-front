import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

const ListaEspera = lazy(() => import('../pages/ListaEspera'))

export const listaEsperaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lista-espera',
  component: ListaEspera,
})
