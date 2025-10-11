export type ResourceFlowResult = {
  edgeId: string
  target: string
  resourceId: string
  valid: boolean
  balanceStatus: 'exact' | 'under' | 'over' | 'missing'
  message: string
}

export type ExtendedNode = {
  id: string
  data?: {
    inputs?: { resourceId: string; unitId: string; perCycle: number }[]
    outputs?: { resourceId: string; unitId: string; perCycle: number }[]
    resources?: { id: string; name: string; defaultUnitId?: string }[]
  }
}



export type ExtendedEdge = {
  id: string
  source: string
  target: string
}

export function validateResourceFlow(
  nodes: ExtendedNode[],
  edges: ExtendedEdge[]
): ResourceFlowResult[] {
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const results: ResourceFlowResult[] = []

  for (const edge of edges) {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)

    if (!source || !target) continue

    const outputs = source.data?.outputs ?? []
    const inputs = target.data?.inputs ?? []

    for (const input of inputs) {
      const match = outputs.find(
        output =>
          output.resourceId === input.resourceId &&
          output.unitId === input.unitId
      )

      let balanceStatus: ResourceFlowResult['balanceStatus']
      let valid = false

      if (!match) {
        balanceStatus = 'missing'
      } else if (match.perCycle === input.perCycle) {
        balanceStatus = 'exact'
        valid = true
      } else if (match.perCycle > input.perCycle) {
        balanceStatus = 'over'
        valid = true
      } else {
        balanceStatus = 'under'
      }

      results.push({
        edgeId: edge.id,
        target: edge.target,
        resourceId: input.resourceId,
        valid,
        balanceStatus,
        message:
          balanceStatus === 'exact'
            ? `✅ ${input.resourceId} is exactly balanced`
            : balanceStatus === 'over'
            ? `🔄 ${input.resourceId} is over-supplied`
            : balanceStatus === 'under'
            ? `⚠️ ${input.resourceId} is under-supplied`
            : `❌ ${input.resourceId} is missing`
      })
    }
  }

  return results
}
