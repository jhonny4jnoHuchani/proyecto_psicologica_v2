/**
 * Utilidades de formateo de fechas y horas en español
 */

const MESES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
];

const MESES_CORTOS = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
];

export interface FechaPartes {
    año: number;
    mes: number;
    dia: number;
    horas: number;
    minutos: number;
    tieneHora: boolean;
}

/**
 * Parsea una fecha en formato string (ISO 8601, YYYY-MM-DD, YYYY-MM-DD HH:mm:ss)
 * extrayendo sus partes sin descalce de zona horaria involuntario.
 */
export function parsearFechaPartes(fechaStr?: string | null): FechaPartes | null {
    if (!fechaStr) return null;

    const trimmed = fechaStr.trim();
    // Expresión regular para capturar YYYY-MM-DD opcionalmente con hora HH:mm(:ss)
    const match = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/
    );

    if (match) {
        const año = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10) - 1; // 0-indexed
        const dia = parseInt(match[3], 10);
        const tieneHora = match[4] !== undefined && match[5] !== undefined;
        const horas = tieneHora ? parseInt(match[4], 10) : 0;
        const minutos = tieneHora ? parseInt(match[5], 10) : 0;

        return { año, mes, dia, horas, minutos, tieneHora };
    }

    // Fallback a objeto Date estándar si el formato es distinto
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;

    return {
        año: d.getFullYear(),
        mes: d.getMonth(),
        dia: d.getDate(),
        horas: d.getHours(),
        minutos: d.getMinutes(),
        tieneHora: true,
    };
}

/**
 * Formatea horas y minutos en formato 12 horas con am/pm: "12:30am", "02:15pm"
 */
export function formatoHora12(horas: number, minutos: number): string {
    const ampm = horas >= 12 ? 'pm' : 'am';
    let h12 = horas % 12;
    if (h12 === 0) h12 = 12;
    const minStr = minutos.toString().padStart(2, '0');
    return `${h12}:${minStr}${ampm}`;
}

/**
 * Formato claro con fecha y hora:
 * Ej: "26 de septiembre de 2026 12:30am" o "18 de agosto de 2026 12:00am"
 */
export function formatoFechaHora(fecha?: string | null): string {
    if (!fecha) return 'Sin fecha';
    const partes = parsearFechaPartes(fecha);
    if (!partes) return String(fecha);

    const { año, mes, dia, horas, minutos } = partes;
    const nombreMes = MESES[mes] ?? '';
    const horaStr = formatoHora12(horas, minutos);

    return `${dia} de ${nombreMes} de ${año} ${horaStr}`;
}

/**
 * Formato solo fecha en texto largo:
 * Ej: "26 de septiembre de 2026"
 */
export function formatoFecha(fecha?: string | null): string {
    if (!fecha) return 'Sin fecha';
    const partes = parsearFechaPartes(fecha);
    if (!partes) return String(fecha);

    const { año, mes, dia } = partes;
    const nombreMes = MESES[mes] ?? '';

    return `${dia} de ${nombreMes} de ${año}`;
}

/**
 * Formato inteligente:
 * Si la cadena contiene hora definida (o forzarHora es true), muestra fecha y hora ("26 de septiembre de 2026 12:30am").
 * De lo contrario muestra solo la fecha ("26 de septiembre de 2026").
 */
export function formatoFechaInteligente(
    fecha?: string | null,
    forzarHora = false
): string {
    if (!fecha) return 'Sin fecha';
    const partes = parsearFechaPartes(fecha);
    if (!partes) return String(fecha);

    if (forzarHora || partes.tieneHora) {
        return formatoFechaHora(fecha);
    }
    return formatoFecha(fecha);
}

/**
 * Formato corto de fecha: "18 ago 2026" o "18 ago"
 */
export function formatoFechaCorta(
    fecha?: string | null,
    conAño = true
): string {
    if (!fecha) return 'Sin fecha';
    const partes = parsearFechaPartes(fecha);
    if (!partes) return String(fecha);

    const { año, mes, dia } = partes;
    const nombreMes = MESES_CORTOS[mes] ?? '';

    return conAño ? `${dia} ${nombreMes} ${año}` : `${dia} ${nombreMes}`;
}

/**
 * Convierte cualquier fecha/hora en formato apto para <input type="datetime-local">:
 * "YYYY-MM-DDTHH:mm"
 */
export function toDatetimeLocal(fechaStr?: string | null): string {
    if (!fechaStr) return '';
    const match = fechaStr.trim().match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/
    );
    if (!match) return '';
    const [, año, mes, dia, hh, mm] = match;
    const horas = hh ?? '00';
    const minutos = mm ?? '00';
    return `${año}-${mes}-${dia}T${horas}:${minutos}`;
}

/**
 * Formatea un rango completo de disponibilidad de tarea:
 * "Desde el 15 de octubre de 2026 08:00am hasta el 17 de octubre de 2026 11:59pm"
 */
export function formatoRangoFechas(
    inicio?: string | null,
    fin?: string | null
): string {
    if (!inicio && !fin) return 'Sin fechas programadas';
    if (inicio && !fin) return `Disponible desde el ${formatoFechaHora(inicio)}`;
    if (!inicio && fin) return `Límite hasta el ${formatoFechaHora(fin)}`;
    return `Desde el ${formatoFechaHora(inicio)} hasta el ${formatoFechaHora(fin)}`;
}

export interface EstadoVencimiento {
    vencido: boolean;
    restantesDias: number;
    restantesHoras: number;
    restantesMinutos: number;
    textoBadge: string;
    esHoy: boolean;
    aunNoInicia?: boolean;
}

/**
 * Calcula con precisión el estado de vencimiento considerando fecha y hora exacta
 */
export function obtenerEstadoVencimiento(
    fechaFinStr?: string | null,
    fechaInicioStr?: string | null
): EstadoVencimiento | null {
    if (!fechaFinStr) return null;
    const partesFin = parsearFechaPartes(fechaFinStr);
    if (!partesFin) return null;

    const ahora = new Date();
    const fechaFin = new Date(
        partesFin.año,
        partesFin.mes,
        partesFin.dia,
        partesFin.horas,
        partesFin.minutos,
        0
    );

    // Revisar si aún no inicia (fecha_programada a futuro)
    if (fechaInicioStr) {
        const partesInicio = parsearFechaPartes(fechaInicioStr);
        if (partesInicio) {
            const fechaInicio = new Date(
                partesInicio.año,
                partesInicio.mes,
                partesInicio.dia,
                partesInicio.horas,
                partesInicio.minutos,
                0
            );
            if (ahora.getTime() < fechaInicio.getTime()) {
                return {
                    vencido: false,
                    restantesDias: 0,
                    restantesHoras: 0,
                    restantesMinutos: 0,
                    textoBadge: `Inicia ${formatoFechaHora(fechaInicioStr)}`,
                    esHoy: false,
                    aunNoInicia: true,
                };
            }
        }
    }

    const diffMs = fechaFin.getTime() - ahora.getTime();

    if (diffMs <= 0) {
        return {
            vencido: true,
            restantesDias: 0,
            restantesHoras: 0,
            restantesMinutos: 0,
            textoBadge: 'Vencida',
            esHoy: false,
        };
    }

    const totalMinutos = Math.floor(diffMs / 60000);
    const totalHoras = Math.floor(totalMinutos / 60);
    const dias = Math.floor(totalHoras / 24);
    const horas = totalHoras % 24;
    const minutos = totalMinutos % 60;

    const esHoy =
        dias === 0 &&
        ahora.getDate() === partesFin.dia &&
        ahora.getMonth() === partesFin.mes &&
        ahora.getFullYear() === partesFin.año;

    let textoBadge = '';
    if (dias > 1) {
        textoBadge = `${dias} días restantes`;
    } else if (dias === 1) {
        textoBadge = `1 día y ${horas}h restantes`;
    } else if (totalHoras >= 1) {
        textoBadge = `${totalHoras}h ${minutos}m restantes`;
    } else {
        textoBadge = `${Math.max(1, minutos)} min restantes`;
    }

    return {
        vencido: false,
        restantesDias: dias,
        restantesHoras: horas,
        restantesMinutos: minutos,
        textoBadge,
        esHoy,
    };
}

const DIAS_SEMANA = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
];

/**
 * Formato estilo Moodle / LMS:
 * Ej: "martes, 8 de septiembre de 2026, 00:00"
 * Ej: "domingo, 13 de septiembre de 2026, 17:41"
 */
export function formatoFechaMoodle(fechaStr?: string | null): string {
    if (!fechaStr) return 'Sin fecha';
    const partes = parsearFechaPartes(fechaStr);
    if (!partes) return String(fechaStr);

    const d = new Date(
        partes.año,
        partes.mes,
        partes.dia,
        partes.horas,
        partes.minutos
    );
    const diaSemana = DIAS_SEMANA[d.getDay()] ?? '';
    const nombreMes = MESES[partes.mes] ?? '';
    const hh = partes.horas.toString().padStart(2, '0');
    const mm = partes.minutos.toString().padStart(2, '0');

    return `${diaSemana}, ${partes.dia} de ${nombreMes} de ${partes.año}, ${hh}:${mm}`;
}

export interface TiempoRestanteInfo {
    texto: string;
    esAnticipado: boolean;
    esAtrasado: boolean;
    esVencido: boolean;
}

/**
 * Calcula el texto de tiempo restante al estilo exacto de Moodle / LMS:
 * - "La tarea fue enviada 1 día 6 horas antes de la fecha límite"
 * - "La tarea fue enviada 3 horas 20 minutos después de la fecha límite"
 * - "2 días 5 horas restantes"
 * - "La tarea está retrasada por 1 día 2 horas"
 */
export function calcularTiempoRestanteMoodle(
    fechaEntregaStr?: string | null,
    fechaLimiteStr?: string | null
): TiempoRestanteInfo {
    if (!fechaLimiteStr) {
        return {
            texto: fechaEntregaStr ? 'Entregado (sin fecha límite)' : 'Sin fecha límite',
            esAnticipado: false,
            esAtrasado: false,
            esVencido: false,
        };
    }

    const partesLimite = parsearFechaPartes(fechaLimiteStr);
    if (!partesLimite) {
        return { texto: '-', esAnticipado: false, esAtrasado: false, esVencido: false };
    }

    const fechaLimite = new Date(
        partesLimite.año,
        partesLimite.mes,
        partesLimite.dia,
        partesLimite.horas,
        partesLimite.minutos,
        0
    );

    if (fechaEntregaStr) {
        const partesEntrega = parsearFechaPartes(fechaEntregaStr);
        if (!partesEntrega) {
            return { texto: 'Entregado', esAnticipado: false, esAtrasado: false, esVencido: false };
        }
        const fechaEntrega = new Date(
            partesEntrega.año,
            partesEntrega.mes,
            partesEntrega.dia,
            partesEntrega.horas,
            partesEntrega.minutos,
            0
        );

        const diffMs = fechaLimite.getTime() - fechaEntrega.getTime();
        const anticipado = diffMs >= 0;
        const absDiff = Math.abs(diffMs);

        const totalMin = Math.floor(absDiff / 60000);
        const totalHoras = Math.floor(totalMin / 60);
        const dias = Math.floor(totalHoras / 24);
        const horas = totalHoras % 24;
        const minutos = totalMin % 60;

        let tiempoTxt = '';
        if (dias > 0) {
            tiempoTxt = `${dias} día${dias !== 1 ? 's' : ''}${horas > 0 ? ` ${horas} hora${horas !== 1 ? 's' : ''}` : ''}`;
        } else if (horas > 0) {
            tiempoTxt = `${horas} hora${horas !== 1 ? 's' : ''}${minutos > 0 ? ` ${minutos} minuto${minutos !== 1 ? 's' : ''}` : ''}`;
        } else {
            tiempoTxt = `${Math.max(1, minutos)} minuto${minutos !== 1 ? 's' : ''}`;
        }

        if (anticipado) {
            return {
                texto: `La tarea fue enviada ${tiempoTxt} antes de la fecha límite`,
                esAnticipado: true,
                esAtrasado: false,
                esVencido: false,
            };
        } else {
            return {
                texto: `La tarea fue enviada ${tiempoTxt} después de la fecha límite`,
                esAnticipado: false,
                esAtrasado: true,
                esVencido: true,
            };
        }
    }

    // Aún no entregado: calcular contra el momento actual
    const ahora = new Date();
    const diffMs = fechaLimite.getTime() - ahora.getTime();

    if (diffMs <= 0) {
        const absDiff = Math.abs(diffMs);
        const totalMin = Math.floor(absDiff / 60000);
        const totalHoras = Math.floor(totalMin / 60);
        const dias = Math.floor(totalHoras / 24);
        const horas = totalHoras % 24;

        let tiempoTxt = '';
        if (dias > 0) {
            tiempoTxt = `${dias} día${dias !== 1 ? 's' : ''}${horas > 0 ? ` ${horas} hora${horas !== 1 ? 's' : ''}` : ''}`;
        } else if (horas > 0) {
            tiempoTxt = `${horas} hora${horas !== 1 ? 's' : ''}`;
        } else {
            tiempoTxt = `${Math.max(1, totalMin)} minutos`;
        }

        return {
            texto: `La tarea está retrasada por ${tiempoTxt}`,
            esAnticipado: false,
            esAtrasado: true,
            esVencido: true,
        };
    }

    const totalMin = Math.floor(diffMs / 60000);
    const totalHoras = Math.floor(totalMin / 60);
    const dias = Math.floor(totalHoras / 24);
    const horas = totalHoras % 24;
    const minutos = totalMin % 60;

    let tiempoTxt = '';
    if (dias > 0) {
        tiempoTxt = `${dias} día${dias !== 1 ? 's' : ''}${horas > 0 ? ` ${horas} hora${horas !== 1 ? 's' : ''}` : ''}`;
    } else if (horas > 0) {
        tiempoTxt = `${horas} hora${horas !== 1 ? 's' : ''} ${minutos} minutos`;
    } else {
        tiempoTxt = `${Math.max(1, minutos)} minutos`;
    }

    return {
        texto: `${tiempoTxt} restantes`,
        esAnticipado: false,
        esAtrasado: false,
        esVencido: false,
    };
}


