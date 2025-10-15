<template>
  <form id="unit-form" @submit.prevent="onSubmit" class="form">
    <h2>{{ isEdit ? 'Edit Unit' : 'Add Unit' }}</h2>

    <label class="label">
      <span>ID</span>
      <input v-model.trim="form.id" :disabled="isEdit" required class="input" />
      <p v-if="errors.id" class="error-box">{{ errors.id }}</p>
    </label>

    <label class="label">
      <span>Name</span>
      <input v-model.trim="form.name" required class="input" />
      <p v-if="errors.name" class="error-box">{{ errors.name }}</p>
    </label>

    <label class="label">
      <span>Symbol</span>
      <input v-model.trim="form.symbol" class="input" placeholder="e.g. kg, s, m" />
      <p v-if="errors.symbol" class="error-box">{{ errors.symbol }}</p>
    </label>

    <label class="label">
      <span>Base Unit</span>
      <input v-model.trim="form.baseUnit" required class="input" placeholder="e.g. g, s, m" />
      <p v-if="errors.baseUnit" class="error-box">{{ errors.baseUnit }}</p>
    </label>

    <label class="label">
      <span>Factor</span>
      <input v-model.number="form.factor" type="number" step="any" min="0" required class="input" placeholder="e.g. 1000" />
      <p v-if="errors.factor" class="error-box">{{ errors.factor }}</p>
    </label>

    <label class="label">
      <span>Dimension</span>
      <input v-model.trim="form.dimension" required class="input" placeholder="e.g. mass, time, length" />
      <p v-if="errors.dimension" class="error-box">{{ errors.dimension }}</p>
    </label>

    <label class="label">
      <span>Aliases (comma-separated)</span>
      <input
        class="input"
        placeholder="e.g. second, sec, s"
      />
      <p v-if="errors.aliases" class="error-box">{{ errors.aliases }}</p>
    </label>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { UnitZ } from '@/schemas/unit.schema'
import type { Unit } from '@/types/project'

const props = defineProps<{
  initial?: Partial<Unit> & { id?: string }
}>()

const emit = defineEmits<{
  (e: 'saved', unit: Unit): void
  (e: 'submitting', v: boolean): void
  (e: 'error', err: unknown): void
}>()

const project = useProjectStore()
const isEdit = computed(() => !!props.initial?.id)

const form = reactive<Unit>({
  id: props.initial?.id ?? '',
  name: props.initial?.name ?? '',
  symbol: props.initial?.symbol ?? '',
  baseUnit: props.initial?.baseUnit ?? '',
  factor: props.initial?.factor ?? 1,
  dimension: (props.initial?.dimension as string) ?? 'count',
  aliases: props.initial?.aliases ?? [],
})

const unitIds = computed(() => project.current.units.map(u => u.id))

const errors = reactive<Record<string, string | null>>({
  id: null, name: null, symbol: null, baseUnit: null, factor: null, dimension: null, aliases: null,
})

watch(() => props.initial, (v) => {
  form.id = v?.id ?? ''
  form.name = v?.name ?? ''
  form.symbol = v?.symbol ?? ''
  form.baseUnit = v?.baseUnit ?? ''
  form.factor = v?.factor ?? 1
  form.dimension = (v?.dimension as string) ?? 'count'
  form.aliases = v?.aliases ?? []
  Object.keys(errors).forEach(k => (errors[k] = null))
}, { deep: false })

function validate(): Unit | null {
  Object.keys(errors).forEach(k => (errors[k] = null))

  if (!isEdit.value && project.current.units.some(u => u.id === form.id)) {
    errors.id = `ID "${form.id}" is already in use`
    return null
  }
  if (form.baseUnit && !unitIds.value.includes(form.baseUnit) && form.baseUnit !== form.id) {
    if (!(form.baseUnit === form.id && form.factor === 1)) {
      errors.baseUnit = `Unknown base unit "${form.baseUnit}"`
      return null
    }
  }

  const parsed = UnitZ.safeParse(form)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message
    }
    return null
  }
  return parsed.data
}

async function onSubmit() {
  const data = validate()
  if (!data) return
  emit('submitting', true)
  try {
    data.symbol = (data.symbol ?? '').trim()
    await project.upsertUnit(data)
    emit('saved', data)
  } catch (err) {
    emit('error', err)
  } finally {
    emit('submitting', false)
  }
}
</script>

<style scoped>
.form {
  border: 1px solid lightgray;
  padding: 8px;
}

.label {
  display: block;
  margin: 4px;
  border-bottom: 1px solid lightgray;
}

.label > * {
  display: block;
}

.label > .input {
  border: 2px solid black;
  border-radius: 4px;
  margin-bottom: 4px;
}

</style>
