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
        
        <div className="order-1 flex flex-col gap-2">
          <Link to="/" aria-label="DemicheriFitness – Inicio">
            <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
          </Link>
        </div>

        <nav
          aria-label="Enlaces legales"
          className="order-2 md:order-3 flex items-center gap-4 text-[11px] text-[#69686B]"
        >
          <Link to="/privacy" className="hover:text-[#1A1820] transition-colors">
            Política de privacidad
          </Link>
        </nav>

        <a
          href="https://www.grupodte.com"
          target="_blank"
          rel="noopener noreferrer"
          className="order-3 md:order-2 mt-1 md:mt-0"
        >
          <ShinyText
            text="build by DTE"
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

      </div>
    </footer>
  )
}