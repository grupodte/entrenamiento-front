import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import heroImage from '../assets/Imagenes/image 280.webp'
import MessagesSection from '../components/MessagesSection.jsx'
import MethodSection from '../components/MethodSection.jsx'
import CasesSection from '../components/CasesSection.jsx'
import TransformSection from '../components/TransformSection.jsx'
import ShowcaseSection from '../components/ShowcaseSection.jsx'

export default function Home() {
  const { t } = useTranslation()
  const { homePhase } = useOutletContext() ?? {}
  const resolvedPhase = homePhase ?? 'content'
  const heroVisible = ['hero', 'content', 'ready'].includes(resolvedPhase)
  const messagesVisible = ['content', 'ready'].includes(resolvedPhase)

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <section
        className={`relative w-full min-h-[450px] sm:min-h-[360px] md:min-h-[520px] flex items-center justify-center p-1 sm:p-6 bg-cover bg-center rounded-[10px] sm:rounded-[18px] md:rounded-[24px] text-center overflow-hidden transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          heroVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <p className="mt-[200px] relative z-10 m-0 max-w-[325px] md:max-w-[720px] text-[16px] sm:text-[18px] md:text-[35px] text-white leading-none">
          {t('home.heroText')}
        </p>
      </section>

      <div
        className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          messagesVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
      >
        <MessagesSection />
      </div>

      <div
        className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          messagesVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
      >
        <MethodSection />
      </div>



      <div
        className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          messagesVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
      >
        <TransformSection />
      </div>


      <div
        className={`transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          messagesVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
      >
        <ShowcaseSection />
      </div>
    </div>
  )
}
