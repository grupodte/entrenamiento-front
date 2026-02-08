import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import burgerIcon from '../assets/burger.svg'

const navItems = [
  { to: '/', key: 'pages.home' },
  { to: '/landing-page', key: 'pages.landing' },
  { to: '/agenda', key: 'pages.agenda' },
  { to: '/postulacion', key: 'Postulacion' }
]

export default function Navbar({ isVisible = true }: { isVisible?: boolean }) {
  const { t, i18n } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0]

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)
  const setLanguage = (lng: string) => i18n.changeLanguage(lng)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] text-white border-b border-white/20 transition-[background-color,backdrop-filter,opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'bg-[#000000]/60 backdrop-blur-[16px]' : 'bg-[#000000]'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
    >
      <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-bold tracking-[0.18em] uppercase text-[14px]"
          onClick={closeMenu}
        >
          {t('app.name')}
        </Link>

        <nav className="hidden md:flex items-center gap-5" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[13px] uppercase tracking-[0.12em] transition-opacity duration-200 hover:opacity-100 ${
                  isActive ? 'opacity-100' : 'opacity-[0.85]'
                }`}
              >
                {item.key.startsWith('pages.') ? t(item.key) : item.key}
              </Link>
            )
          })}
          <div className="flex items-center gap-2" aria-label={t('nav.languageLabel')}>
            <button
              type="button"
              className={`border border-white/30 bg-transparent text-white px-[10px] py-[6px] text-[11px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 ${
                currentLang === 'es'
                  ? 'bg-[rgba(255,255,255,0.18)] border-white/70'
                  : ''
              }`}
              onClick={() => setLanguage('es')}
              aria-pressed={currentLang === 'es'}
            >
              ES
            </button>
            <button
              type="button"
              className={`border border-white/30 bg-transparent text-white px-[10px] py-[6px] text-[11px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 ${
                currentLang === 'en'
                  ? 'bg-[rgba(255,255,255,0.18)] border-white/70'
                  : ''
              }`}
              onClick={() => setLanguage('en')}
              aria-pressed={currentLang === 'en'}
            >
              EN
            </button>
          </div>
        </nav>

        <button
          type="button"
          className="md:hidden w-[44px] h-[40px] border-0 bg-transparent rounded-none inline-flex items-center justify-center p-0 cursor-pointer transition-none"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <span className="sr-only">{t('nav.toggleMenu')}</span>
          <img
            className="w-[22px] h-[16px] block invert"
            src={burgerIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`max-w-[200px] md:hidden absolute top-[calc(100%+12px)] right-5 w-[min(320px,calc(100vw-40px))] bg-[#ff2222] border border-[rgba(255,255,255,0.12)] rounded-[18px] shadow-[0_24px_50px_rgba(0,0,0,0.45)] z-[110] transition-[opacity,transform] duration-200 ${
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
                className={`px-3 py-2.5 rounded-[12px] text-[13px] uppercase tracking-[0.14em] transition-[background-color,opacity] duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:opacity-100 ${
                  isActive
                    ? 'bg-[rgba(255,255,255,0.24)] opacity-100'
                    : 'opacity-[0.85]'
                }`}
                onClick={closeMenu}
              >
                {item.key.startsWith('pages.') ? t(item.key) : item.key}
              </Link>
            )
          })}
          <div
            className="flex gap-2 pt-3 mt-1.5 border-t border-white/20"
            aria-label={t('nav.languageLabel')}
          >
            <button
              type="button"
              className={`border border-white/30 bg-transparent text-white px-[10px] py-[6px] text-[11px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 ${
                currentLang === 'es'
                  ? 'bg-[rgba(255,255,255,0.18)] border-white/70'
                  : ''
              }`}
              onClick={() => setLanguage('es')}
              aria-pressed={currentLang === 'es'}
            >
              ES
            </button>
            <button
              type="button"
              className={`border border-white/30 bg-transparent text-white px-[10px] py-[6px] text-[11px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 ${
                currentLang === 'en'
                  ? 'bg-[rgba(255,255,255,0.18)] border-white/70'
                  : ''
              }`}
              onClick={() => setLanguage('en')}
              aria-pressed={currentLang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
