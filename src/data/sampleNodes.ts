import type { Node } from '@/types'

export const sampleNodes: Node[] = [
  {
    id: 'test-node',
    type: 'smart',
    position: { x: 100, y: 100 },
    data: {
      label: 'Balance Test',
      direction: 'ltr',
      cycleTime: 10,
      inputs: [
        { resourceId: 'water', unitId: 'liters', perCycle: 10 },     // ✅ Exact
        { resourceId: 'energy', unitId: 'kWh', perCycle: 5 },        // 🔄 Over
        { resourceId: 'fuel', unitId: 'gallons', perCycle: 12 },     // ⚠️ Under
        { resourceId: 'oxygen', unitId: 'liters', perCycle: 6 }      // ❌ Missing
      ],
      outputs: [
        { resourceId: 'water', unitId: 'liters', perCycle: 10 },
        { resourceId: 'energy', unitId: 'kWh', perCycle: 8 },
        { resourceId: 'fuel', unitId: 'gallons', perCycle: 9 }
        // oxygen intentionally missing
      ],
      resources: [
        { id: 'water', name: 'Water', defaultUnitId: 'liters' },
        { id: 'energy', name: 'Energy', defaultUnitId: 'kWh' },
        { id: 'fuel', name: 'Fuel', defaultUnitId: 'gallons' },
        { id: 'oxygen', name: 'Oxygen', defaultUnitId: 'liters' }
      ]
    }
  }
]
