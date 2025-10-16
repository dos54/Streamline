// src/utils/summary.ts
type Unit = {
  id: string
  name: string
  symbol: string
  baseUnit: string
  factor: number
  dimension: string
}
type Resource = {
  id: string
  name: string
  defaultUnitId?: string
  precision?: number
}
type IO = { resourceId: string; unitId?: string; perCycle: number }
type NodeLike = { cycleTime: number; count: number; inputs: IO[]; outputs: IO[] }

export type SummaryRow = {
  resourceId: string
  resourceName: string
  unitId: string // summarized in this unit
  unitLabel: string // "Kilogram (kg)"
  producedPerSec: number
  consumedPerSec: number
  netPerSec: number
}

function idxUnits(units: Unit[]) {
  const byId = new Map(units.map((u) => [u.id, u]))
  const byDimBase = new Map<string, string>() // dimension -> baseUnit
  for (const u of units) if (u.id === u.baseUnit) byDimBase.set(u.dimension, u.id)
  return { byId, byDimBase }
}

// convert value from fromUnit -> toUnit using factor-to-base
function convert(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit.id === toUnit.id) return value
  if (fromUnit.dimension !== toUnit.dimension) throw new Error('Incompatible units')
  const toBase = value * fromUnit.factor
  return toBase / toUnit.factor
}

function resolveTargetUnit(
  res: Resource,
  unitId: string | undefined,
  unitsIdx: Map<string, Unit>,
): Unit | null {
  const u = unitId ? (unitsIdx.get(unitId) ?? null) : null
  if (res.defaultUnitId) return unitsIdx.get(res.defaultUnitId) ?? u
  return u
}

export function summarizeProject(
  nodes: NodeLike[],
  resources: Resource[],
  units: Unit[],
): SummaryRow[] {
  const { byId: unitsIdx, byDimBase } = idxUnits(units)
  const resIdx = new Map(resources.map((r) => [r.id, r]))

  // key: resourceId|unitId
  const agg = new Map<string, { produced: number; consumed: number; unit: Unit; res: Resource }>()

  const add = (res: Resource, unit: Unit, valuePerSec: number) => {
    const key = `${res.id}|${unit.id}`
    const slot = agg.get(key) ?? { produced: 0, consumed: 0, unit, res }
    if (valuePerSec >= 0) slot.produced += valuePerSec
    else slot.consumed += -valuePerSec
    agg.set(key, slot)
  }

  for (const n of nodes) {
    const sec = n.cycleTime > 0 ? n.cycleTime : 0
    const mult = n.count ?? 1

    // inputs = consumption (negative)
    for (const io of n.inputs ?? []) {
      const res = resIdx.get(io.resourceId)
      if (!res) continue
      if (!(io.perCycle >= 0) || sec <= 0) continue

      // pick a working unit
      const from = io.unitId ? (unitsIdx.get(io.unitId) ?? null) : null
      let target = resolveTargetUnit(res, io.unitId, unitsIdx)
      if (!target && from) {
        // fall back to base in same dimension
        const baseId = byDimBase.get(from.dimension)
        target = baseId ? (unitsIdx.get(baseId) ?? from) : from
      }
      if (!from || !target) continue // skip drafts with no unit

      const perSec = (io.perCycle / sec) * mult // positive quantity
      const norm = convert(perSec, from, target) // normalize to target
      add(res, target, -norm) // negative for consumption
    }

    // outputs = production (positive)
    for (const io of n.outputs ?? []) {
      const res = resIdx.get(io.resourceId)
      if (!res) continue
      if (!(io.perCycle >= 0) || sec <= 0) continue

      const from = io.unitId ? (unitsIdx.get(io.unitId) ?? null) : null
      let target = resolveTargetUnit(res, io.unitId, unitsIdx)
      if (!target && from) {
        const baseId = byDimBase.get(from.dimension)
        target = baseId ? (unitsIdx.get(baseId) ?? from) : from
      }
      if (!from || !target) continue

      const perSec = (io.perCycle / sec) * mult
      const norm = convert(perSec, from, target)
      add(res, target, norm)
    }
  }

  // finalize + precision
  const rows: SummaryRow[] = []
  for (const { res, unit, produced, consumed } of agg.values()) {
    const net = produced - consumed
    const p = res.precision ?? 3
    rows.push({
      resourceId: res.id,
      resourceName: res.name,
      unitId: unit.id,
      unitLabel: `${unit.name} (${unit.symbol})`,
      producedPerSec: +produced.toFixed(p),
      consumedPerSec: +consumed.toFixed(p),
      netPerSec: +net.toFixed(p),
    })
  }
  return rows.sort((a, b) => a.resourceName.localeCompare(b.resourceName))
}
