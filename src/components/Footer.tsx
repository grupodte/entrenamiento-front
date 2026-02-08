import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export default function Footer({ isVisible = true }: { isVisible?: boolean }) {
  const { t } = useTranslation()

  return (
    <footer
      className={`w-full border-t border-white/20 bg-[#f2f2f2] text-black transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className=" w-full max-w-[1200px] mx-auto px-5 py-6 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <Link to="/" className="font-bold tracking-[0.18em] uppercase text-[14px]">
            {t('app.name')}
          </Link>
          <p className="m-0 text-[12px] opacity-70">{t('footer.tagline')}</p>
        </div>
        <div className="flex gap-4 text-[12px] uppercase tracking-[0.12em] opacity-80">
          <Link to="/">{t('pages.home')}</Link>
          <Link to="/landing-page">{t('pages.landing')}</Link>
          <Link to="/agenda">{t('pages.agenda')}</Link>
          <Link to="/postulacion">Postulacion</Link>
        </div>
        <p className="m-0 text-[11px] opacity-60">{t('footer.rights')}</p>
      </div>
    </footer>
  )
}
