import { createReadStream, existsSync } from 'node:fs'
import { stat, readFile } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', 'dist')
const host = '127.0.0.1'
const port = 4173

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Not found')
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`)
    let pathname = decodeURIComponent(url.pathname)

    if (pathname === '/') {
      pathname = '/index.html'
    }

    let targetPath = path.join(rootDir, pathname)

    if (existsSync(targetPath)) {
      const fileStat = await stat(targetPath)
      if (fileStat.isDirectory()) {
        targetPath = path.join(targetPath, 'index.html')
      }
    } else {
      targetPath = path.join(rootDir, 'index.html')
    }

    if (!existsSync(targetPath)) {
      sendNotFound(response)
      return
    }

    const extension = path.extname(targetPath).toLowerCase()
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
    })

    if (extension === '.html') {
      const html = await readFile(targetPath)
      response.end(html)
      return
    }

    createReadStream(targetPath).pipe(response)
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(error instanceof Error ? error.message : 'Server error')
  }
})

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}`)
})
