<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'

// Result of the last action: green when it worked, red when it didn't.
// It floats at the bottom of the screen, so it shows wherever the person
// scrolled to (on a phone the top of the page is usually out of sight).
// A success goes away by itself; an error stays until it is closed.
const props = defineProps<{ ok: boolean; text: string }>()
const emit = defineEmits<{ close: [] }>()

let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [props.ok, props.text],
  () => {
    clearTimeout(timer)
    if (props.ok) timer = setTimeout(() => emit('close'), 4000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none flex justify-center"
    >
      <p
        :role="ok ? 'status' : 'alert'"
        class="pointer-events-auto w-full max-w-md flex items-start gap-2 text-sm rounded-xl px-3 py-2.5 border shadow-lg"
        :class="ok ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'"
      >
        <Icon :icon="ok ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'" class="mt-0.5 flex-shrink-0" />
        <span class="flex-1">{{ text }}</span>
        <button type="button" aria-label="Fechar" @click="emit('close')" class="-m-1 p-1 text-slate-400 hover:text-slate-600"><Icon icon="mdi:close" /></button>
      </p>
    </div>
  </Teleport>
</template>
