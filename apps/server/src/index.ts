import { serve } from '@hono/node-server'
import { app } from './app.js'

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3333) }, (info) => {
  console.log(`server listening on http://localhost:${info.port}`)
})
