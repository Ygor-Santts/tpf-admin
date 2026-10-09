<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Notice from '@/components/Notice.vue'
import TaxonomyRow from '@/components/TaxonomyRow.vue'
import { apiError } from '@/api'
import { getCategories, createCategory, type AdminCategory, type AdminOccupation } from '@/services'

const categories = ref<AdminCategory[]>([])
const loading = ref(true)
const notice = ref<{ ok: boolean; text: string } | null>(null)
const expanded = ref<number[]>([])
const newCategory = ref('')
const adding = ref(false)

// What workers added and nobody reviewed yet: new categories, and new
// occupations inside approved categories.
interface PendingItem {
  kind: 'category' | 'occupation'
  key: string
  item: AdminCategory | AdminOccupation
  category: AdminCategory
}
const pending = computed<PendingItem[]>(() =>
  categories.value.flatMap((c): PendingItem[] =>
    !c.approved
      ? [{ kind: 'category', key: `c${c.id}`, item: c, category: c }]
      : c.occupations
          .filter((o) => !o.approved)
          .map((o) => ({ kind: 'occupation', key: `o${o.id}`, item: o, category: c }))
  )
)

async function load() {
  try {
    categories.value = await getCategories()
  } catch (e) {
    notice.value = { ok: false, text: apiError(e, 'Não foi possível carregar as categorias.') }
  } finally {
    loading.value = false
  }
}

async function done(text: string) {
  notice.value = { ok: true, text }
  await load()
}

function fail(text: string) {
  notice.value = { ok: false, text }
}

function toggle(id: number) {
  const i = expanded.value.indexOf(id)
  if (i >= 0) expanded.value.splice(i, 1)
  else expanded.value.push(id)
}

async function addCategory() {
  if (!newCategory.value.trim()) return
  adding.value = true
  try {
    await createCategory(newCategory.value)
    const name = newCategory.value.trim()
    newCategory.value = ''
    await done(`Categoria "${name}" criada.`)
  } catch (e) {
    fail(apiError(e, 'Não foi possível criar a categoria.'))
  } finally {
    adding.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="grid gap-5">
    <Notice v-if="notice" v-bind="notice" @close="notice = null" />

    <div v-if="loading" class="grid gap-3">
      <div v-for="i in 3" :key="i" class="h-16 rounded-2xl bg-slate-100 animate-pulse" />
    </div>

    <template v-else>
      <div class="grid gap-2">
        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
          Para revisar
          <span class="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{{ pending.length }}</span>
        </h3>
        <p class="text-xs text-slate-500">
          Adicionadas por trabalhadores. Só aparecem para os clientes depois de aprovadas.
          Se for erro de digitação ou repetida, use "Juntar" com a certa: quem escolheu passa para a certa.
        </p>
        <div v-if="!pending.length" class="text-sm text-slate-400 bg-white rounded-2xl border p-4">Nada para revisar.</div>
        <div v-for="p in pending" :key="p.key" class="bg-white rounded-2xl border border-amber-200 shadow-card p-4 grid gap-2">
          <TaxonomyRow
            :kind="p.kind"
            :item="p.item"
            :categories="categories"
            :category-id="p.category.id"
            :category-name="p.kind === 'occupation' ? p.category.name : undefined"
            @done="done"
            @fail="fail"
          />
          <div v-if="p.kind === 'category' && p.category.occupations.length" class="pl-3 border-l-2 border-amber-100 grid gap-2">
            <TaxonomyRow
              v-for="o in p.category.occupations"
              :key="o.id"
              kind="occupation"
              :item="o"
              :categories="categories"
              :category-id="p.category.id"
              @done="done"
              @fail="fail"
            />
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <h3 class="font-semibold text-slate-800">Todas as categorias</h3>
        <form @submit.prevent="addCategory" class="flex gap-2">
          <input v-model="newCategory" maxlength="60" placeholder="Nova categoria" class="flex-1 border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand" />
          <button :disabled="adding || !newCategory.trim()" class="px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 flex items-center gap-1">
            <Icon :icon="adding ? 'mdi:loading' : 'mdi:plus'" :class="{ 'animate-spin': adding }" />Criar
          </button>
        </form>

        <div v-for="c in categories" :key="c.id" class="bg-white rounded-2xl border shadow-card">
          <div class="p-4 flex items-start gap-2">
            <button type="button" @click="toggle(c.id)" class="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
              <Icon :icon="expanded.includes(c.id) ? 'mdi:chevron-down' : 'mdi:chevron-right'" class="text-xl" />
            </button>
            <div class="flex-1">
              <TaxonomyRow kind="category" :item="c" :categories="categories" @done="done" @fail="fail" />
            </div>
          </div>
          <div v-if="expanded.includes(c.id)" class="border-t px-4 py-3 grid gap-3">
            <TaxonomyRow
              v-for="o in c.occupations"
              :key="o.id"
              kind="occupation"
              :item="o"
              :categories="categories"
              :category-id="c.id"
              @done="done"
              @fail="fail"
            />
            <span v-if="!c.occupations.length" class="text-sm text-slate-400">Nenhuma profissão.</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
