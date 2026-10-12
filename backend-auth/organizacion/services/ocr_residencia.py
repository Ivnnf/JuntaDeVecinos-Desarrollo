from pathlib import Path

import pypdfium2 as pdfium
from rapidocr import RapidOCR


_motor_ocr = None


def obtener_motor_ocr():
    global _motor_ocr

    if _motor_ocr is None:
        _motor_ocr = RapidOCR(
            params={
                "Rec.lang_type": "es",
            }
        )

    return _motor_ocr


def construir_resultado_ocr(resultado):
    textos = list(resultado.txts or ())
    puntajes = [
        float(puntaje)
        for puntaje in (resultado.scores or ())
    ]

    cajas = (
        list(resultado.boxes)
        if resultado.boxes is not None
        else []
    )

    lineas = []

    cantidad = min(
        len(textos),
        len(puntajes),
        len(cajas),
    )

    for indice in range(cantidad):
        texto = textos[indice]
        puntaje = puntajes[indice]
        caja = cajas[indice]

        lineas.append(
            {
                "texto": texto,
                "confianza": round(
                    puntaje,
                    4,
                ),
                "caja": caja.tolist(),
            }
        )

    confianza_promedio = (
        round(
            sum(puntajes) / len(puntajes),
            4,
        )
        if puntajes
        else 0.0
    )

    return {
        "texto_completo": "\n".join(textos),
        "lineas": lineas,
        "confianza_promedio": confianza_promedio,
    }


def extraer_texto_imagen(ruta_archivo):
    ruta = Path(ruta_archivo)

    if not ruta.exists():
        raise FileNotFoundError(
            f"No existe el archivo: {ruta}"
        )

    motor = obtener_motor_ocr()

    resultado = motor(str(ruta))

    return construir_resultado_ocr(
        resultado
    )


def extraer_texto_pdf(ruta_archivo):
    ruta = Path(ruta_archivo)

    if not ruta.exists():
        raise FileNotFoundError(
            f"No existe el archivo: {ruta}"
        )

    documento = pdfium.PdfDocument(
        str(ruta)
    )

    if len(documento) == 0:
        documento.close()

        raise ValueError(
            "El PDF no contiene páginas."
        )

    try:
        pagina = documento[0]

        bitmap = pagina.render(
            scale=3,
            rev_byteorder=True,
        )

        try:
            imagen = (
                bitmap
                .to_numpy()
                .copy()
            )
        finally:
            bitmap.close()
            pagina.close()

    finally:
        documento.close()

    motor = obtener_motor_ocr()

    resultado = motor(imagen)

    return construir_resultado_ocr(
        resultado
    )


def extraer_texto_documento(ruta_archivo):
    ruta = Path(ruta_archivo)

    extension = ruta.suffix.lower()

    if extension == ".pdf":
        return extraer_texto_pdf(ruta)

    if extension in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".bmp",
        ".tif",
        ".tiff",
    }:
        return extraer_texto_imagen(ruta)

    raise ValueError(
        "Formato de archivo no compatible con OCR."
    )