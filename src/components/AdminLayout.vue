<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_URL } from '@/config'
import { session, signOut } from '@/session'

const route = useRoute()
const router = useRouter()
const tabs = [
  { to: '/categorias', icon: 'mdi:view-grid-outline', label: 'Categorias' },
  { to: '/usuarios', icon: 'mdi:account-group-outline', label: 'Usuários' },
]

function leave() {
  signOut()
  router.replace('/entrar')
}
</script>

<template>
  <div class="min-h-screen">
    <header class="bg-white border-b sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/icon-192.png" alt="" class="w-8 h-8 rounded-lg" />
          <span class="font-bold text-brand">Trampo Fácil</span>
          <span class="text-xs font-semibold uppercase tracking-wide bg-slate-900 text-white px-1.5 py-0.5 rounded">Admin</span>
        </RouterLink>
        <div class="ml-auto flex items-center gap-3 text-sm">
          <a :href="APP_URL" target="_blank" rel="noopener" class="hidden sm:flex items-center gap-1 text-slate-500 hover:text-brand">
            <Icon icon="mdi:open-in-new" />Abrir o app
          </a>
          <span class="hidden sm:inline text-slate-400">|</span>
          <span class="hidden sm:inline text-slate-600 truncate max-w-[10rem]">{{ session.user?.name }}</span>
          <button type="button" @click="leave" class="flex items-center gap-1 text-slate-500 hover:text-red-500">
            <Icon icon="mdi:logout" />Sair
          </button>
        </div>
      </div>
      <nav class="max-w-4xl mx-auto px-4 flex gap-1">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="route.path.startsWith(tab.to) ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          <Icon :icon="tab.icon" />{{ tab.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
