import {
  crearPms,
  obtenerTodosPms,
  obtenerPmsPorId,
  actualizarPms,
  eliminarPms,
  desactivarPms,
  activarPms,
  obtenerPmsPorIdLote,
  obtenerPmsPaginadas,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir,
  actualizarPmsConRedondeo,
} from "@/app/services/pms-service";
import { apiFetch } from "@/app/services/api";
import { PmsDTO, PmsRequestDTO } from "@/app/models";

// Mock apiFetch
jest.mock("@/app/services/api", () => ({
  apiFetch: jest.fn(),
}));

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("PMS Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("crearPms", () => {
    it("debe crear un análisis PMS exitosamente", async () => {
      const mockRequest: PmsRequestDTO = {
        idLote: 1,
        numRepeticionesEsperadas: 8,
        esSemillaBrozosa: false,
        comentarios: "Test PMS",
      };

      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        esSemillaBrozosa: false,
        estado: "REGISTRADO",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await crearPms(mockRequest);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms", {
        method: "POST",
        body: JSON.stringify(mockRequest),
      });
      expect(result).toEqual(mockResponse);
    });

    it("debe manejar errores al crear PMS", async () => {
      const mockRequest: PmsRequestDTO = {
        idLote: 1,
        numRepeticionesEsperadas: 8,
      };

      mockedApiFetch.mockRejectedValueOnce(new Error("Error de red"));

      await expect(crearPms(mockRequest)).rejects.toThrow("Error de red");
    });
  });

  describe("obtenerTodosPms", () => {
    it("debe obtener todos los análisis PMS", async () => {
      const mockPmsList: PmsDTO[] = [
        {
          analisisID: 1,
          idLote: 1,
          lote: "LOTE-001",
          numRepeticionesEsperadas: 8,
          estado: "REGISTRADO",
          fechaInicio: "2024-01-01T10:00:00",
          historial: [],
          activo: true,
        },
        {
          analisisID: 2,
          idLote: 2,
          lote: "LOTE-002",
          numRepeticionesEsperadas: 10,
          estado: "EN_PROCESO",
          fechaInicio: "2024-01-02T10:00:00",
          historial: [],
          activo: true,
        },
      ];

      mockedApiFetch.mockResolvedValueOnce(mockPmsList);

      const result = await obtenerTodosPms();

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms");
      expect(result).toEqual(mockPmsList);
      expect(result).toHaveLength(2);
    });

    it("debe retornar array vacío si no hay resultados", async () => {
      mockedApiFetch.mockResolvedValueOnce(null);

      const result = await obtenerTodosPms();

      expect(result).toEqual([]);
    });
  });

  describe("obtenerPmsPorId", () => {
    it("debe obtener un análisis PMS por ID", async () => {
      const mockPms: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "APROBADO",
        fechaInicio: "2024-01-01T10:00:00",
        fechaFin: "2024-01-10T15:00:00",
        historial: [],
        activo: true,
        pmsconRedon: 125.5,
        coefVariacion: 3.2,
      };

      mockedApiFetch.mockResolvedValueOnce(mockPms);

      const result = await obtenerPmsPorId(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1");
      expect(result).toEqual(mockPms);
      expect(result.analisisID).toBe(1);
    });

    it("debe manejar PMS inexistente", async () => {
      mockedApiFetch.mockRejectedValueOnce(new Error("PMS no encontrado"));

      await expect(obtenerPmsPorId(999)).rejects.toThrow("PMS no encontrado");
    });
  });

  describe("actualizarPms", () => {
    it("debe actualizar un análisis PMS", async () => {
      const mockRequest: PmsRequestDTO = {
        idLote: 1,
        numRepeticionesEsperadas: 8,
        comentarios: "Comentarios actualizados",
      };

      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        comentarios: "Comentarios actualizados",
        estado: "EN_PROCESO",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await actualizarPms(1, mockRequest);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1", {
        method: "PUT",
        body: JSON.stringify(mockRequest),
      });
      expect(result.comentarios).toBe("Comentarios actualizados");
    });
  });

  describe("eliminarPms", () => {
    it("debe eliminar un análisis PMS", async () => {
      mockedApiFetch.mockResolvedValueOnce(undefined);

      await eliminarPms(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1", {
        method: "DELETE",
      });
    });
  });

  describe("desactivarPms", () => {
    it("debe desactivar un análisis PMS", async () => {
      mockedApiFetch.mockResolvedValueOnce(undefined);

      await desactivarPms(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/desactivar", {
        method: "PUT",
      });
    });
  });

  describe("activarPms", () => {
    it("debe reactivar un análisis PMS", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "REGISTRADO",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await activarPms(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/reactivar", {
        method: "PUT",
      });
      expect(result.activo).toBe(true);
    });
  });

  describe("obtenerPmsPorIdLote", () => {
    it("debe obtener todos los PMS de un lote", async () => {
      const mockPmsList: PmsDTO[] = [
        {
          analisisID: 1,
          idLote: 100,
          lote: "LOTE-100",
          numRepeticionesEsperadas: 8,
          estado: "APROBADO",
          fechaInicio: "2024-01-01T10:00:00",
          historial: [],
          activo: true,
        },
        {
          analisisID: 2,
          idLote: 100,
          lote: "LOTE-100",
          numRepeticionesEsperadas: 10,
          estado: "EN_PROCESO",
          fechaInicio: "2024-01-05T10:00:00",
          historial: [],
          activo: true,
        },
      ];

      mockedApiFetch.mockResolvedValueOnce(mockPmsList);

      const result = await obtenerPmsPorIdLote(100);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/lote/100");
      expect(result).toHaveLength(2);
      expect(result.every((pms) => pms.idLote === 100)).toBe(true);
    });
  });

  describe("obtenerPmsPaginadas", () => {
    it("debe obtener PMS paginados sin filtros", async () => {
      const mockResponse = {
        content: [
          {
            analisisID: 1,
            idLote: 1,
            lote: "LOTE-001",
            estado: "REGISTRADO",
            fechaInicio: "2024-01-01T10:00:00",
            historial: [],
            activo: true,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        last: true,
        first: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await obtenerPmsPaginadas(0, 10);

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/pms/listado?page=0&size=10"
      );
      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });

    it("debe obtener PMS paginados con todos los filtros", async () => {
      const mockResponse = {
        content: [
          {
            analisisID: 1,
            idLote: 100,
            lote: "LOTE-001",
            estado: "APROBADO",
            fechaInicio: "2024-01-01T10:00:00",
            historial: [],
            activo: true,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        last: true,
        first: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await obtenerPmsPaginadas(
        0,
        10,
        "LOTE-001",
        true,
        "APROBADO",
        100
      );

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/pms/listado?page=0&size=10&search=LOTE-001&activo=true&estado=APROBADO&loteId=100"
      );
      expect(result.content).toHaveLength(1);
    });

    it("debe manejar filtros opcionales correctamente", async () => {
      const mockResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      await obtenerPmsPaginadas(0, 10, undefined, undefined, undefined, undefined);

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/pms/listado?page=0&size=10"
      );
    });
  });

  describe("finalizarAnalisis", () => {
    it("debe finalizar un análisis PMS", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "PENDIENTE_APROBACION",
        fechaInicio: "2024-01-01T10:00:00",
        fechaFin: "2024-01-10T15:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await finalizarAnalisis(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/finalizar", {
        method: "PUT",
      });
      expect(result.estado).toBe("PENDIENTE_APROBACION");
      expect(result.fechaFin).toBeDefined();
    });

    it("debe manejar error al finalizar sin completar repeticiones", async () => {
      mockedApiFetch.mockRejectedValueOnce(
        new Error("No se puede finalizar hasta completar todas las repeticiones")
      );

      await expect(finalizarAnalisis(1)).rejects.toThrow(
        "No se puede finalizar hasta completar todas las repeticiones"
      );
    });
  });

  describe("aprobarAnalisis", () => {
    it("debe aprobar un análisis PMS", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "APROBADO",
        fechaInicio: "2024-01-01T10:00:00",
        fechaFin: "2024-01-10T15:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await aprobarAnalisis(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/aprobar", {
        method: "PUT",
      });
      expect(result.estado).toBe("APROBADO");
    });
  });

  describe("marcarParaRepetir", () => {
    it("debe marcar un análisis para repetir", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "A_REPETIR",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await marcarParaRepetir(1);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/repetir", {
        method: "PUT",
      });
      expect(result.estado).toBe("A_REPETIR");
    });
  });

  describe("actualizarPmsConRedondeo", () => {
    it("debe actualizar PMS con valor redondeado", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "EN_PROCESO",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
        pmsconRedon: 125.5,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await actualizarPmsConRedondeo(1, 125.5);

      expect(mockedApiFetch).toHaveBeenCalledWith("/api/pms/1/redondeo", {
        method: "PUT",
        body: JSON.stringify({ pmsconRedon: 125.5 }),
      });
      expect(result.pmsconRedon).toBe(125.5);
    });

    it("debe manejar valor redondeado con decimales", async () => {
      const mockResponse: PmsDTO = {
        analisisID: 1,
        idLote: 1,
        lote: "LOTE-001",
        numRepeticionesEsperadas: 8,
        estado: "EN_PROCESO",
        fechaInicio: "2024-01-01T10:00:00",
        historial: [],
        activo: true,
        pmsconRedon: 100.25,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await actualizarPmsConRedondeo(1, 100.25);

      expect(result.pmsconRedon).toBe(100.25);
    });
  });

  describe("Manejo de errores generales", () => {
    it("debe propagar errores de red", async () => {
      mockedApiFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(obtenerPmsPorId(1)).rejects.toThrow("Network error");
    });

    it("debe manejar respuestas inesperadas", async () => {
      mockedApiFetch.mockResolvedValueOnce(null);

      const result = await obtenerTodosPms();

      expect(result).toEqual([]);
    });
  });

  describe("Validación de parámetros", () => {
    it("debe construir URLs correctamente con múltiples parámetros", async () => {
      const mockResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
      };

      mockedApiFetch.mockResolvedValueOnce(mockResponse);

      await obtenerPmsPaginadas(2, 20, "test", false, "EN_PROCESO", 50);

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/pms/listado?page=2&size=20&search=test&activo=false&estado=EN_PROCESO&loteId=50"
      );
    });
  });
});
