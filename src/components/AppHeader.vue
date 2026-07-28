<script setup lang="ts">
import { navigationItems, type NavigationItem } from '../navigation'

defineProps<{
  activeItemId: string
  isFading: boolean
  isSliding: boolean
}>()

const emit = defineEmits<{
  navigate: [item: NavigationItem]
}>()
</script>

<template>
  <header :class="{ 'slide-up': isSliding }" data-component="AppHeader">
    <ul aria-label="Main navigation">
      <li
        v-for="item in navigationItems"
        :key="item.id"
        :class="{ collapse: isFading && item.id !== activeItemId }"
      >
        <a :href="item.href || item.to" @click.prevent="emit('navigate', item)">
          {{ item.label }}
        </a>
      </li>
    </ul>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #4f4f4f;
  position: relative;
  z-index: 20;
  transition:
    transform 0.45s ease,
    border-color 0.3s ease;
  animation: header-enter 0.5s 0.15s ease-out both;
}

header.slide-up {
  transform: translateY(-200%);
  border-color: transparent;
}

ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

li {
  padding: 0.5rem 1rem;
  overflow: hidden;
  max-width: 300px;
  opacity: 1;
  white-space: nowrap;
  transition:
    max-width 0.4s ease,
    opacity 0.35s ease,
    padding 0.4s ease;
}

li.collapse {
  max-width: 0;
  opacity: 0;
  padding-left: 0;
  padding-right: 0;
}

a {
  color: #fff;
  text-decoration: none;
  font-family: monospace;
  cursor: pointer;
}

a:hover {
  opacity: 0.7;
}

@keyframes header-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  header {
    animation: none;
  }
}
</style>
