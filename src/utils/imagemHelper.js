/**
 * Lê uma imagem escolhida no <input type="file"> e devolve um base64 JPEG
 * reduzido (lado maior = tamanhoMax px). Evita mandar fotos de celular de
 * vários MB para a API (estoura o post_max_size do PHP e deixa a listagem lenta).
 */
export function lerImagemRedimensionada(arquivo, tamanhoMax = 400, qualidade = 0.8) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !arquivo.type.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem (JPG, PNG...).'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida.'))
      img.onload = () => {
        const escala = Math.min(1, tamanhoMax / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * escala)
        canvas.height = Math.round(img.height * escala)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', qualidade))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(arquivo)
  })
}
