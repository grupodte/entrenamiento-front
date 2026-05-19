import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { indexRoute } from './routes/index'
import { landingRoute } from './routes/landing-page'
import { agendaRoute } from './routes/agenda'
import { agendaGraciasRoute } from './routes/gracias-agenda'
import { alumnoAgendaRoute } from './routes/alumno-agenda'
import { preCallRoute } from './routes/pre-call'
import { noEsElMomentoRoute } from './routes/no-es-el-momento'
import { postulacionRoute } from './routes/postulacion'
import { postulacionIndexRoute } from './routes/postulacion/index'
import { postulacionGraciasRoute } from './routes/postulacion/gracias'
import { postulacionNoSeleccionadoRoute } from './routes/postulacion/no-seleccionado'

const routeTree = rootRoute.addChildren([
  indexRoute,
  landingRoute,
  preCallRoute,
  noEsElMomentoRoute,
  agendaRoute,
  agendaGraciasRoute,
  alumnoAgendaRoute,
  postulacionRoute.addChildren([
    postulacionIndexRoute,
    postulacionGraciasRoute,
    postulacionNoSeleccionadoRoute
  ])
])

export const router = createRouter({
  routeTree
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
