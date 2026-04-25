import type { IPClass } from "../lib/utils"

interface IPClassInfoProps {
  ipClass: IPClass
}

export default function IPClassInfo({ ipClass }: IPClassInfoProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
        Clase Detectada
      </h2>
      <div className="flex items-baseline gap-4 border-l-2 border-neutral-700 pl-4">
        <span className="text-3xl text-neutral-100">{ipClass.class}</span>
        <div>
          <p className="text-neutral-400">{ipClass.description}</p>
          <p className="text-xs text-neutral-500 mt-1">
            Mascara: {ipClass.defaultMask} (/{ipClass.defaultCIDR})
          </p>
        </div>
      </div>
    </section>
  )
}
