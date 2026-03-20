import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

const EDITABLE_SELECTOR = 'input, textarea, [contenteditable="true"], [data-allow-copy="true"]'

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EDITABLE_SELECTOR))
}

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
    const preventProtectedAction = (event: Event) => {
      if (isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
    }
    const preventProtectedHotkeys = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      const key = event.key.toLowerCase()

      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'p', 's', 'u', 'x'].includes(key)) {
        event.preventDefault()
      }

      if (key === 'f12') {
        event.preventDefault()
      }
    }

    document.documentElement.classList.add('content-protection-enabled')
    document.body.classList.add('content-protection-enabled')
    document.addEventListener('gesturestart', preventGestureZoom, { passive: false })
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false })
    document.addEventListener('gestureend', preventGestureZoom, { passive: false })
    document.addEventListener('touchstart', preventPinchZoom, { passive: false })
    document.addEventListener('touchmove', preventPinchZoom, { passive: false })
    document.addEventListener('contextmenu', preventProtectedAction)
    document.addEventListener('copy', preventProtectedAction)
    document.addEventListener('cut', preventProtectedAction)
    document.addEventListener('dragstart', preventProtectedAction)
    document.addEventListener('drop', preventProtectedAction)
    document.addEventListener('selectstart', preventProtectedAction)
    document.addEventListener('keydown', preventProtectedHotkeys)

    return () => {
      document.documentElement.classList.remove('content-protection-enabled')
      document.body.classList.remove('content-protection-enabled')
      document.removeEventListener('gesturestart', preventGestureZoom)
      document.removeEventListener('gesturechange', preventGestureZoom)
      document.removeEventListener('gestureend', preventGestureZoom)
      document.removeEventListener('touchstart', preventPinchZoom)
      document.removeEventListener('touchmove', preventPinchZoom)
      document.removeEventListener('contextmenu', preventProtectedAction)
      document.removeEventListener('copy', preventProtectedAction)
      document.removeEventListener('cut', preventProtectedAction)
      document.removeEventListener('dragstart', preventProtectedAction)
      document.removeEventListener('drop', preventProtectedAction)
      document.removeEventListener('selectstart', preventProtectedAction)
      document.removeEventListener('keydown', preventProtectedHotkeys)
    }
  }, [])

  return <RouterProvider router={router} />
}
