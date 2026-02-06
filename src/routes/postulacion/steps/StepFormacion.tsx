import type { WizardForm } from '../types'
import { Input } from '../../../components/ui/input'
import { FieldError, FieldWrapper, YesNoButtons, markTouched } from './shared'

export default function StepFormacion({ form }: { form: WizardForm }) {
  return (
    <form.Field name="rol">
      {(roleField) => {
        const role = roleField.state.value

        if (!role) {
          return (
            <div className="rounded-[20px] border border-black/10 bg-white/70 p-4 text-[14px] text-black/60">
              Seleccioná un rol en el paso anterior para continuar.
            </div>
          )
        }

        if (role === 'Nutricionista') {
          return (
            <div className="space-y-6">
              <form.Field name="nutri_institucion_pais">
                {(field) => (
                  <FieldWrapper label="Institución + país">
                    <Input
                      value={field.state.value ?? ''}
                      onChange={(event) => {
                        markTouched(field)
                        field.handleChange(event.target.value)
                      }}
                    />
                    <FieldError
                      touched={field.state.meta.isTouched}
                      error={field.state.meta.errors?.[0] as string}
                    />
                  </FieldWrapper>
                )}
              </form.Field>

              <form.Field name="nutri_licenciado">
                {(field) => (
                  <FieldWrapper
                    label="¿Estás licenciado/a?"
                    hint="No es excluyente, lo evaluamos como dato"
                  >
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

              <form.Field name="nutri_egreso_anio">
                {(field) => (
                  <FieldWrapper label="Año de egreso">
                    <Input
                      type="number"
                      min={1900}
                      value={field.state.value ?? ''}
                      onChange={(event) => {
                        markTouched(field)
                        const value = event.target.value
                        field.handleChange(value === '' ? undefined : Number(value))
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

        return (
          <div className="space-y-6">
            <form.Field name="entrenador_formacion_principal">
              {(field) => (
                <FieldWrapper label="Formación principal">
                  <Input
                    value={field.state.value ?? ''}
                    onChange={(event) => {
                      markTouched(field)
                      field.handleChange(event.target.value)
                    }}
                  />
                  <FieldError
                    touched={field.state.meta.isTouched}
                    error={field.state.meta.errors?.[0] as string}
                  />
                </FieldWrapper>
              )}
            </form.Field>

            <form.Field name="entrenador_experiencia_anios">
              {(field) => (
                <FieldWrapper label="Años de experiencia">
                  <Input
                    type="number"
                    min={0}
                    value={field.state.value ?? ''}
                    onChange={(event) => {
                      markTouched(field)
                      const value = event.target.value
                      field.handleChange(value === '' ? undefined : Number(value))
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
      }}
    </form.Field>
  )
}
