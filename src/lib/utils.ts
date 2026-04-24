export interface Subnet {
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

export interface Step {
  title: string
  description: string
  calculation?: string
}

export interface IPClass {
  class: string
  range: string
  defaultMask: string
  defaultCIDR: number
  description: string
}

export const IP_CLASSES: IPClass[] = [
  { class: "A", range: "1.0.0.0 - 126.255.255.255", defaultMask: "255.0.0.0", defaultCIDR: 8, description: "Redes muy grandes (16M hosts)" },
  { class: "B", range: "128.0.0.0 - 191.255.255.255", defaultMask: "255.255.0.0", defaultCIDR: 16, description: "Redes medianas (65K hosts)" },
  { class: "C", range: "192.0.0.0 - 223.255.255.255", defaultMask: "255.255.255.0", defaultCIDR: 24, description: "Redes pequeñas (254 hosts)" },
  { class: "D", range: "224.0.0.0 - 239.255.255.255", defaultMask: "N/A", defaultCIDR: 0, description: "Multicast" },
  { class: "E", range: "240.0.0.0 - 255.255.255.255", defaultMask: "N/A", defaultCIDR: 0, description: "Experimental/Reservado" },
]

export function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".")
}

export function getIPClass(firstOctet: number): IPClass | null {
  if (firstOctet >= 1 && firstOctet <= 126) return IP_CLASSES[0]
  if (firstOctet >= 128 && firstOctet <= 191) return IP_CLASSES[1]
  if (firstOctet >= 192 && firstOctet <= 223) return IP_CLASSES[2]
  if (firstOctet >= 224 && firstOctet <= 239) return IP_CLASSES[3]
  if (firstOctet >= 240 && firstOctet <= 255) return IP_CLASSES[4]
  return null
}

export function isValidIP(ip: string): boolean {
  const parts = ip.split(".")
  if (parts.length !== 4) return false
  return parts.every((part) => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255 && part === String(num)
  })
}

export function calculateSubnets(ip: string, numSubnets: number): { subnets: Subnet[]; steps: Step[]; ipClass: IPClass | null } {
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
