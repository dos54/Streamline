# Project Schemas

This is meant to answer the question: What schemas will we need for this project? And, What will those schemas look like?

## GraphNode
<!-- This describes a node -->
| Field       | Type                            | Description                                      |
| ----------- | ------------------------------- | ------------------------------------------------ |
| `id`        | string (UUID)                   | Unique identifier for the node                   |
| `name`      | string                          | Display name shown in the UI                     |
| `position`  | object `{x: number, y: number}` | Canvas coordinates for node placement            |
| `inputs`    | Input\[]                        | List of input objects connected to this node     |
| `outputs`   | Output\[]                       | List of output objects produced by this node     |
| `cycleTime` | number                          | Time required for the node to complete one cycle |

## GraphEdge
<!-- This describes an edge (a connection between two parts of two nodes) -->
| Field          | Type          | Description                            |
| -------------- | ------------- | -------------------------------------- |
| `id`           | string (UUID) | Edge's unique identifier               |
| `source`       | string (UUID) | The source node for the edge           |
| `target`       | string (UUID) | The target for the edge                |
| `sourceHandle` | string        | The handle within the source to target |
| `targetHandle` | string        | The handle within the target to target |

## Resource
<!-- This describes a resource -->
| Field  | Type          | Description                               |
| ------ | ------------- | ----------------------------------------- |
| `id`   | string (UUID) | The unique identifier for this resource   |
| `name` | string        | The human readable name for this resource |

## NodeResource
<!-- This describes an input or output in a node -->
| Field | Type | Description |
| - | - | - |
| `resourceId` | string (UUID) | The ID of the resource |
| `quantity` | decimal | The number of this resource or consumed |
| `percentChance` | decimal | The chance of this being produced or consumed, as a percentage |
| `unitId` | string (UUID) | The id of the unit used for this nodeResource |

## Unit
<!-- This describes a measuring unit (i.e. liters) -->
| Field      | Type   | Description                                         |
| ---------- | ------ | --------------------------------------------------- |
| `id`       | string | Unit key, e.g. `"kg"`, `"lb"`                       |
| `name`     | string | Human-friendly name                                 |
| `symbol`   | string | Display symbol                                      |
| `baseUnit` | string | The canonical unit this converts into (e.g. `"kg"`) |
| `factor`   | number | Multiplier to convert 1 unit of this → `baseUnit`   |

