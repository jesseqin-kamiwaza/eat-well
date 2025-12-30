import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import TodayEat from './views/TodayEat.vue'
import TableDesign from './views/TableDesign.vue'
import Favorites from './views/Favorites.vue'
import Gallery from './views/Gallery.vue'
import HowToCook from './views/HowToCook.vue'
import SauceDesign from './views/SauceDesign.vue'
import FortuneCooking from './views/FortuneCooking.vue'
import SettingsDemo from './views/SettingsDemo.vue'
import RecipeDetail from './views/RecipeDetail.vue'
import { autoRefreshEnvSettings } from './utils/envWatcher'
import './style.css'

const routes = [
    { path: '/', component: Home, meta: { transition: 'fade' } },
    { path: '/about', component: About, meta: { transition: 'fade' } },
    { path: '/today-eat', component: TodayEat, meta: { transition: 'slide-left' } },
    { path: '/table-design', component: TableDesign, meta: { transition: 'slide-left' } },
    { path: '/favorites', component: Favorites, meta: { transition: 'slide-left' } },
    { path: '/gallery', component: Gallery, meta: { transition: 'slide-left' } },
    { path: '/how-to-cook', component: HowToCook, meta: { transition: 'slide-up' } },
    { path: '/sauce-design', component: SauceDesign, meta: { transition: 'slide-up' } },
    { path: '/fortune-cooking', component: FortuneCooking, meta: { transition: 'slide-up' } },
    { path: '/settings-demo', component: SettingsDemo, meta: { transition: 'fade' } },
    { path: '/recipe/:id', component: RecipeDetail, meta: { transition: 'slide-up' } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 初始化应用
const app = createApp(App).use(router)

// 在应用挂载前检查环境变量变化并自动刷新
autoRefreshEnvSettings()

// 挂载应用
app.mount('#app')

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('发现新版本，是否立即更新？')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}
