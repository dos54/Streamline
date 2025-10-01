import { validateNodeJson } from './nodeValidator'

const sampleNode = {
  label: 'Iron Mine',
  mode: 'producer',
  direction: 'ltr',
  cycleTime: 5,
  inputs: [{ resourceId: 'power', unitId: 'kWh', perCycle: 0.5 }],
  outputs: [{ resourceId: 'steel', unitId: 'kg', perCycle: 1 }],
  resources: [{ id: 'steel', name: 'Steel', defaultUnitId: 'kg' }]
}

const result = validateNodeJson(sampleNode)
console.log('Valid?', result.valid)
console.log('Errors:', result.errors)
