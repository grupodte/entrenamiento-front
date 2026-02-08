import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useTranslation } from 'react-i18next'

export default function AgendaGracias() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate({ to: '/' })
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative">
      <Card className="relative">
        <CardHeader>
          <CardTitle>{t('agenda.confirmedTitle')}</CardTitle>
          <p className="m-0 text-[14px] text-black/60">
            {t('agenda.thanksMessage')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="m-0 text-[15px] text-black/70">
            {t('agenda.redirectMessage')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate({ to: '/' })}>{t('agenda.backHome')}</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/agenda' })}>
              {t('agenda.bookAnother')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
