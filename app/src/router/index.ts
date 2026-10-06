import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { hasCompletedOnboarding } from '../data/onboarding'

// Routes theo `design-note/screen.md`
const routes: RouteRecordRaw[] = [
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/onboarding/WelcomeView.vue')
  },
  {
    path: '/settings/guide',
    name: 'usage-guide',
    component: () => import('../views/onboarding/WelcomeView.vue')
  },
  {
    path: '/',
    redirect: '/tarot'
  },

  // Tarot
  {
    path: '/tarot',
    name: 'tarot-home',
    component: () => import('../views/home/TarotHomeView.vue')
  },
  {
    path: '/tarot/daily',
    name: 'card-of-the-day',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/CardOfTheDayView.vue')
  },
  {
    path: '/tarot/yes-no',
    name: 'yes-no',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/YesNoView.vue')
  },
  {
    path: '/tarot/love',
    name: 'love-tarot',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/LoveView.vue')
  },
  {
    path: '/tarot/money',
    name: 'money-tarot',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/MoneyView.vue')
  },
  {
    path: '/tarot/yearly',
    name: 'yearly-tarot',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/YearlyView.vue')
  },
  {
    path: '/tarot/3-card-spread',
    name: 'three-card-spread',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/ThreeCardSpreadView.vue')
  },
  {
    path: '/tarot/library',
    name: 'tarot-library',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/TarotLibraryView.vue')
  },
  {
    path: '/tarot/library/:cardId',
    name: 'tarot-card-detail',
    meta: { requiresCards: true },
    component: () => import('../views/tarot/TarotCardDetailView.vue')
  },

  // Zodiac
  {
    path: '/zodiac',
    name: 'zodiac-home',
    component: () => import('../views/home/ZodiacHomeView.vue')
  },
  {
    path: '/zodiac/origin',
    name: 'zodiac-origin-list',
    meta: { requiresZodiac: true },
    component: () => import('../views/zodiac/OriginListView.vue')
  },
  {
    path: '/zodiac/origin/:signId',
    name: 'zodiac-origin-detail',
    meta: { requiresZodiac: true },
    component: () => import('../views/zodiac/OriginDetailView.vue')
  },
  {
    path: '/zodiac/horoscope',
    name: 'horoscope',
    meta: { requiresZodiac: true },
    component: () => import('../views/zodiac/HoroscopeView.vue')
  },

  // Settings
  {
    path: '/settings/language',
    name: 'settings-language',
    component: () => import('../views/settings/LanguageSettingsView.vue')
  },
  {
    path: '/settings',
    name: 'settings-home',
    component: () => import('../views/settings/SettingsHomeView.vue')
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

// Hash history cho Capacitor (webview native, tránh lỗi deep-link/refresh)
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  if (!hasCompletedOnboarding() && to.name !== 'welcome') return { name: 'welcome', replace: true }
  if (hasCompletedOnboarding() && to.name === 'welcome') return { name: 'tarot-home', replace: true }
})

export default router
