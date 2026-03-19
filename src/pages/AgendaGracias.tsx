import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function AgendaGracias() {
  const navigate = useNavigate()

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
          <CardTitle>Cita confirmada</CardTitle>
          <p className="m-0 text-[14px] text-black/60">
            Gracias por agendar. Te enviamos un correo con los detalles.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="m-0 text-[15px] text-black/70">
            En unos segundos vas a volver al sitio principal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate({ to: '/' })}>Ir al inicio</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/agenda' })}>
              Agendar otra
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
