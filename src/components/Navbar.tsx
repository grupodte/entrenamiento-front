import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import burgerIcon from '../assets/burger.svg'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/landing-page', label: 'Landing Page' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/postulacion', label: 'Postulacion' }
]

export default function Navbar({ isVisible = true }: { isVisible?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

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
        <Link
          to="/"
          className="inline-flex items-center"
          onClick={closeMenu}
          aria-label="DemicheriFitness – Inicio"
        >
          <img src={logoSvg} alt="DemicheriFitness" className="h-[22px] w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-5" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[13px] uppercase tracking-[0.12em] transition-colors duration-200 ${
                  isActive ? 'text-[#9580A6]' : 'text-[#1A1820]/72 hover:text-[#1A1820]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          className="md:hidden w-[44px] h-[40px] border-0 bg-transparent rounded-none inline-flex items-center justify-center p-0 cursor-pointer transition-none"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <span className="sr-only">Abrir menu</span>
          <img
            className="w-[22px] h-[16px] block"
            src={burgerIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`max-w-[200px] md:hidden absolute top-[calc(100%+12px)] right-5 w-[min(320px,calc(100vw-40px))] bg-[#9580A6] border border-white/[0.12] rounded-[18px] shadow-[0_24px_50px_rgba(0,0,0,0.35)] z-[110] transition-[opacity,transform] duration-200 ${
          isMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="p-[18px] flex flex-col gap-2.5">
          {navItems.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2.5 rounded-[12px] text-[13px] uppercase tracking-[0.14em] transition-[background-color] duration-200 hover:bg-white/20 ${
                  isActive
                    ? 'bg-white/25'
                    : ''
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
