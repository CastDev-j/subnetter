import { IP_CLASSES } from "../lib/utils";

export default function IPClassesTable() {
  return (
    <section className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-primary-500 mb-4">
        Clases de IP
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-primary-800 text-primary-500">
              <th className="text-left py-3 pr-4 font-medium">Clase</th>
              <th className="text-left py-3 pr-4 font-medium">Rango</th>
              <th className="text-left py-3 pr-4 font-medium">Mascara</th>
              <th className="text-left py-3 font-medium">Uso</th>
            </tr>
          </thead>
          <tbody>
            {IP_CLASSES.map((cls) => (
              <tr key={cls.class} className="border-b border-primary-900">
                <td className="py-3 pr-4 text-primary-100">{cls.class}</td>
                <td className="py-3 pr-4 text-primary-400">{cls.range}</td>
                <td className="py-3 pr-4 text-primary-400">{cls.defaultMask}</td>
                <td className="py-3 text-primary-500">{cls.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
