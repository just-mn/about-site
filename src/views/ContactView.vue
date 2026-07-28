<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageShell from '../components/PageShell.vue'
import TurnstileWidget from '../components/TurnstileWidget.vue'

type ContactLink = {
  label: string
  value: string
  href: string
}

const siteKey = ref('')
const contacts = ref<ContactLink[]>([])
const isLoading = ref(true)
const isVerifying = ref(false)
const errorMessage = ref('')
const turnstile = ref<InstanceType<typeof TurnstileWidget>>()
const router = useRouter()

function goBack() {
  const previousPath = window.history.state?.from
  if (typeof previousPath === 'string' && previousPath.startsWith('/')) {
    router.push(previousPath)
    return
  }

  const referrer = document.referrer ? new URL(document.referrer) : undefined
  if (referrer?.origin === window.location.origin && referrer.pathname !== '/contact') {
    router.push(`${referrer.pathname}${referrer.search}${referrer.hash}`)
    return
  }

  router.push('/')
}

async function loadConfiguration() {
  try {
    const response = await fetch('/api/turnstile-config')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    siteKey.value = data.siteKey
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load verification.'
  } finally {
    isLoading.value = false
  }
}

async function revealContacts(token: string) {
  isVerifying.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    contacts.value = data.contacts
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Verification failed. Please try again.'
    turnstile.value?.reset()
  } finally {
    isVerifying.value = false
  }
}

onMounted(loadConfiguration)
</script>

<template>
  <PageShell
    active-item-id="contact"
    :show-grid-lines="false"
    :show-navigation="false"
    v-slot="{ isFading }"
  >
    <div class="contact-stage" :class="{ 'fade-out': isFading }" aria-hidden="true">
      <div class="orb orb-left"></div>
      <div class="orb orb-right"></div>
      <div class="orb orb-bottom"></div>
    </div>

    <section
      class="contact-modal"
      :class="{ 'fade-out': isFading }"
      aria-labelledby="contact-title"
    >
      <button class="back-button" type="button" @click="goBack">← back</button>
      <p class="eyebrow">private contact card.</p>
      <h1 id="contact-title">let&rsquo;s get in touch.</h1>

      <template v-if="contacts.length">
        <ul>
          <li v-for="link in contacts" :key="link.label">
            <span>{{ link.label }}</span>
            <a :href="link.href">{{ link.value }} <b>↗</b></a>
          </li>
        </ul>
        <p class="note">thanks for stopping by.</p>
      </template>

      <div v-else class="verification">
        <p>pass the check to reveal the links.</p>
        <TurnstileWidget
          v-if="siteKey"
          ref="turnstile"
          :site-key="siteKey"
          @error="errorMessage = 'Verification expired. Please try again.'"
          @verified="revealContacts"
        />
        <p v-if="isLoading" class="status">loading verification…</p>
        <p v-else-if="isVerifying" class="status">checking…</p>
        <p v-else-if="errorMessage" class="status error">{{ errorMessage }}</p>
      </div>
    </section>
  </PageShell>
</template>

<style scoped>
.contact-stage {
  position: absolute;
  inset: 0;
  grid-column: 1 / 13;
  grid-row: 1 / 13;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 0.45s ease;
}

.orb {
  position: absolute;
  width: clamp(22rem, 48vw, 54rem);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.8;
}

.orb-left {
  top: 12%;
  left: -20rem;
  background: radial-gradient(
    circle,
    rgb(35 203 159 / 78%) 0%,
    rgb(21 129 111 / 24%) 42%,
    transparent 70%
  );
  animation:
    arrive-left 1.7s cubic-bezier(0.16, 1, 0.3, 1) both,
    float-left 9s 1.7s ease-in-out infinite alternate;
}

.orb-right {
  top: -24rem;
  right: -14rem;
  background: radial-gradient(
    circle,
    rgb(130 103 219 / 72%) 0%,
    rgb(79 56 151 / 22%) 45%,
    transparent 70%
  );
  animation:
    arrive-right 2s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both,
    float-right 11s 2.1s ease-in-out infinite alternate;
}

.orb-bottom {
  right: 16%;
  bottom: -30rem;
  background: radial-gradient(
    circle,
    rgb(226 112 143 / 62%) 0%,
    rgb(132 52 82 / 18%) 48%,
    transparent 70%
  );
  animation:
    arrive-bottom 1.9s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both,
    float-bottom 10s 1.95s ease-in-out infinite alternate;
}

.contact-modal {
  z-index: 1;
  grid-column: 3 / 11;
  grid-row: 4 / 10;
  align-self: center;
  width: min(100%, 42rem);
  justify-self: center;
  padding: clamp(1.5rem, 4vw, 3.25rem);
  border: 1px solid rgb(255 255 255 / 30%);
  background: rgb(0 0 0 / 45%);
  box-shadow: 0 2rem 8rem rgb(0 0 0 / 45%);
  backdrop-filter: blur(20px);
  transition: opacity 0.45s ease;
}

.eyebrow,
.note,
.verification p {
  margin: 0;
  color: rgb(255 255 255 / 55%);
  font-size: 1rem;
}

.back-button {
  padding: 0;
  margin: 0 0 2.5rem;
  border: 0;
  color: rgb(255 255 255 / 60%);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.back-button:hover {
  color: #fff;
}

h1 {
  margin: 0.5rem 0 2.5rem;
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  font-weight: 500;
  letter-spacing: -0.08em;
}

ul {
  padding: 0;
  margin: 0;
  list-style: none;
  border-top: 1px solid rgb(255 255 255 / 30%);
}

li {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgb(255 255 255 / 30%);
}

li span {
  color: rgb(255 255 255 / 55%);
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

.verification {
  display: grid;
  gap: 1.25rem;
}

.status {
  min-height: 1.5rem;
}

.error {
  color: #ff9e9e !important;
}

.note {
  margin-top: 1.5rem;
}

.fade-out {
  opacity: 0 !important;
}

@keyframes arrive-left {
  from {
    transform: translateX(-50vw);
  }
  to {
    transform: translateX(18rem);
  }
}

@keyframes arrive-right {
  from {
    transform: translate(50vw, -40vh);
  }
  to {
    transform: translate(-3rem, 16rem);
  }
}

@keyframes arrive-bottom {
  from {
    transform: translate(20vw, 45vh);
  }
  to {
    transform: translate(-2rem, -16rem);
  }
}

@keyframes float-left {
  from {
    transform: translate(18rem, 0) scale(1);
  }
  to {
    transform: translate(14rem, -1.5rem) scale(1.05);
  }
}

@keyframes float-right {
  from {
    transform: translate(-3rem, 16rem) scale(1);
  }
  to {
    transform: translate(1rem, 12rem) scale(1.06);
  }
}

@keyframes float-bottom {
  from {
    transform: translate(-2rem, -16rem) scale(1);
  }
  to {
    transform: translate(-5rem, -20rem) scale(1.04);
  }
}

@media (max-width: 700px) {
  .contact-modal {
    grid-column: 2 / 12;
    grid-row: 3 / 11;
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
