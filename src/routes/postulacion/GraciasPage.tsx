import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { loadApplication } from './storage'

export default function GraciasPage() {
  const navigate = useNavigate()
  const stored = loadApplication()?.values
  const summaryParts = [stored?.rol, stored?.nombre_apellido, stored?.pais].filter(Boolean)
  const summary = summaryParts.length ? summaryParts.join(' · ') : 'Perfil recibido'

  return (
    <div className="relative ">
      <Card className="relative">
        <CardHeader>
          <CardTitle>Postulación enviada</CardTitle>
          <p className="m-0 text-[14px] text-black/60">{summary}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="m-0 text-[15px] text-black/70">
            Gracias por completar el formulario. Si tu perfil se alinea, nos vamos a estar
            contactando.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate({ to: '/' })}>Volver al sitio</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/postulacion' })}>
              Ver mi postulación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
