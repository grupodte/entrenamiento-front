import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = i18n.language

  return (
    <div className="lang-switcher" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={current === 'es' ? 'is-active' : ''}
        onClick={() => i18n.changeLanguage('es')}
        aria-pressed={current === 'es'}
      >
        {t('language.es')}
      </button>
      <button
        type="button"
        className={current === 'en' ? 'is-active' : ''}
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={current === 'en'}
      >
        {t('language.en')}
      </button>
    </div>
  )
}
