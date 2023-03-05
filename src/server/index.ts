import { createServer } from 'node:http'
import { parse } from 'node:url'
import next from 'next'
import { registerWorkers } from './workers'

// Make sure commands gracefully respect termination signals (e.g. from Docker)
// Allow the graceful termination to be manually configurable
if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => process.exit(0))
  process.on('SIGINT', () => process.exit(0))
}

const dev = process.env.NODE_ENV !== 'production'
const currentPort = parseInt(process.env.PORT || '3000', 10)
const hostname = process.env.HOSTNAME || 'localhost'

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port: currentPort, customServer: true })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  registerWorkers()
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      // @ts-expect-error ???
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(currentPort, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`)
    })
})
