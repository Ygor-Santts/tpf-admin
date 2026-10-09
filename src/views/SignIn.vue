<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { apiError } from '@/api'
import { signInRequest } from '@/services'
import { signIn } from '@/session'

const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const reason = computed(() => {
  if (route.query.motivo === 'expirou') return 'Sua sessão expirou. Entre de novo.'
  if (route.query.motivo === 'sem-acesso') return 'Esta conta não tem mais acesso ao admin.'
  return ''
})

async function submit() {
  error.value = ''
  if (!form.email.trim() || !form.password) {
    error.value = 'Informe e-mail e senha.'
    return
  }
  loading.value = true
  try {
    const { access_token, user } = await signInRequest(form.email.trim(), form.password)
    if (!user.isAdmin) {
      error.value = 'Esta conta não tem acesso ao admin.'
      return
    }
    signIn(access_token, { id: user.id, name: user.name, email: user.email })
    router.replace('/')
  } catch (e) {
    error.value = apiError(e, 'Não foi possível entrar. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm grid gap-6">
      <div class="text-center grid gap-2 justify-items-center">
        <img src="/logo.png" alt="Trampo Fácil" class="w-20 h-20 rounded-2xl shadow-md" />
        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Admin</p>
      </div>

      <p v-if="reason" class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        <Icon icon="mdi:alert-outline" class="flex-shrink-0" />{{ reason }}
      </p>

      <form @submit.prevent="submit" novalidate class="bg-white rounded-2xl shadow-card border p-6 grid gap-3">
        <h1 class="text-lg font-bold text-slate-900">Entrar no admin</h1>
        <input v-model="form.email" type="email" autocomplete="email" placeholder="E-mail" class="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
        <input v-model="form.password" type="password" autocomplete="current-password" placeholder="Senha" class="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
        <p v-if="error" class="flex items-center gap-1.5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <Icon icon="mdi:alert-circle-outline" class="flex-shrink-0" />{{ error }}
        </p>
        <button :disabled="loading" class="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          <Icon v-if="loading" icon="mdi:loading" class="animate-spin" />Entrar
        </button>
        <p class="text-xs text-slate-500 text-center">Use a mesma conta do app. Só contas de administrador entram.</p>
      </form>
    </div>
  </div>
</template>
