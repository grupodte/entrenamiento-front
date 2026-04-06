import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

export default function Navbar({ isVisible = true }: { isVisible?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] text-[#1A1820] border-b border-[#E8E4EE] transition-[background-color,backdrop-filter,opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'bg-[#FEFEFE]/88 backdrop-blur-[16px]' : 'bg-[#FEFEFE]'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
    >
      <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center" aria-label="DemicheriFitness - Inicio">
          <img src={logoSvg} alt="DemicheriFitness" className="h-[22px] w-auto" />
        </Link>

        {pathname !== '/agenda' && (
          <Link
            to="/pre-call"
            className={`text-[13px] uppercase tracking-[0.12em] transition-colors duration-200 ${
              pathname === '/pre-call'
                ? 'text-[#9580A6]'
                : 'text-[#1A1820]/72 hover:text-[#1A1820]'
            }`}
          >
            Empeza hoy!
          </Link>
        )}
      </div>
    </header>
  )
}
