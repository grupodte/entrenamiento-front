import { Link } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import ShinyText from './ShinyText'

export default function Footer({ isVisible = true }: { isVisible?: boolean }) {
  return (
    <footer
      className={`w-full border-t border-[#E8E4EE] bg-[#FEFEFE] text-[#1A1820] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link to="/" aria-label="DemicheriFitness – Inicio">
            <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
          </Link>
          <p className="m-0 text-[12px] text-[#69686B]">Entrenamiento, salud y bienestar.</p>
        </div>
        <a href="https://www.grupodte.com" target="_blank" rel="noopener noreferrer">
          <ShinyText
            text="Built by DTE"
            speed={2}
            delay={0}
            color="#b5b5b5"
            shineColor="#ffffff"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
            className="text-[11px]"
          />
        </a>
        <p className="m-0 text-[11px] text-[#9D9B9F]">Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
