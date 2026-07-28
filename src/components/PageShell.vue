<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import type { NavigationItem } from '../navigation'

const props = defineProps<{
  activeItemId: string
}>()

defineSlots<{
  default(props: { isFading: boolean; navigate: (item: NavigationItem) => void }): unknown
}>()

const router = useRouter()
const isFading = ref(false)
const isSliding = ref(false)
const isInstantReset = ref(false)
const selectedItemId = ref(props.activeItemId)
const timers: number[] = []

function resetTransition() {
  timers.forEach(window.clearTimeout)
  timers.length = 0
  isFading.value = false
  isSliding.value = false
  selectedItemId.value = props.activeItemId
}

function navigate(item: NavigationItem) {
  if (isFading.value || item.id === props.activeItemId) return

  selectedItemId.value = item.id
  isFading.value = true

  timers.push(
    window.setTimeout(() => {
      isSliding.value = true
      timers.push(
        window.setTimeout(() => {
          if (item.to) {
            router.push(item.to)
          } else if (item.href) {
            window.location.assign(item.href)
          }
        }, 600),
      )
    }, 500),
  )
}

function handlePageShow(event: PageTransitionEvent) {
  if (!event.persisted) return

  isInstantReset.value = true
  resetTransition()
  nextTick(() => {
    isInstantReset.value = false
  })
}

onMounted(() => window.addEventListener('pageshow', handlePageShow))
onBeforeUnmount(() => {
  window.removeEventListener('pageshow', handlePageShow)
  timers.forEach(window.clearTimeout)
})
</script>

<template>
  <div class="page" :class="{ 'no-transition': isInstantReset }">
    <div class="bg" :class="{ fading: isFading }"></div>

    <div class="grid">
      <div id="vert-line" :class="{ 'fade-out': isFading }"></div>
      <div id="hor-line" :class="{ 'fade-out': isFading }"></div>
      <AppHeader
        :active-item-id="selectedItemId"
        :is-fading="isFading"
        :is-sliding="isSliding"
        @navigate="navigate"
      />
      <slot :is-fading="isFading" :navigate="navigate" />
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.page.no-transition,
.page.no-transition * {
  transition: none !important;
  animation: none !important;
}

@keyframes bg-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bg-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.72;
  }
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(483.14% 514.26% at 50% 268.58%, #3d9c55 0%, #000000 42.58%);
  animation:
    bg-enter 1s ease-out,
    bg-breathe 5s ease-in-out 3s infinite;
}

.bg.fading {
  animation: none;
  opacity: 0;
  transition: opacity 0.85s ease-in;
}

.grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  color: #fff;
  font-family: monospace;
}

:deep([data-component='AppHeader']) {
  grid-column: 1 / 13;
  grid-row: 1;
}

#vert-line {
  grid-column: 2;
  grid-row: 2 / 13;
  border-left: 1px solid #4f4f4f;
  transition: opacity 0.45s ease;
}

#hor-line {
  border-top: 1px solid #4f4f4f;
  grid-column: 1 / 13;
  grid-row: 12;
  transition: opacity 0.45s ease;
}

.fade-out {
  opacity: 0 !important;
}
</style>
