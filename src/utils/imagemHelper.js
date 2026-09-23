const LADO_MAXIMO = 800
const QUALIDADE_JPEG = 0.85

/**
 * Lê um arquivo de imagem (PNG, WebP, JPEG...) e devolve um data URI JPEG,
 * reduzido para no máximo LADO_MAXIMO px no maior lado.
 *
 * O PDF do cartão tradicionalista é gerado num servidor sem a extensão GD,
 * onde o Dompdf só consegue desenhar JPEG. Transparência vira fundo branco.
 */
export function converterFotoParaJpeg(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()

    img.onload = () => {
      const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', QUALIDADE_JPEG))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagem inválida'))
    }

    img.src = url
  })
}
