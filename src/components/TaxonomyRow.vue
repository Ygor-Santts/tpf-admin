<script setup lang="ts">
// One category or occupation, with its actions: approve,
// rename, merge into another, move (occupations), add an occupation
// (categories) and delete. Emits a message once the change is saved.
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { apiError } from '@/api'
import { plural } from '@/format'
import {
  updateCategory, mergeCategory, deleteCategory, createOccupation,
  updateOccupation, mergeOccupation, deleteOccupation,
  type AdminCategory,
} from '@/services'

type Action = 'rename' | 'merge' | 'move' | 'add'

const props = defineProps<{
  kind: 'category' | 'occupation'
  item: { id: number; name: string; approved: boolean; workers?: number }
  categories: AdminCategory[]
  // Category of an occupation; shown when the row is out of its card.
  categoryName?: string
  categoryId?: number
}>()
const emit = defineEmits<{ done: [message: string]; fail: [message: string] }>()

const isCategory = computed(() => props.kind === 'category')
const label = computed(() => (isCategory.value ? 'categoria' : 'profissão'))
const workers = computed(() =>
  isCategory.value
    ? props.categories.find((c) => c.id === props.item.id)?.occupations.reduce((n, o) => n + o.workers, 0) ?? 0
    : props.item.workers ?? 0,
)
const workersText = (n: number) => plural(n, 'trabalhador', 'trabalhadores')

const btn = 'px-2.5 py-1 rounded-lg border text-xs font-medium text-slate-600 hover:bg-slate-50'

const action = ref<Action | null>(null)
const text = ref('')
const target = ref<number | null>(null)
const busy = ref(false)

const otherCategories = computed(() =>
  props.categories.filter((c) => c.id !== (isCategory.value ? props.item.id : props.categoryId)),
)
const mergeTargets = computed(() =>
  isCategory.value
    ? props.categories.filter((c) => c.id !== props.item.id).map((c) => ({ label: c.name, options: [{ id: c.id, name: c.name }] }))
    : props.categories
        .map((c) => ({ label: c.name, options: c.occupations.filter((o) => o.id !== props.item.id) }))
        .filter((g) => g.options.length),
)
const targetName = computed(() => {
  for (const g of mergeTargets.value) {
    const found = g.options.find((o) => o.id === target.value)
    if (found) return found.name
  }
  return props.categories.find((c) => c.id === target.value)?.name ?? ''
})

function open(next: Action) {
  action.value = action.value === next ? null : next
  text.value = next === 'rename' ? props.item.name : ''
  target.value = null
}

async function run(work: () => Promise<void>, message: string) {
  busy.value = true
  try {
    await work()
    action.value = null
    emit('done', message)
  } catch (e) {
    emit('fail', apiError(e, 'Não foi possível salvar. Tente novamente.'))
  } finally {
    busy.value = false
  }
}

const approve = () =>
  run(
    () => (isCategory.value ? updateCategory : updateOccupation)(props.item.id, { approved: true }),
    `"${props.item.name}" aprovada.`,
  )

function confirmAction() {
  const name = props.item.name
  if (action.value === 'rename' && text.value.trim())
    return run(
      () => (isCategory.value ? updateCategory : updateOccupation)(props.item.id, { name: text.value }),
      `"${name}" agora se chama "${text.value.trim()}".`,
    )
  if (action.value === 'add' && text.value.trim())
    return run(() => createOccupation(props.item.id, text.value), `"${text.value.trim()}" adicionada em "${name}".`)
  if (!target.value) return
  if (action.value === 'move')
    return run(() => updateOccupation(props.item.id, { categoryId: target.value! }), `"${name}" movida para "${targetName.value}".`)
  if (action.value === 'merge')
    return run(
      () => (isCategory.value ? mergeCategory : mergeOccupation)(props.item.id, target.value!),
      `"${name}" foi juntada em "${targetName.value}".`,
    )
}

function remove() {
  if (!confirm(`Apagar a ${label.value} "${props.item.name}"? Isso não tem volta.`)) return
  run(() => (isCategory.value ? deleteCategory : deleteOccupation)(props.item.id), `"${props.item.name}" apagada.`)
}

// Who changes occupation when this one is merged into the chosen one.
const moveText = computed(() => {
  const n = workers.value
  if (!n) return ''
  const from = props.item.name
  return n === 1
    ? `O trabalhador com "${from}" passa a ter "${targetName.value}". `
    : `Os ${n} trabalhadores com "${from}" passam a ter "${targetName.value}". `
})

const mergeHint = computed(() =>
  isCategory.value
    ? `As profissões de "${props.item.name}" vão para "${targetName.value}" (as de mesmo nome viram uma só) e "${props.item.name}" é apagada.`
    : `${moveText.value}"${props.item.name}" é apagada.`,
)
</script>

<template>
  <div class="grid gap-2">
    <div class="flex items-center gap-2 flex-wrap">
      <div class="flex-1 min-w-[10rem]">
        <span class="font-medium text-slate-900" :class="isCategory ? 'text-base' : 'text-sm'">{{ item.name }}</span>
        <span v-if="!item.approved" class="ml-2 text-[11px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">em análise</span>
        <div class="text-xs text-slate-500">
          <template v-if="categoryName">em {{ categoryName }} · </template>{{ workersText(workers) }}
        </div>
      </div>
      <div class="flex items-center gap-1 flex-wrap">
        <button v-if="!item.approved" type="button" :disabled="busy" @click="approve" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50">Aprovar</button>
        <button v-if="isCategory" type="button" @click="open('add')" :class="btn">+ Profissão</button>
        <button type="button" @click="open('rename')" :class="btn">Renomear</button>
        <button type="button" @click="open('merge')" :class="btn">Juntar</button>
        <button v-if="!isCategory" type="button" @click="open('move')" :class="btn">Mover</button>
        <button
          type="button"
          :disabled="busy || workers > 0"
          :title="workers > 0 ? 'Tem trabalhadores: junte com outra em vez de apagar' : ''"
          @click="remove"
          class="px-2.5 py-1 rounded-lg border text-xs font-medium text-red-600 hover:bg-red-50 disabled:text-slate-300 disabled:hover:bg-transparent"
        >Apagar</button>
      </div>
    </div>

    <form v-if="action" @submit.prevent="confirmAction" class="grid gap-2 p-3 rounded-xl bg-slate-50 border">
      <template v-if="action === 'rename' || action === 'add'">
        <label class="text-xs font-medium text-slate-500">{{ action === 'rename' ? 'Novo nome' : `Nova profissão em ${item.name}` }}</label>
        <input v-model="text" maxlength="60" class="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand" />
      </template>
      <template v-else-if="action === 'merge'">
        <label class="text-xs font-medium text-slate-500">Juntar "{{ item.name }}" em:</label>
        <select v-model="target" class="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand">
          <option :value="null">Escolha {{ isCategory ? 'a categoria' : 'a profissão' }} que fica...</option>
          <template v-if="isCategory">
            <option v-for="g in mergeTargets" :key="g.options[0].id" :value="g.options[0].id">{{ g.label }}</option>
          </template>
          <template v-else>
            <optgroup v-for="g in mergeTargets" :key="g.label" :label="g.label">
              <option v-for="o in g.options" :key="o.id" :value="o.id">{{ o.name }}</option>
            </optgroup>
          </template>
        </select>
        <p v-if="target" class="text-xs text-slate-600">{{ mergeHint }}</p>
      </template>
      <template v-else-if="action === 'move'">
        <label class="text-xs font-medium text-slate-500">Mover "{{ item.name }}" para:</label>
        <select v-model="target" class="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand">
          <option :value="null">Escolha a categoria...</option>
          <option v-for="c in otherCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </template>
      <div class="flex gap-2">
        <button type="button" @click="action = null" class="flex-1 py-2 rounded-xl border bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button :disabled="busy" class="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 flex items-center justify-center gap-2">
          <Icon v-if="busy" icon="mdi:loading" class="animate-spin" />{{ action === 'merge' ? 'Juntar' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>
