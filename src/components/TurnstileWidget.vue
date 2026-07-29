<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type TurnstileApi = {
  remove: (widgetId: string) => void
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme: 'dark'
      action: string
      callback: (token: string) => void
      'error-callback': () => void
      'expired-callback': () => void
    },
  ) => string
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const props = defineProps<{
  siteKey: string
}>()

const emit = defineEmits<{
  error: []
  verified: [token: string]
}>()

const container = ref<HTMLElement>()
let widgetId: string | undefined
let scriptPromise: Promise<TurnstileApi> | undefined

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not load'))
    script.onerror = () => reject(new Error('Turnstile did not load'))
    document.head.append(script)
  })

  return scriptPromise
}

async function renderWidget() {
  if (!container.value || !props.siteKey) return

  try {
    const turnstile = await loadTurnstile()
    widgetId = turnstile.render(container.value, {
      sitekey: props.siteKey,
      theme: 'dark',
      action: 'view_contacts',
      callback: (token) => emit('verified', token),
      'error-callback': () => emit('error'),
      'expired-callback': () => emit('error'),
    })
  } catch {
    emit('error')
  }
}

function reset() {
  if (widgetId && window.turnstile) window.turnstile.reset(widgetId)
}

onMounted(renderWidget)
watch(() => props.siteKey, renderWidget)
onBeforeUnmount(() => {
  if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
})

defineExpose({ reset })
</script>

<template>
  <div ref="container" class="turnstile-widget"></div>
</template>
