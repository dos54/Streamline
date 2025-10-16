<template>
  <form id="resource-form" @submit.prevent="onSubmit" class="form">
    <h2>{{ isEdit ? 'Edit Resource' : 'Add Resource' }}</h2>

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
      <span>Default Unit ID (optional)</span>
      <input v-model.trim="form.defaultUnitId" class="input" placeholder="e.g. kg, s, m" />
      <p v-if="errors.defaultUnitId" class="error-box">{{ errors.defaultUnitId }}</p>
    </label>

    <label class="label">
      <span>Category (optional)</span>
      <input v-model.trim="form.category" class="input" placeholder="e.g. materials, energy" />
      <p v-if="errors.category" class="error-box">{{ errors.category }}</p>
    </label>

    <label class="label">
      <span>Precision (optional, integer ≥ 0)</span>
      <input
        v-model.number="form.precision"
        type="number"
        step="1"
        min="0"
        class="input"
        placeholder="e.g. 2"
      />
      <p v-if="errors.precision" class="error-box">{{ errors.precision }}</p>
    </label>

    <label class="label">
      <span>Aliases (comma-separated)</span>
      <input v-model.trim="aliasesStr" class="input" placeholder="e.g. iron ore, Fe ore" />
      <p v-if="errors.aliases" class="error-box">{{ errors.aliases }}</p>
    </label>

    <button type="submit" class="visually-hidden" aria-hidden="true" tabindex="-1"></button>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { ResourceZ } from '@/schemas/resource.schema'
import type { Resource } from '@/types/resource'

const props = defineProps<{ initial?: Partial<Resource> & { id?: string } }>()
const emit = defineEmits<{
  (e: 'saved', resource: Resource): void
  (e: 'submitting', v: boolean): void
  (e: 'error', err: unknown): void
}>()

const project = useProjectStore()
const isEdit = computed(() => !!props.initial?.id)

const form = reactive<Resource>({
  id: props.initial?.id ?? '',
  name: props.initial?.name ?? '',
  defaultUnitId: props.initial?.defaultUnitId ?? undefined,
  category: props.initial?.category ?? '',
  precision: props.initial?.precision ?? undefined,
  aliases: props.initial?.aliases ?? [],
})

const aliasesStr = computed({
  get: () => (form.aliases ?? []).join(', '),
  set: (v: string) =>
    (form.aliases = v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)),
})

const unitIds = computed(() => project.current.units.map((u) => u.id))
const errors = reactive<Record<string, string | null>>({
  id: null,
  name: null,
  defaultUnitId: null,
  category: null,
  precision: null,
  aliases: null,
})

watch(
  () => props.initial,
  (v) => {
    form.id = v?.id ?? ''
    form.name = v?.name ?? ''
    form.defaultUnitId = v?.defaultUnitId ?? undefined
    form.category = v?.category ?? ''
    form.precision = v?.precision ?? undefined
    form.aliases = v?.aliases ?? []
    Object.keys(errors).forEach((k) => (errors[k] = null))
  },
  { deep: false },
)

function validate(): Resource | null {
  Object.keys(errors).forEach((k) => (errors[k] = null))

  // unique id on create
  if (!isEdit.value && project.current.resources.some((r) => r.id === form.id)) {
    errors.id = `ID "${form.id}" is already in use`
    return null
  }

  // defaultUnitId must exist if provided
  if (form.defaultUnitId && !unitIds.value.includes(form.defaultUnitId)) {
    errors.defaultUnitId = `Unknown unit "${form.defaultUnitId}"`
    return null
  }

  const parsed = ResourceZ.safeParse(form)
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
    await project.upsertResource(data)
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
.error-box {
  color: red;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  clip: rect(0 0 0 0);
  overflow: hidden;
}
</style>
