<script setup>
const props = defineProps({
  currentTab: String
})
</script>

<template>
    <header>
        <ul>
            <li><RouterLink to="/">Home</RouterLink></li>
        </ul>
    </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #4F4F4F;
}
</style>