<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const areContactsRevealed = ref(false)
const isVerifying = ref(false)
const isLeaving = ref(false)
const errorMessage = ref('')
const turnstile = ref<InstanceType<typeof TurnstileWidget>>()
const modal = ref<HTMLElement>()
const router = useRouter()
let returnTimer: number | undefined

function getReturnPath() {
  const previousPath = window.history.state?.from
  if (typeof previousPath === 'string' && previousPath.startsWith('/')) {
    return previousPath
  }

  const referrer = document.referrer ? new URL(document.referrer) : undefined
  if (referrer?.origin === window.location.origin && referrer.pathname !== '/contact') {
    return `${referrer.pathname}${referrer.search}${referrer.hash}`
  }

  return '/'
}

function goBack() {
  if (isLeaving.value) return

  isLeaving.value = true
  returnTimer = window.setTimeout(() => router.push(getReturnPath()), 450)
}

async function loadConfiguration() {
  try {
    const response = await fetch('/api/turnstile-config')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    siteKey.value = data.siteKey
  } catch (error) {
    await showVerificationError(
      error instanceof Error ? error.message : 'Could not load verification.',
    )
  }
}

async function revealContacts(token: string) {
  if (isVerifying.value) return

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
    await revealContactDetails(data.contacts)
  } catch (error) {
    await showVerificationError(
      error instanceof Error ? error.message : 'Verification failed. Please try again.',
    )
    turnstile.value?.reset()
  } finally {
    isVerifying.value = false
  }
}

async function revealContactDetails(nextContacts: ContactLink[]) {
  await animateModalChange(() => {
    contacts.value = nextContacts
    areContactsRevealed.value = true
  })
}

async function showVerificationError(message: string) {
  await animateModalChange(() => {
    errorMessage.value = message
  })
}

async function animateModalChange(change: () => void) {
  const element = modal.value
  const previousHeight = element?.getBoundingClientRect().height

  change()
  await nextTick()

  if (!element || !previousHeight) return

  element.style.height = 'auto'
  const nextHeight = element.getBoundingClientRect().height
  if (Math.abs(nextHeight - previousHeight) < 1) return

  element.style.height = `${previousHeight}px`
  void element.offsetHeight
  window.requestAnimationFrame(() => {
    element.style.height = `${nextHeight}px`
    const resetHeight = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return
      element.style.height = ''
      element.removeEventListener('transitionend', resetHeight)
    }
    element.addEventListener('transitionend', resetHeight)
  })
}

onMounted(loadConfiguration)
onBeforeUnmount(() => window.clearTimeout(returnTimer))
</script>

<template>
  <PageShell
    active-item-id="contact"
    :show-background="false"
    :show-grid-lines="false"
    :show-navigation="false"
    v-slot="{ isFading }"
  >
    <div
      class="contact-stage"
      :class="{ 'fade-out': isFading, 'is-leaving': isLeaving }"
      aria-hidden="true"
    >
      <div class="orb orb-left"></div>
      <div class="orb orb-right"></div>
      <div class="orb orb-bottom"></div>
    </div>

    <section
      class="contact-modal"
      ref="modal"
      :class="{ 'fade-out': isFading, 'is-leaving': isLeaving }"
      aria-labelledby="contact-title"
    >
      <button class="back-button" type="button" :disabled="isLeaving" @click="goBack">
        ← back
      </button>
      <h1 id="contact-title">let&rsquo;s get in touch.</h1>

      <div v-if="areContactsRevealed" class="contact-details">
        <ul v-if="contacts.length">
          <li v-for="link in contacts" :key="link.label">
            <span>{{ link.label }}</span>
            <a :href="link.href">{{ link.value }} <b>↗</b></a>
          </li>
        </ul>
        <p v-else class="status">no contact links are configured.</p>
      </div>

      <div v-else class="verification">
        <p>pass the check to reveal the links.</p>
        <div class="turnstile-slot">
          <TurnstileWidget
            v-if="siteKey"
            ref="turnstile"
            :site-key="siteKey"
            @error="showVerificationError('Verification expired. Please try again.')"
            @verified="revealContacts"
          />
        </div>
        <p v-if="errorMessage" class="status error">
          {{ errorMessage }}
        </p>
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
  animation: contact-stage-enter 0.7s ease-out both;
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
  box-sizing: border-box;
  justify-self: center;
  padding: clamp(1.5rem, 4vw, 3.25rem);
  border: 1px solid rgb(255 255 255 / 30%);
  background: rgb(0 0 0 / 45%);
  box-shadow: 0 2rem 8rem rgb(0 0 0 / 45%);
  backdrop-filter: blur(20px);
  transition:
    height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.45s ease;
  animation: contact-modal-enter 0.65s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.contact-stage.is-leaving {
  animation: contact-stage-exit 0.45s ease-in both;
}

.contact-modal.is-leaving {
  pointer-events: none;
  animation: contact-modal-exit 0.45s ease-in both;
}

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

.back-button:disabled {
  cursor: default;
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

.contact-details {
  animation: contact-content-enter 0.35s 0.1s ease-out both;
}

.turnstile-slot {
  min-height: 65px;
}

.error {
  color: #ff9e9e !important;
}

.fade-out {
  opacity: 0 !important;
}

@keyframes contact-stage-exit {
  to {
    opacity: 0;
  }
}

@keyframes contact-stage-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes contact-modal-enter {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes contact-modal-exit {
  to {
    opacity: 0;
    transform: translateY(-0.75rem) scale(0.98);
  }
}

@keyframes contact-content-enter {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (prefers-reduced-motion: reduce) {
  .contact-stage,
  .contact-modal {
    animation: none;
  }
}
</style>
