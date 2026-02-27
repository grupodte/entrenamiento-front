import { Outlet, createRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { rootRoute } from './root'

function PostulacionLayout() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const desktopMedia = window.matchMedia('(min-width: 768px)')

    const applyOverflow = () => {
      const overflow = desktopMedia.matches ? 'hidden' : ''
      document.body.style.overflow = overflow
      document.documentElement.style.overflow = overflow
    }

    applyOverflow()

    if (desktopMedia.addEventListener) {
      desktopMedia.addEventListener('change', applyOverflow)
    } else {
      desktopMedia.addListener(applyOverflow)
    }

    return () => {
      if (desktopMedia.removeEventListener) {
        desktopMedia.removeEventListener('change', applyOverflow)
      } else {
        desktopMedia.removeListener(applyOverflow)postulacion laboral
      }
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#f7f7f5] px-3 md:h-screen md:overflow-hidden sm:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-start justify-center py-4 md:h-full md:items-center sm:py-6">
        <Outlet />
      </div>
    </div>
  )
}

export const postulacionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/postulacion',
  component: PostulacionLayout
})
