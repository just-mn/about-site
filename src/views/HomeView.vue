<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppHeader from '../components/AppHeader.vue';

const curTab = ref('/')
const isFading = ref(false)
const isSliding = ref(false)
const isInstantReset = ref(false)

function handleCalendarClick() {
  isFading.value = true

  setTimeout(() => {
    isSliding.value = true

    setTimeout(() => {
      window.location.href = 'https://calenbar.just-mn.dev'
    }, 600)
  }, 500)
}

onMounted(() => {
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      isInstantReset.value = true
      isFading.value = false
      isSliding.value = false
      nextTick(() => {
        isInstantReset.value = false
      })
    }
  })
})
</script>

<template>
  <div class="page" :class="{ 'no-transition': isInstantReset }">

    <div class="bg" :class="{ 'fading': isFading }"></div>

    <div class="grid" :class="{ 'fading': isFading }">
      <div id="vert-line" :class="{ 'fade-out': isFading }"></div>
      <div id="hor-line" :class="{ 'fade-out': isFading }"></div>
      <AppHeader
        :currentTab="curTab"
        :isFading="isFading"
        :isSliding="isSliding"
        @calendar-click="handleCalendarClick"
      />
      <span class="wip" :class="{ 'fade-out': isFading }">WIP. Coming  Soon.</span>
      <span class="under" :class="{ 'fade-out': isFading }">under construction</span>
      <h1 class="title" :class="{ 'fade-out': isFading }">hi, i&rsquo;m denis.</h1>
      <div class="sub" :class="{ 'fade-out': isFading }">
        <p id="sub1">making some useful/useless</p>
        <p id="sub2">and imho.beautiful stuff.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ===================== root ===================== */
.page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

/* при back/bfcache — мгновенно показываем всё без анимаций */
.page.no-transition,
.page.no-transition * {
  transition: none !important;
  animation: none !important;
}

/* ===================== gradient bg ===================== */
@keyframes bg-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes bg-breathe {
  0%, 100% { opacity: 1;    }
  50%       { opacity: 0.72; }
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(483.14% 514.26% at 50% 268.58%, #3D9C55 0%, #000000 42.58%);
  animation: bg-enter 1s ease-out, bg-breathe 5s ease-in-out 3s infinite;
}

.bg.fading {
  animation: none;
  opacity: 0;
  transition: opacity 0.85s ease-in;
}

/* ===================== content grid ===================== */
.grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  color: #ffffff;
  font-family: monospace;
}


/* ===================== layout ===================== */
header {
  grid-column: 1/13;
  grid-row: 1;
}

span {
  display: block;
  transition: opacity 0.45s ease;
}

.wip {
  grid-column: 7 / 13;
  grid-row: 2;
  justify-self: end;
  letter-spacing: clamp(0.05em, 1vw, 1.05em);
  margin-right: calc(-1 * clamp(0.05em, 1vw, 1.05em));
  font-size: 1.9rem;
  opacity: 0.2;
}

.under {
  grid-column: 11 / 13;
  grid-row: 3 / 4;
  font-size: 1.9rem;
  letter-spacing: -0.142em;
  opacity: 0.2;
  justify-self: end;
  margin-right: 0.142em;
}

@media (max-width: 1510px) {
  .under { grid-column: 10 / 13; }
}

.title {
  grid-column: 2 / 7;
  grid-row: 6;
  align-self: end;
  font-weight: 666;
  font-size: 3.2rem;
  margin: 0;
  transition: opacity 0.45s ease;
}

.sub {
  grid-column: 2 / 7;
  grid-row: 7;
  margin: 0;
  font-size: 1.5rem;
  transition: opacity 0.45s ease;
}

#sub1 { align-self: start; }
#sub2 { align-self: end; }

#vert-line {
  grid-column: 2;
  grid-row: 2 / 13;
  border-left: 1px solid #4F4F4F;
  transition: opacity 0.45s ease;
}

#hor-line {
  border-top: 1px solid #4F4F4F;
  grid-column: 1 / 13;
  grid-row: 12;
  transition: opacity 0.45s ease;
}

.fade-out {
  opacity: 0 !important;
}
</style>
