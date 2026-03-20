import methodBg from '../assets/Imagenes/Rectangle 287.webp'
import { useTextReveal } from '../lib/useTextReveal'

export default function MethodSection() {
  const sectionRef = useTextReveal()

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-[10px] bg-cover bg-center min-h-[280px] sm:min-h-[320px] sm:rounded-[20px] md:min-h-[600px] md:rounded-[28px]"
      style={{ backgroundImage: `url(${methodBg})` }}
    >
      <div className="absolute inset-0 bg-black/28" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[350px] items-center justify-center px-4 sm:min-h-[320px] sm:px-8 md:min-h-[380px] md:px-12">
        <div className="relative overflow-hidden rounded-[18px] border border-white/20 bg-white/12 px-5 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[16px] sm:rounded-[22px] sm:px-8 sm:py-6 md:rounded-[28px] md:px-10 md:py-7">
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.08)_42%,rgba(149,128,166,0.2))]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/45"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p data-reveal className="m-0 text-[26px] font-bold leading-none tracking-[-0.03em] text-white sm:text-[34px] md:text-[52px]">
              No fallaste vos.
            </p>
            <p data-reveal className="m-0 text-[26px] font-bold leading-none tracking-[-0.03em] text-white/72 sm:text-[34px] md:text-[52px]">
              Fallo el metodo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
