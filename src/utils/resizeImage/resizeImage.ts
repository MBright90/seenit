async function resizeImage(file: File, maxSize: number): Promise<File> {
  if (!file || !file.type.match(/image.*/)) return file

  const image = new Image()
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  image.src = URL.createObjectURL(file)
  await image.decode()
  let [width, height] = [image.width, image.height]

  // Resizing the image and keeping its aspect ratio
  if (width > height) {
    if (width > maxSize) {
      height *= maxSize / width
      width = maxSize
    }
  } else {
    if (height > maxSize) {
      width *= maxSize / height
      height = maxSize
    }
  }

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.clearRect(0, 0, width, height)
  context.fillStyle = 'transparent'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const resizedImage: Blob | null = await new Promise((rs) => canvas.toBlob(rs, 'image/png', 1))

  return new File([resizedImage!], file.name, { type: resizedImage!.type })
}

export default resizeImage
