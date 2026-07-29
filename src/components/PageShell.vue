<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import type { NavigationItem } from '../navigation'

const props = withDefaults(
  defineProps<{
    activeItemId: string
    showBackground?: boolean
    showGridLines?: boolean
    showNavigation?: boolean
  }>(),
  {
    showBackground: true,
    showGridLines: true,
    showNavigation: true,
  },
)

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
            router.push({
              path: item.to,
              state: { from: router.currentRoute.value.fullPath },
            })
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
    <div v-if="showBackground" class="bg" :class="{ fading: isFading }"></div>

    <div class="grid">
      <template v-if="showGridLines">
        <div id="vert-line" :class="{ 'fade-out': isFading }"></div>
        <div id="hor-line" :class="{ 'fade-out': isFading }"></div>
      </template>
      <AppHeader
        v-if="showNavigation"
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
  animation: vertical-line-enter 0.8s ease-out both;
}

#hor-line {
  border-top: 1px solid #4f4f4f;
  grid-column: 1 / 13;
  grid-row: 12;
  transition: opacity 0.45s ease;
  animation: horizontal-line-enter 0.8s 0.1s ease-out both;
}

.fade-out {
  opacity: 0 !important;
}

@keyframes vertical-line-enter {
  from {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top;
  }
}

@keyframes horizontal-line-enter {
  from {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    opacity: 1;
    transform: scaleX(1);
    transform-origin: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  #vert-line,
  #hor-line {
    animation: none;
  }
}
</style>
