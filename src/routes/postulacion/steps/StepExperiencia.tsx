import type { WizardForm } from '../types'
import { tipoClientesOptions } from '../schema'
import { FieldError, FieldWrapper, YesNoButtons, markTouched } from './shared'
import { cn } from '../../../lib/utils'

export default function StepExperiencia({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="tipo_clientes">
        {(field) => {
          const value = field.state.value ?? []
          return (
            <FieldWrapper label="Tipo de clientes" hint="Seleccioná todos los que apliquen">
              <div className="grid gap-3 sm:grid-cols-2">
                {tipoClientesOptions.map((option) => {
                  const active = value.includes(option.value)
                  return (
                    <button
                      type="button"
                      key={option.value}
                      className={cn(
                        'rounded-[18px] border px-4 py-3 text-left text-[14px] transition',
                        active
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 bg-white/70 text-black hover:border-black/30'
                      )}
                      onClick={() => {
                        markTouched(field)
                        const next = active
                          ? value.filter((item) => item !== option.value)
                          : [...value, option.value]
                        field.handleChange(next)
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <FieldError
                touched={field.state.meta.isTouched}
                error={field.state.meta.errors?.[0] as string}
              />
            </FieldWrapper>
          )
        }}
      </form.Field>

      <form.Field name="seguimiento_distancia">
        {(field) => (
          <FieldWrapper label="¿Hacés seguimiento a distancia?">
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
