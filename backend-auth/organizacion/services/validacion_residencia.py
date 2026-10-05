import re
from datetime import date
import unicodedata
from django.utils import timezone
import hashlib
from pathlib import Path

MESES = {
    "enero": 1,
    "ene": 1,
    "febrero": 2,
    "feb": 2,
    "fob": 2,
    "marzo": 3,
    "mar": 3,
    "abril": 4,
    "abr": 4,
    "mayo": 5,
    "may": 5,
    "junio": 6,
    "jun": 6,
    "julio": 7,
    "jul": 7,
    "agosto": 8,
    "ago": 8,
    "septiembre": 9,
    "setiembre": 9,
    "sep": 9,
    "octubre": 10,
    "oct": 10,
    "noviembre": 11,
    "nov": 11,
    "diciembre": 12,
    "dic": 12,
}


def normalizar_texto(texto):
    texto = texto.lower().strip()

    return "".join(
        caracter
        for caracter in unicodedata.normalize("NFD", texto)
        if unicodedata.category(caracter) != "Mn"
    )
def validar_coincidencia_comuna(
    comuna_extraida,
    comuna_junta,
):
    if not comuna_extraida or not comuna_junta:
        return {
            "coincide": False,
            "motivo": (
                "No fue posible comparar la comuna "
                "del documento con la comuna de la Junta."
            ),
        }

    extraida = normalizar_texto(
        comuna_extraida
    )

    junta = normalizar_texto(
        comuna_junta
    )

    coincide = (
        junta == extraida
        or junta in extraida
    )

    if coincide:
        return {
            "coincide": True,
            "motivo": (
                "La comuna del documento coincide "
                "con la comuna de la Junta seleccionada."
            ),
        }

    return {
        "coincide": False,
        "motivo": (
            f"La comuna detectada en el documento "
            f"({comuna_extraida}) no coincide con "
            f"la comuna de la Junta ({comuna_junta})."
        ),
    }

def centro_vertical(caja):
    valores_y = [punto[1] for punto in caja]

    return sum(valores_y) / len(valores_y)


def extraer_valor_a_derecha(
    lineas,
    etiqueta,
    tolerancia_vertical=8,
):
    etiqueta_normalizada = normalizar_texto(etiqueta)

    linea_etiqueta = next(
        (
            linea
            for linea in lineas
            if etiqueta_normalizada in normalizar_texto(linea["texto"])
        ),
        None,
    )

    if linea_etiqueta is None:
        return None

    caja_etiqueta = linea_etiqueta["caja"]

    derecha_etiqueta = max(punto[0] for punto in caja_etiqueta)

    centro_y_etiqueta = centro_vertical(caja_etiqueta)

    candidatos = []

    for linea in lineas:
        if linea is linea_etiqueta:
            continue

        caja = linea["caja"]

        izquierda = min(punto[0] for punto in caja)

        centro_y = centro_vertical(caja)

        diferencia_vertical = abs(centro_y - centro_y_etiqueta)

        if izquierda > derecha_etiqueta and diferencia_vertical <= tolerancia_vertical:
            candidatos.append(
                (
                    diferencia_vertical,
                    izquierda,
                    linea,
                )
            )

    if not candidatos:
        return None

    candidatos.sort(
        key=lambda candidato: (
            candidato[0],
            candidato[1],
        )
    )

    return candidatos[0][2]["texto"]


def extraer_bloque_domicilio_sin_etiquetas(lineas):
    linea_fecha = next(
        (linea for linea in lineas if "fecha de" in normalizar_texto(linea["texto"])),
        None,
    )

    if linea_fecha is None:
        return {
            "nombre": None,
            "direccion": None,
            "comuna": None,
        }

    centro_y_fecha = centro_vertical(linea_fecha["caja"])

    izquierda_fecha = min(punto[0] for punto in linea_fecha["caja"])

    candidatos = []

    for linea in lineas:
        centro_y = centro_vertical(linea["caja"])

        izquierda = min(punto[0] for punto in linea["caja"])

        if centro_y < centro_y_fecha and abs(izquierda - izquierda_fecha) <= 150:
            candidatos.append(
                (
                    centro_y,
                    linea["texto"],
                )
            )

    candidatos.sort(key=lambda candidato: candidato[0])

    if len(candidatos) < 3:
        return {
            "nombre": None,
            "direccion": None,
            "comuna": None,
        }

    ultimos_tres = candidatos[-3:]

    return {
        "nombre": ultimos_tres[0][1],
        "direccion": ultimos_tres[1][1],
        "comuna": ultimos_tres[2][1],
    }


def extraer_datos_personales(lineas):
    datos = {
        "nombre": extraer_valor_a_derecha(
            lineas,
            "Nombre",
        ),
        "direccion": extraer_valor_a_derecha(
            lineas,
            "Dirección",
        ),
        "comuna": extraer_valor_a_derecha(
            lineas,
            "Comuna",
        ),
    }

    if all(datos.values()):
        return datos

    fallback = extraer_bloque_domicilio_sin_etiquetas(lineas)

    return {
        "nombre": datos["nombre"] or fallback["nombre"],
        "direccion": (datos["direccion"] or fallback["direccion"]),
        "comuna": datos["comuna"] or fallback["comuna"],
    }


def extraer_fecha_emision(texto_completo):
    patron = re.compile(
        r"fecha\s+de"
        r"(?:\s+emisi[oó]n)?"
        r"\s*:?\s*"
        r"(\d{1,2})"
        r"[-/\s]+"
        r"([a-záéíóúñ]+)"
        r"[-/\s]+"
        r"(\d{4})",
        re.IGNORECASE,
    )

    coincidencia = patron.search(texto_completo)

    if not coincidencia:
        return None

    dia = int(coincidencia.group(1))
    nombre_mes = normalizar_texto(coincidencia.group(2))
    anio = int(coincidencia.group(3))

    mes = MESES.get(nombre_mes)

    if mes is None:
        return None

    try:
        return date(anio, mes, dia)
    except ValueError:
        return None


def validar_antiguedad_documento(
    fecha_documento,
    maximo_dias=90,
):
    if fecha_documento is None:
        return {
            "valida": False,
            "dias_antiguedad": None,
            "motivo": ("No fue posible detectar la fecha " "de emisión del documento."),
        }

    hoy = timezone.localdate()

    dias_antiguedad = (hoy - fecha_documento).days

    if dias_antiguedad < 0:
        return {
            "valida": False,
            "dias_antiguedad": dias_antiguedad,
            "motivo": ("La fecha del documento se encuentra " "en el futuro."),
        }

    if dias_antiguedad > maximo_dias:
        return {
            "valida": False,
            "dias_antiguedad": dias_antiguedad,
            "motivo": (
                f"El documento supera los " f"{maximo_dias} días de antigüedad."
            ),
        }

    return {
        "valida": True,
        "dias_antiguedad": dias_antiguedad,
        "motivo": "Documento vigente.",
    }


def analizar_documento_residencia(resultado_ocr):
    datos_personales = extraer_datos_personales(resultado_ocr["lineas"])

    fecha_emision = extraer_fecha_emision(resultado_ocr["texto_completo"])

    validacion_antiguedad = validar_antiguedad_documento(fecha_emision)

    return {
        "nombre": datos_personales["nombre"],
        "direccion": datos_personales["direccion"],
        "comuna": datos_personales["comuna"],
        "fecha_emision": fecha_emision,
        "confianza_ocr": resultado_ocr["confianza_promedio"],
        "documento_vigente": validacion_antiguedad["valida"],
        "dias_antiguedad": validacion_antiguedad["dias_antiguedad"],
        "motivo_antiguedad": validacion_antiguedad["motivo"],
    }
def determinar_estado_verificacion(
    documento_vigente,
    comuna_coincide,
):
    if not documento_vigente:
        return "RECHAZADA"

    if not comuna_coincide:
        return "RECHAZADA"

    return "REVISION_MANUAL"

def calcular_hash_archivo(ruta_archivo):
    ruta = Path(ruta_archivo)

    if not ruta.exists():
        raise FileNotFoundError(
            f"No existe el archivo: {ruta}"
        )

    hash_sha256 = hashlib.sha256()

    with ruta.open("rb") as archivo:
        for bloque in iter(
            lambda: archivo.read(1024 * 1024),
            b"",
        ):
            hash_sha256.update(bloque)

    return hash_sha256.hexdigest()