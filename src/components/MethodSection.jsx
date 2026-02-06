import methodBg from '../assets/Imagenes/Rectangle 287.webp'
import { useTranslation } from 'react-i18next'

export default function MethodSection() {
  const { t } = useTranslation()

  return (
    <section
      className="relative w-full overflow-hidden rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-cover bg-center min-h-[280px] sm:min-h-[320px] md:min-h-[600px]"
      style={{ backgroundImage: `url(${methodBg})` }}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
      <div className="relative z-10 flex items-center justify-center min-h-[350px] sm:min-h-[320px] md:min-h-[380px] px-4 sm:px-8 md:px-12">
        <div className="mt-[100px] bg-[#ff1a1a] px-5 sm:px-8 md:px-10 py-4 sm:py-6 md:py-7 shadow-[0_18px_40px_rgba(0,0,0,0.35)]  text-center rounded-[8px] sm:rounded-[12px] md:rounded-[16px]">
          <p className="m-0 text-[26px] sm:text-[34px] md:text-[52px] font-bold leading-none text-black">
            {t('method.lineOne')}
          </p>
          <p className="m-0 text-[26px] sm:text-[34px] md:text-[52px] font-bold leading-none text-white">
            {t('method.lineTwo')}
          </p>
        </div>
      </div>
    </section>
  )
}
