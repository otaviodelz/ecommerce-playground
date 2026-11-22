import { execFileSync, spawn } from "node:child_process"
import net from "node:net"

const mode = process.argv[2] ?? "start"
const extraArgs = process.argv.slice(3)

if (!["dev", "start", "stop"].includes(mode)) {
  console.error(`Uso: node scripts/run-zones.mjs <dev|start|stop> [turbo args...]`)
  process.exit(1)
}

function portFromUrl(url, fallback) {
  if (!url) return fallback
  try {
    const parsed = new URL(url)
    return Number(parsed.port) || (parsed.protocol === "https:" ? 443 : 80)
  } catch {
    return fallback
  }
}

const SERVICES = [
  { name: "server", filter: "server", port: Number(process.env.PORT) || portFromUrl(process.env.API_URL, 3333) },
  { name: "discovery", filter: "@playground/discovery", port: portFromUrl(process.env.DISCOVERY_ZONE_URL, 3000) },
  { name: "pdp", filter: "@playground/pdp", port: portFromUrl(process.env.PDP_ZONE_URL, 3001) },
  { name: "cart-auth", filter: "@playground/cart-auth", port: portFromUrl(process.env.CART_AUTH_ZONE_URL, 3002) },
  { name: "account", filter: "@playground/account", port: portFromUrl(process.env.ACCOUNT_ZONE_URL, 3003) },
]

const MANAGED_PORTS = [...new Set(SERVICES.map((s) => s.port))]

function findPidsByPortWindows(ports) {
  const portSet = new Set(ports)
  const matches = new Map()
  try {
    const output = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    for (const line of output.split(/\r?\n/)) {
      const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+(?:LISTENING|ESCUTANDO)\s+(\d+)\s*$/i)
      if (!m) continue
      const port = Number(m[1])
      const pid = Number(m[2])
      if (!portSet.has(port) || pid <= 0 || pid === process.pid) continue
      if (!matches.has(port)) matches.set(port, new Set())
      matches.get(port).add(pid)
    }
  } catch {}
  return matches
}

function findPidsByPortUnix(ports) {
  const matches = new Map()
  for (const port of ports) {
    try {
      const output = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      const pids = output
        .split(/\r?\n/)
        .map((v) => Number(v.trim()))
        .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid)
      if (pids.length > 0) matches.set(port, new Set(pids))
    } catch {}
  }
  return matches
}

function killPidTree(pid) {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" })
    } else {
      process.kill(pid, "SIGTERM")
    }
  } catch {}
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once("error", () => resolve(false))
    server.once("listening", () => {
      server.close(() => resolve(true))
    })
    server.listen(port)
  })
}

async function waitForPortsFree(ports, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const checks = await Promise.all(ports.map((p) => isPortFree(p)))
    if (checks.every(Boolean)) return true
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  return false
}

async function freeManagedPorts({ quiet = false } = {}) {
  const found = process.platform === "win32" ? findPidsByPortWindows(MANAGED_PORTS) : findPidsByPortUnix(MANAGED_PORTS)
  if (found.size === 0) {
    if (!quiet) console.log(`Portas livres: ${MANAGED_PORTS.join(", ")}`)
    return
  }

  const killedPids = new Set()
  const summary = []
  for (const [port, pids] of found) {
    summary.push(`${port} (PID ${[...pids].join(",")})`)
    for (const pid of pids) {
      if (killedPids.has(pid)) continue
      killedPids.add(pid)
      killPidTree(pid)
    }
  }

  if (!quiet) console.log(`Encerrando processos nas portas: ${summary.join(", ")}`)
  const freed = await waitForPortsFree([...found.keys()])
  if (!freed && process.platform !== "win32") {
    for (const pid of killedPids) {
      try {
        process.kill(pid, "SIGKILL")
      } catch {}
    }
    await waitForPortsFree([...found.keys()], 2000)
  }
}

await freeManagedPorts()

if (mode === "stop") {
  process.exit(0)
}

console.log(`Iniciando zonas (${mode}):`)
for (const service of SERVICES) {
  console.log(`  - ${service.name.padEnd(10)} http://localhost:${service.port}`)
}

const filters = SERVICES.map((s) => `--filter=${s.filter}`)
const child = spawn("pnpm", ["exec", "turbo", "run", mode, ...filters, ...extraArgs], {
  stdio: "inherit",
  shell: process.platform === "win32",
})

let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  if (child.pid) killPidTree(child.pid)
  await freeManagedPorts({ quiet: true })
  process.exit(signal === "SIGINT" ? 130 : 143)
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))

child.on("error", (err) => {
  console.error(err)
  process.exit(1)
})

child.on("exit", async (code) => {
  if (!shuttingDown) {
    await freeManagedPorts({ quiet: true })
    process.exit(code ?? 0)
  }
})
