import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { postulacionRoute } from '../postulacion'

const NoSeleccionadoPage = lazy(() => import('./NoSeleccionadoPage'))

const searchSchema = z.object({
  reason: z.string().optional()
})

export type NoSeleccionadoSearch = z.infer<typeof searchSchema>

export const postulacionNoSeleccionadoRoute = createRoute({
  getParentRoute: () => postulacionRoute,
  path: 'no-seleccionado',
  validateSearch: (search): NoSeleccionadoSearch => searchSchema.parse(search),
  component: NoSeleccionadoPage
})
