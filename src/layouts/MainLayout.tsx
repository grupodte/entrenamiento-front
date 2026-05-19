import { createContext, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

type HomePhaseContextValue = {
  homePhase: string
}

export const HomePhaseContext = createContext<HomePhaseContextValue>({
  homePhase: 'ready'
})

const PRELOADER_DURATION = 600
const PRELOADER_EXIT_DURATION = 300
const HERO_DELAY = 120
const CONTENT_DELAY = 240

// Skip preloader on the initial cold page load — show it only on SPA navigations back to home.
// This prevents the preloader from blocking FCP/LCP on first visit.
function isSpaNavigation(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  const visited = sessionStorage.getItem('_app_navigated')
  sessionStorage.setItem('_app_navigated', '1')
  return visited === '1'
}

export default function MainLayout() {
  const location = useRouterState({ select: (state) => state.location })
  const isHome = location.pathname === '/'
  const isPostulacion = location.pathname === '/postulacion' || location.pathname.startsWith('/postulacion/')
  const isConversionFunnel = isPostulacion || location.pathname === '/landing-page' || location.pathname === '/pre-call' || location.pathname === '/agenda' || location.pathname === '/alumno-agenda' || location.pathname === '/no-es-el-momento'
  const isScrollLocked = isPostulacion
  const isSpa = useRef(isSpaNavigation()).current
  const [homePhase, setHomePhase] = useState(isHome && isSpa ? 'preload' : 'ready')

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!isScrollLocked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
    }
  }, [isScrollLocked])

  useEffect(() => {
    if (!isHome) {
      setHomePhase('ready')
      return
    }

    // On initial cold load skip straight to ready (no preloader)
    if (!isSpa) {
      setHomePhase('hero')
      const t = setTimeout(() => setHomePhase('content'), CONTENT_DELAY)
      return () => clearTimeout(t)
    }

    setHomePhase('preload')

    const timers = [
      setTimeout(() => setHomePhase('preload-exit'), PRELOADER_DURATION),
      setTimeout(
        () => setHomePhase('header'),
        PRELOADER_DURATION + PRELOADER_EXIT_DURATION
      ),
      setTimeout(
        () => setHomePhase('hero'),
        PRELOADER_DURATION + PRELOADER_EXIT_DURATION + HERO_DELAY
      ),
      setTimeout(
        () => setHomePhase('content'),
        PRELOADER_DURATION + PRELOADER_EXIT_DURATION + CONTENT_DELAY
      )
    ]

    return () => timers.forEach(clearTimeout)
  }, [isHome])

  const showPreloader = isHome && (homePhase === 'preload' || homePhase === 'preload-exit')
  const preloaderIsExiting = homePhase === 'preload-exit'
  const showNavbar = (!isHome || ['header', 'hero', 'content'].includes(homePhase)) && !isConversionFunnel
  const showFooter = (!isHome || homePhase === 'content') && !isConversionFunnel
  const mainContainerClass = isConversionFunnel
    ? 'w-full max-w-none mx-auto p-0'
    : 'w-full max-w-none md:max-w-[1350px] mx-auto px-1 sm:px-5 md:px-5 pb-6 md:pb-8'

  const contextValue = useMemo(() => ({ homePhase }), [homePhase])

  return (
    <div className="min-h-screen flex flex-col">
      {showPreloader && (
        <div
          className={`fixed inset-0 z-[200] bg-[#FEFEFE] transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            preloaderIsExiting
              ? 'opacity-0 scale-[1.02] blur-[2px]'
              : 'opacity-100 scale-100 blur-0'
          }`}
          aria-hidden="true"
        />
      )}
      <Navbar isVisible={showNavbar} />
      <main className={`${isConversionFunnel ? '' : 'flex-1'} ${showNavbar ? 'pt-17 md:pt-16' : 'pt-0'}`}>
        <div className={mainContainerClass}>
          <HomePhaseContext.Provider value={contextValue}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </HomePhaseContext.Provider>
        </div>
      </main>
      <Footer isVisible={showFooter} />
    </div>
  )
}
