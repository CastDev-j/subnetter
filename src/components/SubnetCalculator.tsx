import { useState } from "react"
import { calculateSubnets, isValidIP, type Subnet, type Step, type IPClass } from "../lib/utils"
import IPClassesTable from "./IPClassesTable"
import SubnetParams from "./SubnetParams"
import IPClassInfo from "./IPClassInfo"
import CalculationSteps from "./CalculationSteps"
import SubnetsTable from "./SubnetsTable"
import SubnetSummary from "./SubnetSummary"

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
        </header>

        <IPClassesTable />

        <SubnetParams
          ip={ip}
          numSubnets={numSubnets}
          error={error}
          onIpChange={setIp}
          onSubnetsChange={setNumSubnets}
          onCalculate={handleCalculate}
        />

        {result && (
          <>
            {result.ipClass && <IPClassInfo ipClass={result.ipClass} />}

            <CalculationSteps steps={result.steps} />

            {result.subnets.length > 0 && (
              <>
                <SubnetsTable subnets={result.subnets} />
                <SubnetSummary subnets={result.subnets} />
              </>
            )}
          </>
        )}

        <footer className="text-xs text-neutral-700 border-t border-neutral-900 pt-6">
          IPv4 Subnet Calculator <a href="https://github.com/CastDev-j/subnetter" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Repositorio
          </a>
        </footer>
      </div>
    </main>
  )
}
