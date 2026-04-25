interface SubnetParamsProps {
  ip: string
  numSubnets: number
  error: string
  onIpChange: (ip: string) => void
  onSubnetsChange: (subnets: number) => void
  onCalculate: () => void
}

export default function SubnetParams({
  ip,
  numSubnets,
  error,
  onIpChange,
  onSubnetsChange,
  onCalculate,
}: SubnetParamsProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-primary-500 mb-4">
        Parametros
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="ip" className="block text-xs text-primary-500 mb-2">
            Direccion IPv4
          </label>
          <input
            type="text"
            id="ip"
            value={ip}
            onChange={(e) => onIpChange(e.target.value)}
            placeholder="192.168.1.0"
            className="w-full px-3 py-2 bg-primary-900 border border-primary-800 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-600 text-sm"
          />
        </div>
        <div>
          <label htmlFor="subnets" className="block text-xs text-primary-500 mb-2">
            Cantidad de Subredes
          </label>
          <input
            type="number"
            id="subnets"
            value={numSubnets}
            onChange={(e) => onSubnetsChange(parseInt(e.target.value) || 2)}
            min={2}
            max={16384}
            className="w-full px-3 py-2 bg-primary-900 border border-primary-800 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-600 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onCalculate}
            className="w-full px-4 py-2 bg-primary-100 text-primary-900 font-medium text-sm hover:bg-primary-200 transition-colors"
          >
            Calcular
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-primary-400 border-l-2 border-primary-600 pl-3">
          {error}
        </p>
      )}
    </section>
  )
}
