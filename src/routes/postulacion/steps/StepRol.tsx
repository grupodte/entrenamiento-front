import type { WizardForm } from '../types'
import { FieldError, FieldWrapper, OptionCard, YesNoButtons, markTouched } from './shared'

export default function StepRol({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="rol">
        {(field) => (
          <FieldWrapper label="Rol" hint="Seleccioná el rol para el que estás postulando">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                label="Entrenador"
                description="Programas de entrenamiento y seguimiento"
                active={field.state.value === 'Entrenador'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Entrenador')
                }}
              />
              <OptionCard
                label="Nutricionista"
                description="Planes de alimentación y hábitos"
                active={field.state.value === 'Nutricionista'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Nutricionista')
                }}
              />
            </div>
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name="alineado">
        {(field) => (
          <FieldWrapper label="¿Esto se alinea con lo que estás buscando?">
            <YesNoButtons
              value={field.state.value}
              onChange={(value) => {
                markTouched(field)
                field.handleChange(value)
              }}
            />
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name="comodidad_app">
        {(field) => (
          <FieldWrapper label="¿Te sentís cómodo/a trabajando dentro de una app propia con procesos definidos?">
            <YesNoButtons
              value={field.state.value}
              onChange={(value) => {
                markTouched(field)
                field.handleChange(value)
              }}
            />
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>
    </div>
  )
}
