import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const [, , inputPath, outputPath] = process.argv
if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/remove-icon-bg.mjs <input> <output.png>')
  process.exit(1)
}

const threshold = Number(process.env.BG_THRESHOLD || 28)
const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  if (r < threshold && g < threshold && b < threshold) {
    data[i + 3] = 0
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(outputPath)

console.log(`Saved ${outputPath} (${info.width}x${info.height})`)
