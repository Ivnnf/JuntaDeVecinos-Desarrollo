import hashlib
import re
import unicodedata

from datetime import date
from pathlib import Path

from django.utils import timezone

MESES = {
    "enero": 1,
    "ene": 1,
    "jan": 1,
    "febrero": 2,
    "feb": 2,
    "fob": 2,
    "marzo": 3,
    "mar": 3,
    "abril": 4,
    "abr": 4,
    "apr": 4,
    "mayo": 5,
    "may": 5,
    "junio": 6,
    "jun": 6,
    "julio": 7,
    "jul": 7,
    "agosto": 8,
    "ago": 8,
    "aug": 8,
    "septiembre": 9,
    "setiembre": 9,
    "sep": 9,
    "set": 9,
    "octubre": 10,
    "oct": 10,
    "noviembre": 11,
    "nov": 11,
    "diciembre": 12,
    "dic": 12,
    "dec": 12,
}


ETIQUETAS_NOMBRE = (
    "nombre del cliente",
    "nombre cliente",
    "sr. (a)",
    "sr(a)",
    "sr.",
    "nombre",
    "cliente",
    "titular",
)


ETIQUETAS_DIRECCION = (
    "direccion de envio",
    "direccion cliente",
    "direccion postal",
    "domicilio",
    "direccion",
)


ETIQUETAS_COMUNA = (
    "comuna - ciudad postal",
    "comuna / ciudad postal",
    "comuna - ciudad",
    "comuna / ciudad",
    "comuna ciudad postal",
    "comuna ciudad",
    "comuna",
    "ciudad",
)


PALABRAS_EMPRESA = (
    "s.a.",
    " s.a ",
    "ltda",
    "limitada",
    "spa",
    "telefonica",
    "telecomunicaciones",
    "compania",
    "empresa",
    "servicios",
    "sociedad",
)


def normalizar_texto(texto):
    if texto is None:
        return ""

    texto = str(texto).lower().strip()

    texto = "".join(
        caracter
        for caracter in unicodedata.normalize(
            "NFD",
            texto,
        )
        if unicodedata.category(caracter) != "Mn"
    )

    return re.sub(
        r"\s+",
        " ",
        texto,
    ).strip()


def limpiar_valor_extraido(valor):
    if valor is None:
        return None

    valor = str(valor).strip()

    valor = re.sub(
        r"^[\s:;|=\-–—]+",
        "",
        valor,
    ).strip()

    valor = re.sub(
        r"\s+",
        " ",
        valor,
    ).strip()

    return valor or None


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

    extraida = normalizar_texto(comuna_extraida)

    junta = normalizar_texto(comuna_junta)

    patron_junta = re.compile(rf"\b{re.escape(junta)}\b")

    coincide = junta == extraida or patron_junta.search(extraida) is not None

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
    if not caja:
        return 0

    valores_y = [punto[1] for punto in caja]

    return sum(valores_y) / len(valores_y)


def izquierda_caja(caja):
    if not caja:
        return 0

    return min(punto[0] for punto in caja)


def derecha_caja(caja):
    if not caja:
        return 0

    return max(punto[0] for punto in caja)


def extraer_valor_misma_linea(
    texto,
    etiquetas,
):
    if not texto:
        return None

    texto_normalizado = normalizar_texto(texto)

    etiquetas_ordenadas = sorted(
        etiquetas,
        key=len,
        reverse=True,
    )

    # Si toda la línea corresponde exactamente
    # a una etiqueta, el valor está en otra caja OCR.
    #
    # Ejemplo:
    # Comuna - Ciudad
    # : Macul
    for etiqueta in etiquetas_ordenadas:
        etiqueta_normalizada = normalizar_texto(etiqueta)

        if texto_normalizado == etiqueta_normalizada:
            return None

    for etiqueta in etiquetas_ordenadas:
        etiqueta_normalizada = normalizar_texto(etiqueta)

        if not texto_normalizado.startswith(etiqueta_normalizada):
            continue

        resto = texto[len(etiqueta) :]

        resto = limpiar_valor_extraido(resto)

        if resto:
            return resto

    return None


def extraer_valor_a_derecha(
    lineas,
    etiquetas,
    tolerancia_vertical=15,
):
    etiquetas_normalizadas = [normalizar_texto(etiqueta) for etiqueta in etiquetas]

    posibles_etiquetas = []

    for linea in lineas:
        texto_normalizado = normalizar_texto(linea.get("texto", ""))

        for etiqueta in etiquetas_normalizadas:
            patron = re.compile(rf"^{re.escape(etiqueta)}" r"\s*[:\-]?\s*$")

            if patron.match(texto_normalizado):
                posibles_etiquetas.append(linea)
                break

    for linea_etiqueta in posibles_etiquetas:
        caja_etiqueta = linea_etiqueta.get("caja")

        if not caja_etiqueta:
            continue

        derecha_etiqueta = derecha_caja(caja_etiqueta)

        centro_y_etiqueta = centro_vertical(caja_etiqueta)

        candidatos = []

        for linea in lineas:
            if linea is linea_etiqueta:
                continue

            caja = linea.get("caja")

            if not caja:
                continue

            izquierda = izquierda_caja(caja)

            centro_y = centro_vertical(caja)

            diferencia_vertical = abs(centro_y - centro_y_etiqueta)

            if (
                izquierda > derecha_etiqueta
                and diferencia_vertical <= tolerancia_vertical
            ):
                candidatos.append(
                    (
                        diferencia_vertical,
                        izquierda,
                        linea,
                    )
                )

        if not candidatos:
            continue

        candidatos.sort(
            key=lambda candidato: (
                candidato[0],
                candidato[1],
            )
        )

        return limpiar_valor_extraido(candidatos[0][2].get("texto"))

    return None


def es_nombre_probable(valor):
    if not valor:
        return False

    normalizado = normalizar_texto(valor)

    if len(normalizado) < 5:
        return False

    if re.search(
        r"\d",
        normalizado,
    ):
        return False

    frases_invalidas = (
        "nombre del cliente",
        "datos del cliente",
        "nombre cliente",
        "cliente",
        "titular",
        "razon social",
    )

    if normalizado in frases_invalidas:
        return False

    if any(palabra in normalizado for palabra in PALABRAS_EMPRESA):
        return False

    palabras = re.findall(
        r"[a-zñ]+",
        normalizado,
    )

    if len(palabras) < 2:
        return False

    if len(palabras) > 8:
        return False

    return True


def es_direccion_probable(valor):
    if not valor:
        return False

    normalizado = normalizar_texto(valor)

    if len(normalizado) < 5:
        return False

    if not re.search(
        r"\d",
        normalizado,
    ):
        return False

    if re.fullmatch(
        r"\d{1,2}" r"[-/.]" r"\d{1,2}" r"[-/.]" r"\d{2,4}",
        normalizado,
    ):
        return False

    palabras_invalidas = (
        "rut",
        "telefono",
        "cliente n",
        "boleta",
        "factura",
        "fecha",
        "emision",
        "vencimiento",
        "total",
        "monto",
        "servicio",
        "periodo",
        "codigo",
    )

    if any(palabra in normalizado for palabra in palabras_invalidas):
        return False

    return True


def es_comuna_probable(valor):
    if not valor:
        return False

    normalizado = normalizar_texto(valor)

    if len(normalizado) < 3:
        return False

    if len(normalizado) > 80:
        return False

    if re.search(
        r"\d",
        normalizado,
    ):
        return False

    palabras_invalidas = (
        "cliente",
        "direccion",
        "domicilio",
        "telefono",
        "boleta",
        "factura",
        "servicio",
        "emision",
        "vencimiento",
        "total",
        "monto",
        "rut",
    )

    if any(palabra in normalizado for palabra in palabras_invalidas):
        return False

    return True


def extraer_por_etiquetas(
    lineas,
    etiquetas,
    validador,
):
    for linea in lineas:
        valor = extraer_valor_misma_linea(
            linea.get(
                "texto",
                "",
            ),
            etiquetas,
        )

        if valor and validador(valor):
            return valor

    valor_derecha = extraer_valor_a_derecha(
        lineas,
        etiquetas,
    )

    if valor_derecha and validador(valor_derecha):
        return valor_derecha

    return None


def obtener_lineas_ordenadas(lineas):
    lineas_validas = [
        linea for linea in lineas if linea.get("caja") and linea.get("texto")
    ]

    return sorted(
        lineas_validas,
        key=lambda linea: (
            centro_vertical(linea["caja"]),
            izquierda_caja(linea["caja"]),
        ),
    )


def extraer_bloque_domicilio_sin_etiquetas(
    lineas,
):
    lineas_ordenadas = obtener_lineas_ordenadas(lineas)

    mejores = []

    for indice, linea in enumerate(lineas_ordenadas):
        direccion = limpiar_valor_extraido(linea.get("texto"))

        if not es_direccion_probable(direccion):
            continue

        nombre = None
        comuna = None

        centro_direccion = centro_vertical(linea["caja"])

        for desplazamiento in (
            1,
            2,
            3,
        ):
            indice_nombre = indice - desplazamiento

            if indice_nombre < 0:
                break

            candidato = lineas_ordenadas[indice_nombre]

            diferencia = centro_direccion - centro_vertical(candidato["caja"])

            if diferencia > 100:
                break

            texto_candidato = limpiar_valor_extraido(candidato.get("texto"))

            if es_nombre_probable(texto_candidato):
                nombre = texto_candidato
                break

        for desplazamiento in (
            1,
            2,
            3,
        ):
            indice_comuna = indice + desplazamiento

            if indice_comuna >= len(lineas_ordenadas):
                break

            candidato = lineas_ordenadas[indice_comuna]

            diferencia = centro_vertical(candidato["caja"]) - centro_direccion

            if diferencia > 100:
                break

            texto_candidato = limpiar_valor_extraido(candidato.get("texto"))

            if es_comuna_probable(texto_candidato):
                comuna = texto_candidato
                break

        puntaje = 0

        if nombre:
            puntaje += 2

        if comuna:
            puntaje += 2

        direccion_normalizada = normalizar_texto(direccion)

        palabras_calle = (
            "calle",
            "avenida",
            "av.",
            "pasaje",
            "pje",
            "camino",
            "ruta",
            "obispo",
        )

        if any(palabra in direccion_normalizada for palabra in palabras_calle):
            puntaje += 1

        mejores.append(
            (
                puntaje,
                {
                    "nombre": nombre,
                    "direccion": direccion,
                    "comuna": comuna,
                },
            )
        )

    if not mejores:
        return {
            "nombre": None,
            "direccion": None,
            "comuna": None,
        }

    mejores.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    mejor_puntaje, mejor_bloque = mejores[0]

    if mejor_puntaje < 2:
        return {
            "nombre": None,
            "direccion": None,
            "comuna": None,
        }

    return mejor_bloque


def extraer_datos_personales(lineas):
    nombre = extraer_por_etiquetas(
        lineas,
        ETIQUETAS_NOMBRE,
        es_nombre_probable,
    )

    direccion = extraer_por_etiquetas(
        lineas,
        ETIQUETAS_DIRECCION,
        es_direccion_probable,
    )

    comuna = extraer_por_etiquetas(
        lineas,
        ETIQUETAS_COMUNA,
        es_comuna_probable,
    )

    if nombre and direccion and comuna:
        return {
            "nombre": nombre,
            "direccion": direccion,
            "comuna": comuna,
        }

    fallback = extraer_bloque_domicilio_sin_etiquetas(lineas)

    return {
        "nombre": (nombre or fallback["nombre"]),
        "direccion": (direccion or fallback["direccion"]),
        "comuna": (comuna or fallback["comuna"]),
    }


def construir_fecha(
    dia,
    mes,
    anio,
):
    try:
        return date(
            int(anio),
            int(mes),
            int(dia),
        )
    except (
        TypeError,
        ValueError,
    ):
        return None


def extraer_fecha_emision(
    texto_completo,
    lineas=None,
):
    # Primero se intenta mediante posición espacial.
    # Esto permite distinguir:
    #
    # FECHA DE EMISIÓN       12-abr-2016
    # FECHA DE VENCIMIENTO   03-may-2016

    if lineas:
        valor_fecha = extraer_valor_a_derecha(
            lineas,
            (
                "fecha de emisión",
                "fecha emisión",
                "fecha emisión documento",
                "emisión",
            ),
            tolerancia_vertical=20,
        )

        fecha = convertir_texto_a_fecha(valor_fecha)

        if fecha is not None:
            return fecha

    # Fallback para documentos donde la etiqueta y
    # la fecha forman parte del mismo bloque de texto.

    texto = normalizar_texto(texto_completo)

    etiqueta = (
        r"(?:"
        r"fecha\s+(?:de\s+)?emision"
        r"(?:\s+(?:del\s+)?documento)?"
        r"|"
        r"emision"
        r"(?:\s+(?:del\s+)?documento)?"
        r")"
    )

    patron = re.compile(
        etiqueta
        + r"\s*:?\s*"
        + r"("
        + r"\d{1,2}"
        + r"\s*(?:[-/.]|\s+de\s+|\s+)\s*"
        + r"(?:\d{1,2}|[a-z]+)"
        + r"\s*(?:[-/.]|\s+de\s+|\s+)\s*"
        + r"\d{4}"
        + r")",
        re.IGNORECASE,
    )

    coincidencia = patron.search(texto)

    if not coincidencia:
        return None

    return convertir_texto_a_fecha(coincidencia.group(1))


def convertir_texto_a_fecha(texto):
    if not texto:
        return None

    valor = normalizar_texto(texto)

    valor = re.sub(
        r"^[\s:;|=\-–—]+",
        "",
        valor,
    ).strip()

    # 12-04-2016
    # 12/04/2016
    # 12.04.2016
    coincidencia = re.search(
        r"(\d{1,2})" r"\s*[-/.]\s*" r"(\d{1,2})" r"\s*[-/.]\s*" r"(\d{4})",
        valor,
    )

    if coincidencia:
        return construir_fecha(
            coincidencia.group(1),
            coincidencia.group(2),
            coincidencia.group(3),
        )

    # 12-abr-2016
    # 12 Abr 2023
    # 19 de Abril de 2003
    coincidencia = re.search(
        r"(\d{1,2})"
        r"\s*(?:[-/.]|\s+de\s+|\s+)\s*"
        r"([a-z]+)"
        r"\s*(?:[-/.]|\s+de\s+|\s+)\s*"
        r"(\d{4})",
        valor,
    )

    if not coincidencia:
        return None

    mes = MESES.get(normalizar_texto(coincidencia.group(2)))

    if mes is None:
        return None

    return construir_fecha(
        coincidencia.group(1),
        mes,
        coincidencia.group(3),
    )


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
            "dias_antiguedad": (dias_antiguedad),
            "motivo": ("La fecha del documento se " "encuentra en el futuro."),
        }

    if dias_antiguedad > maximo_dias:
        return {
            "valida": False,
            "dias_antiguedad": (dias_antiguedad),
            "motivo": (
                f"El documento supera los " f"{maximo_dias} días de antigüedad."
            ),
        }

    return {
        "valida": True,
        "dias_antiguedad": (dias_antiguedad),
        "motivo": ("Documento vigente."),
    }


def analizar_documento_residencia(
    resultado_ocr,
):
   

    datos_personales = extraer_datos_personales(resultado_ocr["lineas"])

    fecha_emision = extraer_fecha_emision(
        resultado_ocr["texto_completo"],
        resultado_ocr["lineas"],
    )

    validacion_antiguedad = validar_antiguedad_documento(fecha_emision)

    return {
        "nombre": (datos_personales["nombre"]),
        "direccion": (datos_personales["direccion"]),
        "comuna": (datos_personales["comuna"]),
        "fecha_emision": (fecha_emision),
        "confianza_ocr": (resultado_ocr["confianza_promedio"]),
        "documento_vigente": (validacion_antiguedad["valida"]),
        "dias_antiguedad": (validacion_antiguedad["dias_antiguedad"]),
        "motivo_antiguedad": (validacion_antiguedad["motivo"]),
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


def calcular_hash_archivo(
    ruta_archivo,
):
    ruta = Path(ruta_archivo)

    if not ruta.exists():
        raise FileNotFoundError(f"No existe el archivo: {ruta}")

    hash_sha256 = hashlib.sha256()

    with ruta.open("rb") as archivo:
        for bloque in iter(
            lambda: archivo.read(1024 * 1024),
            b"",
        ):
            hash_sha256.update(bloque)

    return hash_sha256.hexdigest()
