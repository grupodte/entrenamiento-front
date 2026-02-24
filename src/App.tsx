import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

export default function App() {
  useEffect(() => {
    const preventGestureZoom = (event: Event) => {
      event.preventDefault()
    }
    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }

    document.addEventListener('gesturestart', preventGestureZoom, { passive: false })
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false })
    document.addEventListener('gestureend', preventGestureZoom, { passive: false })
    document.addEventListener('touchstart', preventPinchZoom, { passive: false })
    document.addEventListener('touchmove', preventPinchZoom, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', preventGestureZoom)
      document.removeEventListener('gesturechange', preventGestureZoom)
      document.removeEventListener('gestureend', preventGestureZoom)
      document.removeEventListener('touchstart', preventPinchZoom)
      document.removeEventListener('touchmove', preventPinchZoom)
    }
  }, [])

  return <RouterProvider router={router} />
}
