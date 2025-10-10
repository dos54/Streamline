export function convertNodeToGraphNode(node: any): any {
  return {
    id: node.id,
    type: node.type,
    position: node.position ?? { x: 0, y: 0 },
    data: node.data ?? {},
    name: node.data?.label ?? node.name ?? 'Unnamed Node',
    enabled: node.enabled ?? true,
  }
}
