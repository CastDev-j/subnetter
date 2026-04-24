import { useState } from "react"

interface Subnet {
  index: number
  networkAddress: string
  firstHost: string
  lastHost: string
  broadcastAddress: string
  mask: string
  cidr: number
  totalHosts: number
  usableHosts: number
}

interface Step {
  title: string
  description: string
  calculation?: string
}

interface IPClass {
  class: string
  range: string
  defaultMask: string
  defaultCIDR: number
  description: string
}

const IP_CLASSES: IPClass[] = [
  { class: "A", range: "1.0.0.0 - 126.255.255.255", defaultMask: "255.0.0.0", defaultCIDR: 8, description: "Redes muy grandes (16M hosts)" },
  { class: "B", range: "128.0.0.0 - 191.255.255.255", defaultMask: "255.255.0.0", defaultCIDR: 16, description: "Redes medianas (65K hosts)" },
  { class: "C", range: "192.0.0.0 - 223.255.255.255", defaultMask: "255.255.255.0", defaultCIDR: 24, description: "Redes pequeñas (254 hosts)" },
  { class: "D", range: "224.0.0.0 - 239.255.255.255", defaultMask: "N/A", defaultCIDR: 0, description: "Multicast" },
  { class: "E", range: "240.0.0.0 - 255.255.255.255", defaultMask: "N/A", defaultCIDR: 0, description: "Experimental/Reservado" },
]

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".")
}

function getIPClass(firstOctet: number): IPClass | null {
  if (firstOctet >= 1 && firstOctet <= 126) return IP_CLASSES[0]
  if (firstOctet >= 128 && firstOctet <= 191) return IP_CLASSES[1]
  if (firstOctet >= 192 && firstOctet <= 223) return IP_CLASSES[2]
  if (firstOctet >= 224 && firstOctet <= 239) return IP_CLASSES[3]
  if (firstOctet >= 240 && firstOctet <= 255) return IP_CLASSES[4]
  return null
}

function isValidIP(ip: string): boolean {
  const parts = ip.split(".")
  if (parts.length !== 4) return false
  return parts.every((part) => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255 && part === String(num)
  })
}

function calculateSubnets(ip: string, numSubnets: number): { subnets: Subnet[]; steps: Step[]; ipClass: IPClass | null } {
  const steps: Step[] = []
  const parts = ip.split(".").map(Number)
  const firstOctet = parts[0]
  const ipClass = getIPClass(firstOctet)

  steps.push({
    title: "Paso 1: Identificar clase de IP",
    description: `La direccion ${ip} pertenece a la Clase ${ipClass?.class || "Desconocida"}`,
    calculation: `Primer octeto: ${firstOctet} -> ${ipClass?.description || "No valida"}`,
  })

  if (!ipClass || ipClass.class === "D" || ipClass.class === "E") {
    steps.push({
      title: "Advertencia",
      description: `Las direcciones de Clase ${ipClass?.class} no se pueden dividir en subredes.`,
    })
    return { subnets: [], steps, ipClass }
  }

  const defaultCIDR = ipClass.defaultCIDR
  const bitsNeeded = Math.ceil(Math.log2(numSubnets))
  const newCIDR = defaultCIDR + bitsNeeded
  const actualSubnets = Math.pow(2, bitsNeeded)

  steps.push({
    title: "Paso 2: Bits necesarios para subredes",
    description: `Para ${numSubnets} subredes, encontrar n donde 2^n >= ${numSubnets}`,
    calculation: `2^${bitsNeeded} = ${actualSubnets} subredes | Bits prestados: ${bitsNeeded}`,
  })

  steps.push({
    title: "Paso 3: Nueva mascara de subred",
    description: `Mascara original: /${defaultCIDR} (${ipClass.defaultMask})`,
    calculation: `Nueva mascara: /${defaultCIDR} + ${bitsNeeded} = /${newCIDR}`,
  })

  if (newCIDR > 30) {
    steps.push({
      title: "Error",
      description: "La cantidad de subredes excede el limite (CIDR maximo /30).",
    })
    return { subnets: [], steps, ipClass }
  }

  const hostBits = 32 - newCIDR
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = totalHosts - 2

  steps.push({
    title: "Paso 4: Hosts por subred",
    description: `Bits para hosts: 32 - ${newCIDR} = ${hostBits} bits`,
    calculation: `Total: 2^${hostBits} = ${totalHosts} | Utilizables: ${totalHosts} - 2 = ${usableHosts}`,
  })

  const maskNumber = (0xffffffff << (32 - newCIDR)) >>> 0
  const newMask = numberToIp(maskNumber)

  steps.push({
    title: "Paso 5: Mascara en decimal",
    description: `Convertir /${newCIDR} a notacion decimal`,
    calculation: `Mascara: ${newMask}`,
  })

  const ipNum = ipToNumber(ip)
  const baseNetwork = ipNum & maskNumber

  steps.push({
    title: "Paso 6: Direccion de red base",
    description: `Operacion AND logico entre IP y mascara`,
    calculation: `${ip} AND ${newMask} = ${numberToIp(baseNetwork)}`,
  })

  const subnets: Subnet[] = []
  const subnetSize = totalHosts

  for (let i = 0; i < actualSubnets; i++) {
    const networkNum = baseNetwork + i * subnetSize
    const broadcastNum = networkNum + subnetSize - 1
    const firstHostNum = networkNum + 1
    const lastHostNum = broadcastNum - 1

    subnets.push({
      index: i + 1,
      networkAddress: numberToIp(networkNum),
      firstHost: numberToIp(firstHostNum),
      lastHost: numberToIp(lastHostNum),
      broadcastAddress: numberToIp(broadcastNum),
      mask: newMask,
      cidr: newCIDR,
      totalHosts,
      usableHosts,
    })
  }

  steps.push({
    title: "Paso 7: Generar subredes",
    description: `${actualSubnets} subredes con ${usableHosts} hosts utilizables cada una`,
    calculation: `Incremento entre subredes: ${subnetSize} direcciones`,
  })

  return { subnets, steps, ipClass }
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0")
  const [numSubnets, setNumSubnets] = useState(4)
  const [result, setResult] = useState<{ subnets: Subnet[]; steps: Step[]; ipClass: IPClass | null } | null>(null)
  const [error, setError] = useState("")

  const handleCalculate = () => {
    setError("")
    setResult(null)

    if (!isValidIP(ip)) {
      setError("Direccion IPv4 no valida (ej: 192.168.1.0)")
      return
    }

    if (numSubnets < 2 || numSubnets > 16384) {
      setError("Subredes debe estar entre 2 y 16384")
      return
    }

    const calculationResult = calculateSubnets(ip, numSubnets)
    setResult(calculationResult)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 p-6 md:p-12 font-mono">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-neutral-800 pb-6">
          <h1 className="text-2xl text-neutral-100 font-medium tracking-tight">
            Calculadora de Subredes IPv4
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Subnetting con pasos detallados
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
            Clases de IP
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="text-left py-3 pr-4 font-medium">Clase</th>
                  <th className="text-left py-3 pr-4 font-medium">Rango</th>
                  <th className="text-left py-3 pr-4 font-medium">Mascara</th>
                  <th className="text-left py-3 font-medium">Uso</th>
                </tr>
              </thead>
              <tbody>
                {IP_CLASSES.map((cls) => (
                  <tr key={cls.class} className="border-b border-neutral-900">
                    <td className="py-3 pr-4 text-neutral-100">{cls.class}</td>
                    <td className="py-3 pr-4 text-neutral-400">{cls.range}</td>
                    <td className="py-3 pr-4 text-neutral-400">{cls.defaultMask}</td>
                    <td className="py-3 text-neutral-500">{cls.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
            Parametros
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="ip" className="block text-xs text-neutral-500 mb-2">
                Direccion IPv4
              </label>
              <input
                type="text"
                id="ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.0"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 text-sm"
              />
            </div>
            <div>
              <label htmlFor="subnets" className="block text-xs text-neutral-500 mb-2">
                Cantidad de Subredes
              </label>
              <input
                type="number"
                id="subnets"
                value={numSubnets}
                onChange={(e) => setNumSubnets(parseInt(e.target.value) || 2)}
                min={2}
                max={16384}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                className="w-full px-4 py-2 bg-neutral-100 text-neutral-900 font-medium text-sm hover:bg-neutral-200 transition-colors"
              >
                Calcular
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-sm text-neutral-400 border-l-2 border-neutral-600 pl-3">
              {error}
            </p>
          )}
        </section>

        {result && (
          <>
            {result.ipClass && (
              <section className="mb-12">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  Clase Detectada
                </h2>
                <div className="flex items-baseline gap-4 border-l-2 border-neutral-700 pl-4">
                  <span className="text-3xl text-neutral-100">{result.ipClass.class}</span>
                  <div>
                    <p className="text-neutral-400">{result.ipClass.description}</p>
                    <p className="text-xs text-neutral-600 mt-1">
                      Mascara: {result.ipClass.defaultMask} (/{result.ipClass.defaultCIDR})
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Proceso de Calculo
              </h2>
              <div className="space-y-6">
                {result.steps.map((step, index) => (
                  <div key={index} className="border-l border-neutral-800 pl-4">
                    <h3 className="text-sm text-neutral-200 mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-500">{step.description}</p>
                    {step.calculation && (
                      <code className="block mt-2 text-xs text-neutral-400 bg-neutral-900 px-3 py-2 border-l-2 border-neutral-700">
                        {step.calculation}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {result.subnets.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  Tabla de Subredes
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500">
                        <th className="text-left py-3 pr-4 font-medium">#</th>
                        <th className="text-left py-3 pr-4 font-medium">Red</th>
                        <th className="text-left py-3 pr-4 font-medium">Primer Host</th>
                        <th className="text-left py-3 pr-4 font-medium">Ultimo Host</th>
                        <th className="text-left py-3 pr-4 font-medium">Broadcast</th>
                        <th className="text-left py-3 pr-4 font-medium">Mascara</th>
                        <th className="text-right py-3 font-medium">Hosts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subnets.map((subnet) => (
                        <tr key={subnet.index} className="border-b border-neutral-900">
                          <td className="py-3 pr-4 text-neutral-500">{subnet.index}</td>
                          <td className="py-3 pr-4 text-neutral-100">{subnet.networkAddress}/{subnet.cidr}</td>
                          <td className="py-3 pr-4 text-neutral-400">{subnet.firstHost}</td>
                          <td className="py-3 pr-4 text-neutral-400">{subnet.lastHost}</td>
                          <td className="py-3 pr-4 text-neutral-400">{subnet.broadcastAddress}</td>
                          <td className="py-3 pr-4 text-neutral-500">{subnet.mask}</td>
                          <td className="py-3 text-right text-neutral-300">{subnet.usableHosts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-900">
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide">Subredes</p>
                    <p className="text-lg text-neutral-100 mt-1">{result.subnets.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide">Hosts/Subred</p>
                    <p className="text-lg text-neutral-100 mt-1">{result.subnets[0]?.usableHosts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide">CIDR</p>
                    <p className="text-lg text-neutral-100 mt-1">/{result.subnets[0]?.cidr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide">Total IPs</p>
                    <p className="text-lg text-neutral-100 mt-1">
                      {result.subnets.length * (result.subnets[0]?.totalHosts || 0)}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <footer className="text-xs text-neutral-700 border-t border-neutral-900 pt-6">
          IPv4 Subnet Calculator
        </footer>
      </div>
    </main>
  )
}
