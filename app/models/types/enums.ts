// Centralized enum types for the INIA application

export type EstadoAnalisis = 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'PENDIENTE_APROBACION' | 'APROBADO' | 'PARA_REPETIR';

export type TipoMYCCatalogo = 'MALEZA' | 'CULTIVO' | 'BRASSICA';

export type TipoListado = 'OTRAS_SEMILLAS' | 'MALEZAS' | 'OTROS_CULTIVOS';

export type Instituto = 'INIA' | 'INASE';

export type TipoDOSN = 'COMPLETO' | 'REDUCIDO' | 'LIMITADO' | 'REDUCIDO_LIMITADO';

export type RolUsuario = 'ADMIN' | 'ANALISTA' | 'OBSERVADOR';

export type TipoEspecie = 'CULTIVADA' | 'MALEZA' | 'OTRA';

export type EstadoLote = 'ACTIVO' | 'INACTIVO' | 'COMPLETADO';

export type TipoAnalisis = 'PUREZA' | 'GERMINACION' | 'PMS' | 'TETRAZOLIO' | 'DOSN';