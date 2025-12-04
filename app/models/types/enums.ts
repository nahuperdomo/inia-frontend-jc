
export type EstadoAnalisis = 'REGISTRADO' | 'EN_PROCESO' | 'PENDIENTE_APROBACION' | 'APROBADO' | 'A_REPETIR';

export type TipoMYCCatalogo = 'MALEZA' | 'CULTIVO';

export type TipoListado = | 'MAL_TOLERANCIA' | 'MAL_TOLERANCIA_CERO' | 'MAL_COMUNES' | 'BRASSICA' | 'OTROS' | 'NO_CONTIENE';

export type Instituto = 'INIA' | 'INASE';

export type TipoDOSN = 'COMPLETO' | 'REDUCIDO' | 'LIMITADO' | 'REDUCIDO_LIMITADO';

export type RolUsuario = 'ADMIN' | 'ANALISTA' | 'OBSERVADOR';

export type TipoEspecie = 'CULTIVADA' | 'MALEZA' | 'OTRA';

export type TipoAnalisis = 'PUREZA' | 'GERMINACION' | 'PMS' | 'TETRAZOLIO' | 'DOSN';

export type TipoContacto = 'CLIENTE' | 'EMPRESA';

export type TipoNotificacion = 'USUARIO_REGISTRO' | 'USUARIO_APROBADO' | 'USUARIO_RECHAZADO' | 'ANALISIS_FINALIZADO' | 'ANALISIS_APROBADO' | 'ANALISIS_REPETIR';
