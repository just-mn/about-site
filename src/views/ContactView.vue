<script setup lang="ts">
import PageShell from '../components/PageShell.vue'

// Replace these placeholder values with the contact details you want to share.
const contactLinks = [
  { label: 'email', value: 'you@example.com', href: 'mailto:you@example.com' },
  { label: 'telegram', value: '@your_handle', href: 'https://t.me/your_handle' },
  { label: 'github', value: 'your-handle', href: 'https://github.com/your-handle' },
]
</script>

<template>
  <PageShell active-item-id="contact" v-slot="{ isFading }">
    <section class="contact" :class="{ 'fade-out': isFading }" aria-labelledby="contact-title">
      <p class="eyebrow">say hi.</p>
      <h1 id="contact-title">let&rsquo;s get in touch.</h1>
      <ul>
        <li v-for="link in contactLinks" :key="link.label">
          <span>{{ link.label }}</span>
          <a :href="link.href">{{ link.value }} <b>↗</b></a>
        </li>
      </ul>
      <p class="note">and whatever else you want to leave here.</p>
    </section>
  </PageShell>
</template>

<style scoped>
.contact {
  grid-column: 2 / 8;
  grid-row: 5 / 10;
  align-self: center;
  transition: opacity 0.45s ease;
}

.eyebrow,
.note {
  margin: 0;
  color: rgb(255 255 255 / 45%);
  font-size: 1rem;
}

h1 {
  margin: 0.5rem 0 2.5rem;
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  font-weight: 500;
  letter-spacing: -0.08em;
}

ul {
  width: min(100%, 38rem);
  padding: 0;
  margin: 0;
  list-style: none;
  border-top: 1px solid #4f4f4f;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #4f4f4f;
}

li span {
  color: rgb(255 255 255 / 45%);
}

a {
  color: #fff;
  text-align: right;
  text-decoration: none;
}

a:hover {
  opacity: 0.65;
}

b {
  font-weight: 400;
}

.note {
  margin-top: 1.5rem;
}

.fade-out {
  opacity: 0 !important;
}

@media (max-width: 700px) {
  .contact {
    grid-column: 2 / 12;
  }

  li {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.3rem;
  }

  a {
    text-align: left;
  }
}
</style>
