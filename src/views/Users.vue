<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Notice from '@/components/Notice.vue'
import { apiError } from '@/api'
import { APP_URL } from '@/config'
import { formatDate, formatPhone, plural } from '@/format'
import {
  getUsers, getUser, setUserEnabled, deleteUser,
  type AdminUser, type AdminUserDetail, type UserFilter,
} from '@/services'

const filters: { value: UserFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'workers', label: 'Trabalhadores' },
  { value: 'clients', label: 'Clientes' },
  { value: 'disabled', label: 'Desativados' },
]

const search = ref('')
const filter = ref<UserFilter>('all')
const users = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(0)
const loading = ref(false)
const notice = ref<{ ok: boolean; text: string } | null>(null)
const openId = ref<number | null>(null)
const detail = ref<AdminUserDetail | null>(null)
const busy = ref(false)


async function load(more = false) {
  loading.value = true
  try {
    const next = more ? page.value + 1 : 1
    const result = await getUsers({ search: search.value.trim() || undefined, filter: filter.value, page: next })
    users.value = more ? [...users.value, ...result.data] : result.data
    total.value = result.total
    pages.value = result.pages
    page.value = next
  } catch (e) {
    notice.value = { ok: false, text: apiError(e, 'Não foi possível carregar os usuários.') }
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => load(), 300)
})
watch(filter, () => load())

async function toggleOpen(user: AdminUser) {
  if (openId.value === user.id) {
    openId.value = null
    return
  }
  openId.value = user.id
  detail.value = null
  try {
    detail.value = await getUser(user.id)
  } catch (e) {
    notice.value = { ok: false, text: apiError(e, 'Não foi possível abrir a conta.') }
  }
}

async function run(work: () => Promise<void>, text: string) {
  busy.value = true
  try {
    await work()
    notice.value = { ok: true, text }
    openId.value = null
    await load()
  } catch (e) {
    notice.value = { ok: false, text: apiError(e, 'Não foi possível salvar. Tente novamente.') }
  } finally {
    busy.value = false
  }
}

function toggleEnabled(user: AdminUser) {
  if (user.enabled && !confirm(`Desativar a conta de ${user.name}? Ela não consegue mais entrar e some da busca. Dá para reativar depois.`)) return
  run(
    () => setUserEnabled(user.id, !user.enabled),
    user.enabled ? `Conta de ${user.name} desativada.` : `Conta de ${user.name} reativada.`,
  )
}

function remove(user: AdminUser) {
  const typed = prompt(
    `Excluir de vez a conta de ${user.name}? Apaga perfil, fotos e avaliações e não tem volta.\n\nPara confirmar, digite o e-mail: ${user.email}`,
  )
  if (typed === null) return
  if (typed.trim().toLowerCase() !== user.email.toLowerCase()) {
    notice.value = { ok: false, text: 'O e-mail digitado não confere. Nada foi excluído.' }
    return
  }
  run(() => deleteUser(user.id), `Conta de ${user.name} excluída.`)
}

onMounted(() => load())
</script>

<template>
  <section class="grid gap-4">
    <div class="relative">
      <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" placeholder="Buscar por nome, e-mail ou telefone" class="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:border-brand" />
    </div>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        @click="filter = f.value"
        class="px-3 py-1 rounded-full border text-xs font-medium transition-colors"
        :class="filter === f.value ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 hover:border-brand hover:text-brand'"
      >{{ f.label }}</button>
      <span class="ml-auto text-xs text-slate-500 self-center">{{ total }} {{ total === 1 ? 'conta' : 'contas' }}</span>
    </div>

    <Notice v-if="notice" v-bind="notice" @close="notice = null" />

    <div class="grid gap-2">
      <div v-for="u in users" :key="u.id" class="bg-white rounded-2xl border shadow-card" :class="{ 'opacity-70': !u.enabled }">
        <button type="button" @click="toggleOpen(u)" class="w-full text-left p-4 flex items-start gap-3">
          <div class="h-10 w-10 rounded-full bg-brand-50 text-brand font-bold flex items-center justify-center flex-shrink-0">
            {{ u.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-slate-900 truncate">{{ u.name }}</span>
              <span class="text-[11px] font-semibold px-1.5 py-0.5 rounded" :class="u.isWorker ? 'bg-brand-50 text-brand' : 'bg-slate-100 text-slate-600'">{{ u.isWorker ? 'Trabalhador' : 'Cliente' }}</span>
              <span v-if="u.isAdmin" class="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Admin</span>
              <span v-if="!u.enabled" class="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">Desativada</span>
            </div>
            <div class="text-xs text-slate-500 truncate">{{ u.email }} · {{ formatPhone(u.phone) }}</div>
            <div class="text-xs text-slate-400">
              Criada em {{ formatDate(u.createdAt) }} · último acesso {{ formatDate(u.lastAccess) }}
              <template v-if="u.isWorker"> · {{ plural(u.occupations, 'profissão', 'profissões') }} · {{ plural(u.cities, 'cidade', 'cidades') }}</template>
            </div>
          </div>
          <Icon :icon="openId === u.id ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="text-slate-400 text-xl flex-shrink-0" />
        </button>

        <div v-if="openId === u.id" class="border-t px-4 py-3 grid gap-3 text-sm">
          <div v-if="!detail" class="h-10 rounded-xl bg-slate-100 animate-pulse" />
          <template v-else>
            <template v-if="detail.isWorker">
              <p v-if="detail.bio" class="text-slate-600 italic">"{{ detail.bio }}"</p>
              <div>
                <div class="text-xs font-medium text-slate-500 mb-1">Profissões</div>
                <div class="flex flex-wrap gap-1">
                  <span v-for="o in detail.occupationNames" :key="o" class="px-2 py-0.5 rounded-full bg-brand-50 text-brand text-xs">{{ o }}</span>
                  <span v-if="!detail.occupationNames.length" class="text-xs text-slate-400">Nenhuma</span>
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-slate-500 mb-1">Cidades ({{ detail.cityNames.length }})</div>
                <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  <span v-for="c in detail.cityNames" :key="c" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">{{ c }}</span>
                  <span v-if="!detail.cityNames.length" class="text-xs text-slate-400">Nenhuma</span>
                </div>
              </div>
              <div class="text-xs text-slate-500">{{ plural(detail.ratingsReceived, 'avaliação recebida', 'avaliações recebidas') }} · {{ plural(detail.portfolioItems, 'item', 'itens') }} no portfólio</div>
              <a v-if="u.enabled" :href="`${APP_URL}/tabs/workers/${detail.workerId}`" target="_blank" rel="noopener" class="text-brand text-xs font-medium hover:underline justify-self-start">Ver perfil público no app</a>
            </template>

            <div v-if="!u.isAdmin" class="flex gap-2">
              <button type="button" :disabled="busy" @click="toggleEnabled(u)" class="flex-1 py-2 rounded-xl border bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Icon :icon="u.enabled ? 'mdi:account-cancel-outline' : 'mdi:account-check-outline'" />{{ u.enabled ? 'Desativar' : 'Reativar' }}
              </button>
              <button type="button" :disabled="busy" @click="remove(u)" class="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Icon icon="mdi:trash-can-outline" />Excluir
              </button>
            </div>
          </template>
        </div>
      </div>

      <div v-if="loading" class="h-20 rounded-2xl bg-slate-100 animate-pulse" />
      <p v-else-if="!users.length" class="text-sm text-slate-400 bg-white rounded-2xl border p-4">Nenhuma conta encontrada.</p>
      <button v-else-if="page < pages" type="button" @click="load(true)" class="py-2.5 rounded-xl border bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50">Carregar mais</button>
    </div>
  </section>
</template>
