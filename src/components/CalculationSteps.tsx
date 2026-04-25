import type { Step } from "../lib/utils"

interface CalculationStepsProps {
  steps: Step[]
}

export default function CalculationSteps({ steps }: CalculationStepsProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xs uppercase tracking-widest text-primary-500 mb-4">
        Proceso de Calculo
      </h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="border-l border-primary-800 pl-4">
            <h3 className="text-sm text-primary-200 mb-1">{step.title}</h3>
            <p className="text-sm text-primary-500">{step.description}</p>
            {step.calculation && (
              <code className="block mt-2 text-xs text-primary-400 bg-primary-900 px-3 py-2 border-l-2 border-primary-700">
                {step.calculation}
              </code>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
