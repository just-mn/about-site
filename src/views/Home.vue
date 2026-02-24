<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue';
const curTab = ref('/')
</script>

<template>
  <div class="grid">
    <div id="vert-line"></div>
    <div id="hor-line"></div>
    <Header :currentTab="curTab" />
    <span class="wip">WIP. Coming  Soon.</span>
    <span class="under">under construction</span>
    <h1 class="title">hi, i&rsquo;m denis.</h1>
    <div class="sub">
      <p id="sub1">making some useful/useless</p>
      <p id="sub2">and imho.beautiful stuff.</p>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  width: 100vw;
  height: 100vh;
  background: radial-gradient(483.14% 514.26% at 50% 268.58%, #3D9C55 0%, #000000 42.58%);
  color: #ffffff;
  font-family: monospace;
  padding: 0%;
  overflow: hidden;
}

header {
  grid-column: 1/13;
  grid-row: 1;
}

span {
  display: block;
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
  .under {
    grid-column: 10 / 13;
    
  }
}

.title {
  grid-column: 2 / 7;
  grid-row: 6;
  align-self: end;
  font-weight: bold;
  font-size: 3.2rem;
  margin: 0;
  font-weight: 666;
}

.sub {
  grid-column: 2 / 7;
  grid-row: 7;
  margin: 0;
  font-size: 1.5rem;
}

#sub1 {
  align-self: start;
}

#sub2 {
  align-self: end;
}

#vert-line {
    grid-column: 2;
    grid-row: 2 / 13;
    border-left: 1px solid #4F4F4F;
}

#hor-line {
    border-top: 1px solid #4F4F4F;
    grid-column: 1 / 13;
    grid-row: 12;
}
</style>