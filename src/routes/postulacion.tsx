import { Outlet, createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

function PostulacionLayout() {
  return (
    <div className="min-h-[70vh]">
      <Outlet />
    </div>
  )
}

export const postulacionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/postulacion',
  component: PostulacionLayout
})
