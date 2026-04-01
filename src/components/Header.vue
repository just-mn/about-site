<script setup>
defineProps({
  currentTab: String,
  isFading: Boolean,
  isSliding: Boolean,
})

defineEmits(['calendar-click'])
</script>

<template>
  <header :class="{ 'slide-up': isSliding }">
    <ul>
      <li :class="{ 'collapse': isFading }">
        <RouterLink to="/">Home</RouterLink>
      </li>
      <li>
        <a href="#" @click.prevent="$emit('calendar-click')">calenbar</a>
      </li>
    </ul>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #4F4F4F;
  position: relative;
  z-index: 20;
  transition: transform 0.45s ease, border-color 0.3s ease;
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
  transition: max-width 0.4s ease, opacity 0.35s ease, padding 0.4s ease;
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
</style>
