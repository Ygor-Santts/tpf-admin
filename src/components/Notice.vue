<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Result of the last action: green when it worked, red when it didn't.
defineProps<{ ok: boolean; text: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <p
    class="flex items-start gap-1.5 text-sm rounded-xl px-3 py-2 border"
    :class="ok ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'"
  >
    <Icon :icon="ok ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'" class="mt-0.5 flex-shrink-0" />
    <span class="flex-1">{{ text }}</span>
    <button type="button" aria-label="Fechar" @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><Icon icon="mdi:close" /></button>
  </p>
</template>
