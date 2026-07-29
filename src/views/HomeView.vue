<script setup lang="ts">
import PageShell from '../components/PageShell.vue'
import { navigationItems } from '../navigation'

const contactItem = navigationItems.find((item) => item.id === 'contact')!
</script>

<template>
  <PageShell active-item-id="home" v-slot="{ isFading, navigate }">
    <span class="wip" :class="{ 'fade-out': isFading }">WIP. Coming Soon.</span>
    <span class="under" :class="{ 'fade-out': isFading }">under construction</span>
    <h1 class="title" :class="{ 'fade-out': isFading }">hi, i&rsquo;m denis.</h1>
    <div class="sub" :class="{ 'fade-out': isFading }">
      <p>making some useful/useless</p>
      <p>and imho.beautiful stuff.</p>
      <a class="contact-link" href="/contact" @click.prevent="navigate(contactItem)">contact →</a>
    </div>
  </PageShell>
</template>

<style scoped>
span,
.title,
.sub {
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
  animation: home-enter-muted 0.7s 0.4s ease-out both;
}

.under {
  grid-column: 11 / 13;
  grid-row: 3 / 4;
  font-size: 1.9rem;
  letter-spacing: -0.142em;
  opacity: 0.2;
  justify-self: end;
  margin-right: 0.142em;
  animation: home-enter-muted 0.7s 0.5s ease-out both;
}

.title {
  grid-column: 2 / 7;
  grid-row: 6;
  align-self: end;
  font-weight: 666;
  font-size: 3.2rem;
  margin: 0;
  animation: home-enter 0.75s 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sub {
  grid-column: 2 / 7;
  grid-row: 7;
  margin: 0;
  font-size: 1.5rem;
  animation: home-enter 0.75s 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sub p {
  margin: 0;
}

.contact-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid #4f4f4f;
}

.contact-link:hover {
  border-color: #fff;
}

.fade-out {
  opacity: 0 !important;
}

@keyframes home-enter {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes home-enter-muted {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  to {
    opacity: 0.2;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wip,
  .under,
  .title,
  .sub {
    animation: none;
  }
}

@media (max-width: 1510px) {
  .under {
    grid-column: 10 / 13;
  }
}
</style>
