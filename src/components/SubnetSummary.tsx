import type { Subnet } from "../lib/utils"

interface SubnetSummaryProps {
  subnets: Subnet[]
}

export default function SubnetSummary({ subnets }: SubnetSummaryProps) {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-900">
      <div>
        <p className="text-xs text-neutral-600 uppercase tracking-wide">Subredes</p>
        <p className="text-lg text-neutral-100 mt-1">{subnets.length}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-600 uppercase tracking-wide">Hosts/Subred</p>
        <p className="text-lg text-neutral-100 mt-1">{subnets[0]?.usableHosts}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-600 uppercase tracking-wide">CIDR</p>
        <p className="text-lg text-neutral-100 mt-1">/{subnets[0]?.cidr}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-600 uppercase tracking-wide">Total IPs</p>
        <p className="text-lg text-neutral-100 mt-1">
          {subnets.length * (subnets[0]?.totalHosts || 0)}
        </p>
      </div>
    </div>
  )
}
