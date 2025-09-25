# Project Schemas

This is meant to answer the question: What schemas will we need for this project? And, What will those schemas look like?

## GraphNode

<!-- This describes a node -->

| Field              | Type                                               | Description                                                                                                                      |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | string (nanoid)                                    | Unique identifier for the node                                                                                                   |
| `type`             | "machine", "source", "sink"                        | Some nodes might infinitely produce or consume.                                                                                  |
| `name`             | string                                             | Display name shown in the UI                                                                                                     |
| `enabled`          | boolean                                            | Toggle whether the node should be enabled or not                                                                                 |
| `position`         | object `{x: number, y: number}`                    | Canvas coordinates for node placement                                                                                            |
| `count`            | number                                             | The number of "parallel" machines                                                                                                |
| `inputs`           | NodeResource\[]                                    | List of input objects connected to this node                                                                                     |
| `outputs`          | NodeResource\[]                                    | List of output objects produced by this node                                                                                     |
| `cycleTime`        | number                                             | Time required for the node to complete one cycle                                                                                 |
| `cycleTimeUnitId?` | string?                                            | The unit for time, defaults to the project default.                                                                              |
| `tags?`            | string\[]                                          | Possible labels to be used with search?                                                                                          |
| `ui?`              | {width?: number; height?: number; zIndex?: number} | Layout hints                                                                                                                     |
| `templateId`       | string                                             | If this was generated from a template it might be good to keep it listed, such that future changes to the template are reflected |
| `data?`            | Record<string, unknown>                            | Allow for the possible addition of meta data in the future                                                                       |

## GraphEdge

<!-- This describes an edge (a connection between two parts of two nodes) -->

| Field          | Type                       | Description                                                     |
| -------------- | -------------------------- | --------------------------------------------------------------- |
| `id`           | string (nanoid)            | Edge's unique identifier                                        |
| `enabled`      | boolean                    |                                                                 |
| `type?`        | string                     | VueFlow edge type                                               |
| `label?`       | string                     |                                                                 |
| `source`       | string (nanoid)            | The source node for the edge                                    |
| `target`       | string (nanoid)            | The target for the edge                                         |
| `sourceHandle` | string                     | The handle within the source to target                          |
| `targetHandle` | string                     | The handle within the target to target                          |
| `waypoints`    | { x: number, y: number }[] | Allow for manual routing                                        |
| `data`         | Record<string, unknown>    | Allow for possible future features such as metadata to be added |

## Resource

<!-- This describes a resource -->

| Field           | Type     | Description                                             |
| --------------- | -------- | ------------------------------------------------------- |
| `id`            | string   | The unique identifier for this resource                 |
| `name`          | string   | The human readable name for this resource               |
| `defaultUnitId` | string   | The ID for its default unit                             |
| `category`      | string   | Allow for the user to define custom resource categories |
| `precision?`    | number   | User defined guidance for rounding                      |
| `aliases?`      | string[] | Search terms                                            |

## NodeResource

<!-- This describes an input or output in a node -->

| Field               | Type    | Description                                                                               |
| ------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `id`                | string  | Create a stable handle for connecting edges (i.e. `in:iron:1`) (in/out:resourceId:portId) |
| `label?`            | string  | An optional label                                                                         |
| `perCycle`          | decimal | The number of this resource produced or consumed per cycle                                |
| `consumptionChance` | decimal | The chance of this being produced or consumed, as a decimal (i.e. `.25` for 25%)          |
| `unitId`            | string  | The id of the unit used for this nodeResource                                             |

## Unit

<!-- This describes a measuring unit (i.e. liters) -->

| Field       | Type                        | Description                                         |
| ----------- | --------------------------- | --------------------------------------------------- |
| `id`        | string                      | Unit key, e.g. `"kg"`, `"lb"`                       |
| `name`      | string                      | Human-friendly name                                 |
| `symbol`    | string                      | Display symbol                                      |
| `baseUnit`  | string                      | The canonical unit this converts into (e.g. `"kg"`) |
| `factor`    | number                      | Multiplier to convert 1 unit of this to `baseUnit`  |
| `dimension` | "count" \| "time" \| string | Unit family                                         |
| `aliases`   | string[]                    | Alternative names/symbols/whatever                  |
