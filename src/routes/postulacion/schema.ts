import { z } from 'zod'

export const roles = ['Entrenador', 'Nutricionista'] as const
export const disponibilidadOptions = ['4-5', '6', '6+'] as const
export const metodologiaOptions = [
  'Me adapto a una metodología definida',
  'Necesito aplicar la mía'
] as const
export const preferenciaTrabajoOptions = [
  'Crecer dentro de una marca',
  'Prefiero independiente'
] as const

export const tipoClientesOptions = [
  { value: 'sedentarios', label: 'Sedentarios' },
  { value: 'perdida_grasa', label: 'Pérdida de grasa' },
  { value: 'salud_general', label: 'Salud general' },
  { value: 'fitness_estetico', label: 'Fitness estético' }
] as const

const tipoClientesValues = tipoClientesOptions.map((option) => option.value)

const requiredBoolean = (message: string) =>
  z.boolean({ required_error: message, invalid_type_error: message })

const requiredString = (message: string) =>
  z.string({ required_error: message, invalid_type_error: message }).min(1, message)

const requiredNumber = (message: string) =>
  z.number({ required_error: message, invalid_type_error: message }).finite(message)

export const applicationSchema = z
  .object({
    rol: z.enum(roles, { required_error: 'Seleccioná un rol' }),
    alineado: requiredBoolean('Indicá si esto se alinea con lo que buscás'),
    comodidad_app: requiredBoolean('Indicá si te sentís cómodo/a con la app'),
    remoto_100: requiredBoolean('Indicá si podés trabajar 100% remoto'),
    disponibilidad: z.enum(disponibilidadOptions, {
      required_error: 'Seleccioná tu disponibilidad'
    }),
    expectativa_usd_mensual: requiredNumber('Ingresá tu expectativa en USD').refine(
      (value) => value > 0,
      'Debe ser mayor a 0'
    ),
    flexible_por_volumen: requiredBoolean('Indicá si sos flexible por volumen'),
    estilo_comunicacion: requiredString('Contanos tu estilo de comunicación'),
    nombre_apellido: requiredString('Ingresá tu nombre y apellido'),
    edad: requiredNumber('Ingresá tu edad')
      .int('Ingresá un número entero')
      .min(25, 'Edad mínima 25'),
    pais: requiredString('Ingresá tu país'),
    ciudad: requiredString('Ingresá tu ciudad'),
    email: z
      .string({ required_error: 'Ingresá tu email', invalid_type_error: 'Email inválido' })
      .email('Email inválido'),
    whatsapp: z
      .string({ required_error: 'Ingresá tu WhatsApp', invalid_type_error: 'WhatsApp inválido' })
      .min(6, 'Mínimo 6 caracteres'),
    nutri_institucion_pais: z.string().optional(),
    nutri_licenciado: z.boolean().optional(),
    nutri_egreso_anio: z.number().int('Ingresá un año válido').optional(),
    entrenador_formacion_principal: z.string().optional(),
    entrenador_experiencia_anios: z.number().int('Ingresá años de experiencia').optional(),
    tipo_clientes: z
      .array(z.enum(tipoClientesValues as [string, ...string[]]))
      .min(1, 'Seleccioná al menos un tipo de clientes'),
    seguimiento_distancia: requiredBoolean('Indicá si hacés seguimiento a distancia'),
    metodologia: z.enum(metodologiaOptions, { required_error: 'Seleccioná una opción' }),
    sentido_comun: requiredString('Contanos qué significa el sentido común para vos'),
    macros_equivalencias: z.boolean().optional(),
    estructura_rutina: z.boolean().optional(),
    volumen_semanal: z.boolean().optional(),
    metodos_avanzados: z.boolean().optional(),
    planes_desde_datos: z.boolean().optional(),
    preferencia_trabajo: z.enum(preferenciaTrabajoOptions, {
      required_error: 'Seleccioná una preferencia'
    }),
    interes_crecer_con_marca: requiredBoolean('Indicá si te interesa crecer con la marca')
  })
  .superRefine((data, ctx) => {
    if (data.rol === 'Nutricionista') {
      if (!data.nutri_institucion_pais?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresá la institución y país',
          path: ['nutri_institucion_pais']
        })
      }
      if (data.nutri_licenciado === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si estás licenciado/a',
          path: ['nutri_licenciado']
        })
      }
      if (data.nutri_egreso_anio === undefined || Number.isNaN(data.nutri_egreso_anio)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresá tu año de egreso',
          path: ['nutri_egreso_anio']
        })
      }
      if (data.macros_equivalencias === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si trabajás con equivalencias',
          path: ['macros_equivalencias']
        })
      }
      if (data.planes_desde_datos === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si armás planes desde datos',
          path: ['planes_desde_datos']
        })
      }
    }

    if (data.rol === 'Entrenador') {
      if (!data.entrenador_formacion_principal?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresá tu formación principal',
          path: ['entrenador_formacion_principal']
        })
      }
      if (
        data.entrenador_experiencia_anios === undefined ||
        Number.isNaN(data.entrenador_experiencia_anios)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresá tus años de experiencia',
          path: ['entrenador_experiencia_anios']
        })
      }
      if (data.estructura_rutina === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si sabés estructurar rutinas',
          path: ['estructura_rutina']
        })
      }
      if (data.volumen_semanal === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si manejás volumen semanal',
          path: ['volumen_semanal']
        })
      }
      if (data.metodos_avanzados === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si usás métodos avanzados',
          path: ['metodos_avanzados']
        })
      }
      if (data.planes_desde_datos === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Indicá si armás planes desde datos',
          path: ['planes_desde_datos']
        })
      }
    }
  })

export type ApplicationValues = z.infer<typeof applicationSchema>
export type ApplicationFormValues = Partial<ApplicationValues>
