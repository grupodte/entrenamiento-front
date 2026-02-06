import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { getExitReason, clearApplication, clearExitReason, setExitReason } from './storage'
import { postulacionNoSeleccionadoRoute } from './no-seleccionado'

export default function NoSeleccionadoPage() {
  const navigate = useNavigate()
  const search = postulacionNoSeleccionadoRoute.useSearch()
  const reason = search.reason || getExitReason() || 'Tu perfil no cumple los requisitos mínimos.'

  useEffect(() => {
    if (search.reason) {
      setExitReason(search.reason)
    }
  }, [search.reason])

  const handleRestart = () => {
    clearApplication()
    clearExitReason()
    navigate({ to: '/postulacion' })
  }

  return (
    <div className="relative ">
      <Card className="relative">
        <CardHeader>
          <CardTitle>Gracias por intentarlo</CardTitle>
          <p className="m-0 text-[14px] text-black/60">
            Por ahora tu perfil no encaja con los requisitos mínimos.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[18px] border border-black/10 bg-white/70 px-4 py-3 text-[14px] text-black/70">
            {reason}
          </div>
          <Button onClick={handleRestart}>Volver al inicio</Button>
        </CardContent>
      </Card>
    </div>
  )
}
