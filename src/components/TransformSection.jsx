import { useTranslation } from 'react-i18next'

export default function TransformSection() {
  const { t } = useTranslation()

  return (
    <section className="w-full flex flex-col justify-center items-center gap-4 rounded-[10px] h-[350px] md:h-[500px] sm:rounded-[20px] md:rounded-[28px] bg-[#47D065] px-6 sm:px-10 md:px-14 py-10 sm:py-12 md:py-16 text-center">
      <p className="m-0 text-[45px] sm:text-[32px] md:text-[80px] font-bold leading-none text-black">
        {t('transform.title')}
      </p>
      <p className="m-0 text-[18px] sm:text-[20px] md:text-[28px] font-semibold leading-none text-black/80">
        {t('transform.subtitle')}
      </p>
    </section>
  )
}
