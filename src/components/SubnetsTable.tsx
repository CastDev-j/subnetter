import type { Subnet } from "../lib/utils"

interface SubnetsTableProps {
  subnets: Subnet[]
}

export default function SubnetsTable({ subnets }: SubnetsTableProps) {
  return (
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
            {subnets.map((subnet) => (
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
    </section>
  )
}
