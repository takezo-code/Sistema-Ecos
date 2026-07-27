import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, 'manual-jogador.html')
const pdfPath = path.join(__dirname, 'Manual-do-Jogador-Sistema-Eco.pdf')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' })
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
})
await browser.close()
console.log('PDF gerado:', pdfPath)
