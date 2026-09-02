// Tamaño objetivo del archivo comprimido. Los buckets de invitados aceptan
// 5 MB (perfil), 10 MB (documento) y 20 MB (comprobante): apuntar a 1,5 MB deja
// margen de sobra en todos y hace que el admin cargue rápido.
const TARGET_BYTES = 1_500_000;

const EXTENSION: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Chrome y Firefox no saben decodificar HEIC/HEIF (el formato por defecto
      // de las fotos de iPhone), así que el mensaje tiene que decir qué hacer.
      reject(
        new Error(
          `El navegador no pudo abrir "${file.name}". Si es una foto de iPhone (.HEIC), ` +
            `guardala o exportala como JPG y volvé a subirla.`
        )
      );
    };
    img.src = objectUrl;
  });
}

function encode(
  img: HTMLImageElement,
  width: number,
  height: number,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not available"));
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      type,
      quality
    );
  });
}

export async function compressImage(
  file: File,
  {
    maxWidth = 1920,
    quality = 0.85,
    maxBytes = TARGET_BYTES,
  }: { maxWidth?: number; quality?: number; maxBytes?: number } = {}
): Promise<File> {
  const img = await loadImage(file);

  let width = Math.min(img.width, maxWidth);
  let height = Math.round((img.height * width) / img.width);
  let q = quality;

  // Safari (iOS incluido) ignora en silencio los formatos que no sabe encodear
  // y devuelve un PNG, que además no respeta `quality`. Antes se etiquetaba ese
  // PNG como image/webp: una foto de 1920x2560 pesaba 8,9 MB y el bucket la
  // rechazaba con "The object exceeded the maximum allowed size" recién en el
  // submit, con el formulario entero completo (pasó en producción el 2/9/2026).
  // Por eso se mira el `type` real del blob, no el que se pidió.
  let type = "image/webp";
  let blob = await encode(img, width, height, type, q);
  if (blob.type !== type) {
    type = "image/jpeg";
    blob = await encode(img, width, height, type, q);
  }

  // Con PNG (ningún navegador conocido llega acá, pero por las dudas) bajar la
  // calidad no hace nada: solo achicar sirve.
  const qualityWorks = type !== "image/png";

  for (let attempt = 0; blob.size > maxBytes && attempt < 6; attempt++) {
    if (qualityWorks && q > 0.55) {
      q -= 0.15;
    } else {
      width = Math.round(width * 0.75);
      height = Math.round((img.height * width) / img.width);
    }
    blob = await encode(img, width, height, type, q);
  }

  const ext = EXTENSION[blob.type] ?? "jpg";
  const outputName = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  return new File([blob], outputName, { type: blob.type, lastModified: Date.now() });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
