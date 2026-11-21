import { spawn } from "node:child_process"

const apiUrl = process.env.API_URL ?? "http://localhost:3333"
const extraArgs = process.argv.slice(2)

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    })
    child.on("error", reject)
    child.on("exit", (code) => resolve(code ?? 1))
  })
}

async function isApiReachable() {
  try {
    const res = await fetch(`${apiUrl}/guest-login`, { method: "POST" })
    return res.ok
  } catch {
    return false
  }
}

async function waitForApi(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isApiReachable()) return true
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return false
}

const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(apiUrl)
const port = new URL(apiUrl).port || "3333"

const preBuild = await run("pnpm", ["exec", "turbo", "run", "build", "--filter=server", "--filter=@playground/design-system", ...extraArgs])
if (preBuild !== 0) process.exit(preBuild)

let server = null
try {
  if (isLocalApi && !(await isApiReachable())) {
    server = spawn(process.execPath, ["apps/server/dist/index.js"], {
      env: { ...process.env, PORT: port },
      stdio: "inherit",
    })
    const ready = await waitForApi()
    if (!ready) {
      console.error(`API did not become ready at ${apiUrl} within 15s.`)
      process.exit(1)
    }
  }

  const webBuild = await run("pnpm", ["exec", "turbo", "run", "build", "--filter=web", ...extraArgs])
  process.exit(webBuild)
} finally {
  if (server && !server.killed) {
    server.kill()
  }
}
