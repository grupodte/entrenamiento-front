import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import ExitRedirect from './ExitRedirect'
import StepIntro from './steps/StepIntro'
import StepRol from './steps/StepRol'
import StepRemoto from './steps/StepRemoto'
import StepExpectativa from './steps/StepExpectativa'
import StepDatos from './steps/StepDatos'
import StepFormacion from './steps/StepFormacion'
import StepExperiencia from './steps/StepExperiencia'
import StepMetodologia from './steps/StepMetodologia'
import StepCompetencias from './steps/StepCompetencias'
import StepMentalidad from './steps/StepMentalidad'
import { applicationSchema, type ApplicationFormValues } from './schema'
import { loadApplication, saveApplication } from './storage'
import { submitApplication } from './submitApplication'
import type { WizardForm } from './types'

const stepDefinitions = [
  {
    id: 'intro',
    title: 'Leé esto antes de empezar',
    description: 'Trabajamos 100% online con procesos claros y comunicación constante.',
    Component: StepIntro,
    getFields: () => [] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'rol',
    title: 'Rol y alineación',
    description: 'Contanos qué rol buscás y si esto se alinea con tus objetivos.',
    Component: StepRol,
    getFields: () => ['rol', 'alineado', 'comodidad_app'] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'remoto',
    title: 'Trabajo remoto y disponibilidad',
    description: 'Estas respuestas son excluyentes.',
    Component: StepRemoto,
    getFields: () => ['remoto_100', 'disponibilidad'] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'expectativa',
    title: 'Expectativa económica y comunicación',
    description: 'Queremos entender tu contexto de trabajo.',
    Component: StepExpectativa,
    getFields: () =>
      [
        'expectativa_usd_mensual',
        'flexible_por_volumen',
        'estilo_comunicacion'
      ] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'datos',
    title: 'Datos básicos',
    description: 'Información general para avanzar con la evaluación.',
    Component: StepDatos,
    getFields: () =>
      ['nombre_apellido', 'edad', 'pais', 'ciudad', 'email', 'whatsapp'] as Array<
        keyof ApplicationFormValues
      >
  },
  {
    id: 'formacion',
    title: 'Formación',
    description: 'Datos específicos según el rol.',
    Component: StepFormacion,
    getFields: (values: ApplicationFormValues) =>
      values.rol === 'Nutricionista'
        ? (['nutri_institucion_pais', 'nutri_licenciado', 'nutri_egreso_anio'] as Array<
            keyof ApplicationFormValues
          >)
        : (['entrenador_formacion_principal', 'entrenador_experiencia_anios'] as Array<
            keyof ApplicationFormValues
          >)
  },
  {
    id: 'experiencia',
    title: 'Experiencia práctica',
    description: 'Qué tipo de clientes acompañás y cómo trabajás.',
    Component: StepExperiencia,
    getFields: () => ['tipo_clientes', 'seguimiento_distancia'] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'metodologia',
    title: 'Metodología y criterio',
    description: 'Cómo trabajás en el día a día.',
    Component: StepMetodologia,
    getFields: () => ['metodologia', 'sentido_comun'] as Array<keyof ApplicationFormValues>
  },
  {
    id: 'competencias',
    title: 'Competencias prácticas',
    description: 'Herramientas que usás con tus clientes.',
    Component: StepCompetencias,
    getFields: (values: ApplicationFormValues) =>
      values.rol === 'Nutricionista'
        ? (['macros_equivalencias', 'planes_desde_datos'] as Array<keyof ApplicationFormValues>)
        : ([
            'estructura_rutina',
            'volumen_semanal',
            'metodos_avanzados',
            'planes_desde_datos'
          ] as Array<keyof ApplicationFormValues>)
  },
  {
    id: 'mentalidad',
    title: 'Mentalidad de trabajo',
    description: 'Cómo te imaginás creciendo profesionalmente.',
    Component: StepMentalidad,
    getFields: () =>
      ['preferencia_trabajo', 'interes_crecer_con_marca'] as Array<keyof ApplicationFormValues>
  }
]

function AutoSave({ form, step }: { form: WizardForm; step: number }) {
  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => <AutoSaveInner values={values} step={step} />}
    </form.Subscribe>
  )
}

function AutoSaveInner({ values, step }: { values: ApplicationFormValues; step: number }) {
  useEffect(() => {
    saveApplication(values, step)
  }, [values, step])

  return null
}

function getExclusionReason(stepIndex: number, values: ApplicationFormValues) {
  if (stepIndex === 1) {
    if (values.alineado === false) return 'No se alinea con lo que estás buscando.'
    if (values.comodidad_app === false)
      return 'No te sentís cómodo/a trabajando dentro de una app propia.'
  }

  if (stepIndex === 2) {
    if (values.remoto_100 === false) return 'No podés trabajar 100% remoto.'
    if (values.disponibilidad === '4-5')
      return 'Disponibilidad insuficiente (mínimo 6 horas diarias).'
  }

  if (stepIndex === 4) {
    if (typeof values.edad === 'number' && values.edad < 25) return 'Edad mínima 25 años.'
  }

  return null
}

export default function PostulacionWizard() {
  const navigate = useNavigate()
  const stored = loadApplication()
  const totalSteps = stepDefinitions.length
  const initialStep = stored?.step !== undefined ? Math.min(stored.step, totalSteps - 1) : 0
  const initialValues: ApplicationFormValues = {
    ...stored?.values,
    tipo_clientes: stored?.values?.tipo_clientes ?? []
  }

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [exitReason, setExitReason] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)
  const [submitNotice, setSubmitNotice] = useState<string | null>(null)

  const form = useForm<ApplicationFormValues>({
    defaultValues: initialValues,
    validators: {
      onChange: applicationSchema,
      onSubmit: applicationSchema
    },
    onSubmit: async ({ value }) => {
      const result = applicationSchema.safeParse(value)
      if (!result.success) return
      const submission = await submitApplication(result.data)
      if (!submission.ok) return
      if (submission.duplicate) {
        setSubmitNotice('Postulación ya enviada.')
        return
      }
      setSubmitNotice(null)
      console.log(result.data)
      saveApplication(result.data, totalSteps - 1)
      navigate({ to: '/postulacion/gracias' })
    }
  })

  const stepConfig = stepDefinitions[currentStep]
  const StepComponent = stepConfig.Component
  const isIntroStep = currentStep === 0
  const progressStepsTotal = totalSteps - 1
  const progressStepNumber = isIntroStep ? 0 : currentStep
  const progressValue = isIntroStep
    ? 0
    : (progressStepNumber / progressStepsTotal) * 100

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSaveExit = () => {
    saveApplication(form.state.values, currentStep)
    navigate({ to: '/' })
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1)
      return
    }

    const values = form.state.values
    const fields = stepConfig.getFields(values)

    const parsed = applicationSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const hasStepErrors = fields.some((field) => fieldErrors[field]?.length)
      if (hasStepErrors) {
        fields.forEach((field) => {
          const instance = form.getFieldInfo(field).instance
          if (instance && !instance.state.meta.isTouched) {
            instance.setMeta((prev) => ({ ...prev, isTouched: true }))
          }
        })
        await Promise.all(fields.map((field) => form.validateField(field, 'change')))
        return
      }
    }

    const exclusion = getExclusionReason(currentStep, values)
    if (exclusion) {
      setExitReason(exclusion)
      setExitOpen(true)
      return
    }

    const validations = await Promise.all(
      fields.map((field) => form.validateField(field, 'change'))
    )

    const hasErrors = validations.some((errors) => (errors ?? []).length > 0)
    if (hasErrors) return

    if (currentStep === totalSteps - 1) {
      await form.handleSubmit()
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  return (
    <div className="relative ">
    
      <ExitRedirect
        open={exitOpen}
        reason={exitReason}
        onComplete={() => {
          setExitOpen(false)
        }}
      />

      <AutoSave form={form} step={currentStep} />

      <div className="relative mx-auto flex w-full max-w-[860px] flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="m-0 text-[12px] uppercase tracking-[0.4em] text-black/40">
            Postulación laboral
          </p>
          <h1 className="m-0 leading-none text-[28px] sm:text-[32px] font-semibold">{stepConfig.title}</h1>
          <p className="m-0 text-[14px] text-black/60">{stepConfig.description}</p>
        </div>

        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-center text-[15px] uppercase tracking-[0.3em] text-black/40">
              <span>
                {isIntroStep
                  ? 'Intro'
                  : `Paso ${progressStepNumber} de ${progressStepsTotal}`}
              </span>
            </div>
            <Progress value={progressValue} className="mt-3" />
            <CardDescription className="mt-3">
              Respondé con sinceridad. Si tu perfil se alinea, te contactamos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <StepComponent form={form} />

            <div className="flex flex-row items-center justify-between gap-4 border-t border-black/10 pt-6">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                Atrás
              </Button>

              <div className="flex flex-nowrap items-center gap-3">
                <Button variant="outline" onClick={handleSaveExit}>
                  Guardar
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === 0
                    ? 'Empezar'
                    : currentStep === totalSteps - 1
                      ? 'Enviar'
                      : 'Siguiente'}
                </Button>
              </div>
            </div>
            {submitNotice ? (
              <p className="m-0 text-sm text-amber-600">{submitNotice}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
