import type { WizardForm } from '../types'
import { FieldError, FieldWrapper, YesNoButtons, markTouched } from './shared'

export default function StepCompetencias({ form }: { form: WizardForm }) {
  return (
    <form.Field name="rol">
      {(roleField) => {
        const role = roleField.state.value

        if (!role) {
          return (
            <div className="rounded-[20px] border border-black/10 bg-white/70 p-4 text-[14px] text-black/60">
              Seleccioná un rol para continuar.
            </div>
          )
        }

        if (role === 'Nutricionista') {
          return (
            <div className="space-y-6">
              <form.Field name="macros_equivalencias">
                {(field) => (
                  <FieldWrapper label="¿Manejás equivalencias y macros?">
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

              <form.Field name="planes_desde_datos">
                {(field) => (
                  <FieldWrapper label="¿Armás planes desde datos concretos?">
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

        return (
          <div className="space-y-6">
            <form.Field name="estructura_rutina">
              {(field) => (
                <FieldWrapper label="¿Sabés estructurar rutinas completas?">
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

            <form.Field name="volumen_semanal">
              {(field) => (
                <FieldWrapper label="¿Planificás volumen semanal?">
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

            <form.Field name="metodos_avanzados">
              {(field) => (
                <FieldWrapper label="¿Usás métodos avanzados (supersets, drop sets, rest-pause)?">
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

            <form.Field name="planes_desde_datos">
              {(field) => (
                <FieldWrapper label="¿Armás planes desde datos concretos?">
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
      }}
    </form.Field>
  )
}
