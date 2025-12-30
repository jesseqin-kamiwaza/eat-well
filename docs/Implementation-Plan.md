# 一饭封神 PWA 转换 - Implementation Plan

> 基于 PWA-Mobile-Optimization-Plan.md 的详细实施计划
>
> **创建日期**: 2025-12-29
> **状态**: 准备实施
> **预计总时间**: 16-24天

---

## 📋 目录

1. [实施概览](#实施概览)
2. [环境准备](#环境准备)
3. [阶段详细计划](#阶段详细计划)
4. [关键文件清单](#关键文件清单)
5. [验证检查清单](#验证检查清单)

---

## 🎯 实施概览

### 总体策略

所有的代码书写、注释都要使用英文。 在目前代码界面有中文内容的情况下,页面显示你可以保留中文 

**分阶段渐进式实施**：
- 每个阶段完成后进行验证
- 确保不破坏现有功能
- 保持应用始终可运行
- 使用功能分支进行开发

### 技术栈确认

✅ **已安装**:
- Vue 3.4 + Composition API
- TypeScript 5.3+
- Vite 5.0+
- Tailwind CSS 3.4.0
- Vue Router 4.2
- @vueuse/core 10.7.0

⚠️ **需要安装**:
- @tanstack/vue-virtual (虚拟滚动 - 阶段6)
- vite-plugin-pwa (PWA插件 - 可选)

---

## 🛠️ 环境准备

### 1. Git 分支策略

```bash
# 创建开发分支
git checkout -b feature/pwa-conversion

# 为每个阶段创建子分支（可选）
git checkout -b feature/pwa-conversion/stage-1-pwa-core
```

### 2. 开发服务器HTTPS配置

PWA要求HTTPS环境（localhost除外）。如需真机测试，配置本地HTTPS：

```bash
# 安装 mkcert (macOS)
brew install mkcert
mkcert -install

# 生成本地证书
mkcert localhost 192.168.x.x

# Vite配置中使用证书
# vite.config.ts 添加：
# server: {
#   https: {
#     key: fs.readFileSync('localhost-key.pem'),
#     cert: fs.readFileSync('localhost.pem')
#   }
# }
```

### 3. 测试设备准备

- ✅ Chrome DevTools 移动模拟器
- ✅ 真实iOS设备（iPhone）
- ✅ 真实Android设备
- ✅ Safari/Chrome浏览器

---

## 📝 阶段详细计划

## 阶段 1: PWA 基础设施 (1-2天)

### 目标
让应用可以安装到主屏幕，支持离线访问静态资源

### 任务清单

#### 1.1 创建 PWA Manifest

**文件**: `public/manifest.json`

```bash
# 创建文件并添加内容
touch public/manifest.json
```

<details>
<summary>完整内容</summary>

```json
{
  "name": "一饭封神 - AI美食助手",
  "short_name": "一饭封神",
  "description": "AI驱动的智能菜谱生成器，让每一餐都成为封神之作",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fbbf24",
  "theme_color": "#f472b6",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/recipe-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["food", "lifestyle", "utilities"],
  "shortcuts": [
    {
      "name": "生成菜谱",
      "url": "/",
      "description": "快速生成新菜谱"
    },
    {
      "name": "美食盲盒",
      "url": "/today-eat",
      "description": "随机推荐美食"
    },
    {
      "name": "我的收藏",
      "url": "/favorites",
      "description": "查看收藏的菜谱"
    }
  ]
}
```
</details>

#### 1.2 生成应用图标

**需要的尺寸**:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 (标准)
- 192x192, 512x512 (maskable)
- 180x180 (Apple Touch Icon)

**方法一：使用在线工具**
```bash
# 访问 https://realfavicongenerator.net/
# 上传高清图标（至少 512x512）
# 下载生成的所有尺寸
# 解压到 public/icons/
```

**方法二：使用命令行工具**
```bash
# 安装 PWA Asset Generator
npm install -g pwa-asset-generator

# 生成所有尺寸（需要准备 icon-source.png）
pwa-asset-generator icon-source.png public/icons \
  --icon-only \
  --favicon \
  --maskable \
  --padding "10%"
```

**临时方案**（开发阶段）:
```bash
# 创建占位符图标
mkdir -p public/icons
# 使用现有logo或创建简单占位符
# 可以后续替换为设计图标
```

#### 1.3 修改 index.html

**文件**: `index.html`

在 `<head>` 中添加：

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- 主题颜色 -->
<meta name="theme-color" content="#f472b6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)">

<!-- iOS 特殊支持 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="一饭封神">
<link rel="apple-touch-icon" href="/icons/apple-icon-180.png">

<!-- Viewport 优化 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">

<!-- 性能优化 -->
<link rel="preconnect" href="https://openrouter.ai">
<link rel="dns-prefetch" href="https://openrouter.ai">
```

#### 1.4 实现 Service Worker

**文件**: `public/sw.js`

```bash
touch public/sw.js
```

<details>
<summary>完整Service Worker代码</summary>

```javascript
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `yifan-fengshen-${CACHE_VERSION}`

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 请求：网络优先
  if (url.pathname.startsWith('/api/') || url.hostname.includes('openrouter.ai')) {
    event.respondWith(networkFirst(request))
    return
  }

  // 图片：缓存优先，后台更新
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // 静态资源：缓存优先
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML：网络优先
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  // 默认：网络优先
  event.respondWith(networkFirst(request))
})

// 缓存策略

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    return new Response('Network Error', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}
```
</details>

#### 1.5 注册 Service Worker

**文件**: `src/main.ts`

在现有代码后添加：

```typescript
// Service Worker 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope)

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 发现新版本
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
```

### 验证步骤

#### 本地验证

```bash
# 1. 构建生产版本
npm run build

# 2. 预览生产版本
npm run preview

# 3. 打开 Chrome DevTools
# Application > Manifest - 检查manifest配置
# Application > Service Workers - 确认SW已注册
# Lighthouse > PWA审计 - 目标分数 > 90
```

#### 真机测试

**Android**:
1. 打开 Chrome 访问应用
2. 点击菜单 > "添加到主屏幕"
3. 确认图标和名称正确
4. 从主屏幕打开，确认独立窗口（无地址栏）

**iOS**:
1. 打开 Safari 访问应用
2. 点击分享按钮 > "添加到主屏幕"
3. 确认图标和名称正确
4. 从主屏幕打开

### 验收标准

- [ ] manifest.json 无语法错误
- [ ] 所有尺寸的图标文件存在
- [ ] Service Worker 成功注册
- [ ] Chrome DevTools 显示 PWA 可安装
- [ ] Lighthouse PWA 评分 ≥ 90
- [ ] 可以添加到主屏幕（Android + iOS）
- [ ] 独立窗口打开（无浏览器UI）
- [ ] 静态资源可离线访问

---

## 阶段 2: 底部导航系统 (2-3天)

### 目标
实现移动端底部Tab Bar导航，提升移动端用户体验

### 任务清单

#### 2.1 创建 TabItem 组件

**文件**: `src/components/TabItem.vue`

```bash
touch src/components/TabItem.vue
```

```vue
<template>
  <router-link
    :to="to"
    class="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
    :class="[
      active
        ? 'text-pink-500 scale-110'
        : 'text-gray-600 active:scale-95'
    ]"
    active-class="text-pink-500"
  >
    <span class="text-2xl mb-1">{{ icon }}</span>
    <span class="text-xs font-medium">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  to: string
  active?: boolean
}>()
</script>
```

#### 2.2 创建 BottomTabBar 组件

**文件**: `src/components/BottomTabBar.vue`

```bash
touch src/components/BottomTabBar.vue
```

```vue
<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 safe-area-bottom"
    role="navigation"
    aria-label="主导航"
  >
    <div class="flex justify-around items-center h-16">
      <TabItem
        v-for="item in navItems"
        :key="item.to"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
        :active="isActive(item.to)"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabItem from './TabItem.vue'

const route = useRoute()

const navItems = [
  { icon: '🏠', label: '生成', to: '/' },
  { icon: '🎲', label: '盲盒', to: '/today-eat' },
  { icon: '🍽️', label: '满汉', to: '/table-design' },
  { icon: '❤️', label: '收藏', to: '/favorites' }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
/* iOS 安全区域支持 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
```

#### 2.3 修改 App.vue

**文件**: `src/App.vue`

需要：
1. 添加底部导航组件
2. 为主内容区添加底部内边距（避免被导航遮挡）
3. 在移动端隐藏顶部导航，在桌面端显示

<details>
<summary>修改示例</summary>

在 `<template>` 中：

```vue
<template>
  <div class="app-container">
    <!-- 顶部导航 - 仅在桌面端显示 -->
    <GlobalNavigation class="hidden md:block" />

    <!-- 主内容区 - 移动端添加底部内边距 -->
    <main class="min-h-screen pb-0 md:pb-0 pb-20">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- 底部导航 - 仅在移动端显示 -->
    <BottomTabBar class="md:hidden" />

    <GlobalNoticeModal />
    <FloatingChefAssistant />
  </div>
</template>
```

在 `<script setup>` 中添加：

```typescript
import BottomTabBar from '@/components/BottomTabBar.vue'
```

在 `<style>` 中添加页面切换动画：

```css
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 左滑进入 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 上滑进入（用于详情页） */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}
```
</details>

#### 2.4 优化 GlobalNavigation.vue

**文件**: `src/components/GlobalNavigation.vue`

在移动端隐藏次要功能，只保留品牌logo和关键操作：

```vue
<!-- 移动端简化版 -->
<div class="md:hidden flex items-center justify-between px-4 py-3 border-b-2 border-black">
  <h1 class="text-xl font-bold">一饭封神</h1>
  <div class="flex gap-2">
    <!-- 只保留设置等关键按钮 -->
    <button class="p-2">⚙️</button>
  </div>
</div>

<!-- 桌面端完整版 -->
<div class="hidden md:flex">
  <!-- 原有的完整导航 -->
</div>
```

#### 2.5 配置路由过渡动画

**文件**: `src/router/index.ts`

为每个路由添加 `meta.transition`：

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/today-eat',
    name: 'TodayEat',
    component: () => import('@/views/TodayEat.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/table-design',
    name: 'TableDesign',
    component: () => import('@/views/TableDesign.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { transition: 'slide-left' }
  }
]
```

### 验证步骤

```bash
# 启动开发服务器
npm run dev

# 打开浏览器移动端模式
# Chrome DevTools > Toggle device toolbar (Cmd+Shift+M)
# 选择移动设备（iPhone 12 Pro / Pixel 5）
```

**检查项**:
1. 底部导航固定在底部
2. 4个Tab都能正确导航
3. 当前Tab有高亮效果
4. 点击响应快速（< 100ms）
5. 内容不被导航遮挡
6. iPhone X 刘海屏适配正确（safe-area-inset）

### 验收标准

- [ ] BottomTabBar组件创建并正常工作
- [ ] TabItem组件正确显示图标和文字
- [ ] 移动端显示底部导航，桌面端隐藏
- [ ] 当前路由Tab正确高亮
- [ ] 触摸目标大小 ≥ 44x44px
- [ ] iOS安全区域适配正确
- [ ] 页面切换动画流畅（60fps）
- [ ] 内容区不被导航遮挡

---

## 阶段 3: 主流程重构 - 分步表单 (3-5天)

### 目标
将Home.vue的菜谱生成流程改造为移动端友好的分步向导模式

### 任务清单

#### 3.1 创建 useWizard Composable

**文件**: `src/composables/useWizard.ts`

```bash
mkdir -p src/composables
touch src/composables/useWizard.ts
```

<details>
<summary>完整代码</summary>

```typescript
import { ref, computed } from 'vue'

export interface WizardStep {
  title: string
  icon: string
  validate?: () => boolean
}

export function useWizard(steps: WizardStep[]) {
  const currentStep = ref(0)

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === steps.length - 1)
  const progress = computed(() => ((currentStep.value + 1) / steps.length) * 100)

  const currentStepData = computed(() => steps[currentStep.value])

  const goNext = () => {
    if (!isLastStep.value) {
      // 验证当前步骤
      if (currentStepData.value.validate && !currentStepData.value.validate()) {
        return false
      }
      currentStep.value++
      return true
    }
    return false
  }

  const goPrev = () => {
    if (!isFirstStep.value) {
      currentStep.value--
      return true
    }
    return false
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      currentStep.value = step
    }
  }

  const reset = () => {
    currentStep.value = 0
  }

  return {
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    progress,
    goNext,
    goPrev,
    goToStep,
    reset
  }
}
```
</details>

#### 3.2 创建分步组件

**目录结构**:
```bash
mkdir -p src/views/wizard-steps
touch src/views/wizard-steps/StepIngredients.vue
touch src/views/wizard-steps/StepCuisine.vue
touch src/views/wizard-steps/StepConfirm.vue
```

##### StepIngredients.vue (步骤1: 选择食材)

<details>
<summary>完整代码</summary>

```vue
<template>
  <div class="step-ingredients p-4">
    <h2 class="text-2xl font-bold mb-6">选择食材</h2>

    <!-- 已选食材 -->
    <div v-if="modelValue.ingredients.length > 0" class="mb-6">
      <h3 class="text-sm text-gray-600 mb-2">已选食材 ({{ modelValue.ingredients.length }})</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(ingredient, index) in modelValue.ingredients"
          :key="index"
          class="px-4 py-2 bg-yellow-100 rounded-full border-2 border-black flex items-center gap-2"
        >
          <span>{{ ingredient }}</span>
          <button
            @click="removeIngredient(index)"
            class="text-red-500 font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="mb-6">
      <input
        v-model="newIngredient"
        type="text"
        placeholder="输入食材名称..."
        class="w-full px-4 py-3 text-lg border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
        @keyup.enter="addIngredient"
      />
      <button
        @click="addIngredient"
        :disabled="!newIngredient.trim()"
        class="w-full mt-3 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded-xl border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        添加食材
      </button>
    </div>

    <!-- 快速选择 -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-2">快速选择</h3>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in quickIngredients"
          :key="item"
          @click="quickAdd(item)"
          class="py-3 px-2 text-sm bg-white border-2 border-black rounded-xl active:scale-95 transition-transform"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <!-- 拍照识别 -->
    <button
      @click="$emit('photo-recognize')"
      class="w-full py-4 bg-white border-2 border-black rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
    >
      <span class="text-2xl">📷</span>
      <span>拍照识别食材</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
}

const props = defineProps<{
  modelValue: FormData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
  'photo-recognize': []
  'next': []
}>()

const newIngredient = ref('')

const quickIngredients = [
  '鸡肉', '猪肉', '牛肉', '鱼',
  '番茄', '土豆', '青椒', '洋葱',
  '胡萝卜', '白菜', '豆腐', '鸡蛋'
]

const addIngredient = () => {
  const ingredient = newIngredient.value.trim()
  if (ingredient && !props.modelValue.ingredients.includes(ingredient)) {
    emit('update:modelValue', {
      ...props.modelValue,
      ingredients: [...props.modelValue.ingredients, ingredient]
    })
    newIngredient.value = ''
  }
}

const removeIngredient = (index: number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ingredients: props.modelValue.ingredients.filter((_, i) => i !== index)
  })
}

const quickAdd = (ingredient: string) => {
  if (!props.modelValue.ingredients.includes(ingredient)) {
    emit('update:modelValue', {
      ...props.modelValue,
      ingredients: [...props.modelValue.ingredients, ingredient]
    })
  }
}
</script>
```
</details>

##### StepCuisine.vue (步骤2: 选择菜系)

<details>
<summary>完整代码</summary>

```vue
<template>
  <div class="step-cuisine p-4">
    <h2 class="text-2xl font-bold mb-6">选择菜系</h2>

    <!-- 菜系选择 -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">中华八大菜系</h3>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="cuisine in cuisines"
          :key="cuisine.name"
          @click="selectCuisine(cuisine.name)"
          :class="[
            'p-4 rounded-xl border-2 border-black transition-all active:scale-95',
            modelValue.cuisine === cuisine.name
              ? 'bg-gradient-to-br from-yellow-400 to-pink-400 text-white'
              : 'bg-white'
          ]"
        >
          <div class="text-3xl mb-2">{{ cuisine.icon }}</div>
          <div class="font-bold">{{ cuisine.name }}</div>
        </button>
      </div>
    </div>

    <!-- 自定义要求 -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">或自定义要求</h3>
      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="tag in customTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'px-4 py-2 rounded-full border-2 border-black transition-all',
            selectedTags.includes(tag)
              ? 'bg-pink-100 text-pink-700'
              : 'bg-white'
          ]"
        >
          {{ tag }}
        </button>
      </div>

      <textarea
        v-model="customInput"
        placeholder="其他要求（如：清淡健康、低卡路里...）"
        class="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
}

const props = defineProps<{
  modelValue: FormData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
}>()

const cuisines = [
  { name: '川菜', icon: '🌶️' },
  { name: '粤菜', icon: '🦐' },
  { name: '湘菜', icon: '🔥' },
  { name: '鲁菜', icon: '🥟' },
  { name: '苏菜', icon: '🍲' },
  { name: '浙菜', icon: '🐟' },
  { name: '闽菜', icon: '🦀' },
  { name: '徽菜', icon: '🍖' }
]

const customTags = ['清淡健康', '麻辣', '家常', '宴客', '快手菜', '低卡']
const selectedTags = ref<string[]>([])
const customInput = ref('')

const selectCuisine = (cuisine: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    cuisine
  })
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  updateCustomRequirements()
}

watch(customInput, () => {
  updateCustomRequirements()
})

const updateCustomRequirements = () => {
  const tags = selectedTags.value.join('、')
  const custom = customInput.value.trim()
  const requirements = [tags, custom].filter(Boolean).join('；')

  emit('update:modelValue', {
    ...props.modelValue,
    customRequirements: requirements
  })
}
</script>
```
</details>

##### StepConfirm.vue (步骤3: 确认生成)

<details>
<summary>完整代码</summary>

```vue
<template>
  <div class="step-confirm p-4">
    <h2 class="text-2xl font-bold mb-6">确认生成</h2>

    <!-- 配置预览 -->
    <div class="bg-white rounded-xl border-2 border-black p-6 mb-6">
      <div class="mb-4">
        <h3 class="text-sm text-gray-600 mb-2">食材</h3>
        <p class="text-lg">{{ modelValue.ingredients.join('、') }}</p>
      </div>

      <div class="mb-4">
        <h3 class="text-sm text-gray-600 mb-2">菜系</h3>
        <p class="text-lg">{{ modelValue.cuisine || '未选择' }}</p>
      </div>

      <div v-if="modelValue.customRequirements">
        <h3 class="text-sm text-gray-600 mb-2">特殊要求</h3>
        <p class="text-lg">{{ modelValue.customRequirements }}</p>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 mb-6">
      <p class="text-sm text-blue-800">
        💡 AI将根据您的选择生成3-5道菜谱建议，每道菜包含详细的食材清单和烹饪步骤。
      </p>
    </div>

    <!-- 生成选项 -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">生成选项</h3>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black mb-2">
        <input
          v-model="generateImages"
          type="checkbox"
          class="w-5 h-5"
        />
        <span>同时生成菜品图片</span>
      </label>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black">
        <input
          v-model="includeNutrition"
          type="checkbox"
          class="w-5 h-5"
        />
        <span>包含营养成分分析</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
}

defineProps<{
  modelValue: FormData
}>()

const generateImages = ref(true)
const includeNutrition = ref(false)
</script>
```
</details>

#### 3.3 重构 Home.vue

**文件**: `src/views/Home.vue`

需要完全重构为分步模式。

<details>
<summary>完整代码框架</summary>

```vue
<template>
  <div class="home-wizard min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
    <!-- 进度条 -->
    <div class="fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-black">
      <div class="h-1 bg-gray-200">
        <div
          class="h-full bg-gradient-to-r from-yellow-400 to-pink-400 transition-all duration-300"
          :style="{ width: `${wizard.progress.value}%` }"
        ></div>
      </div>
      <div class="px-4 py-3 flex items-center justify-between">
        <button
          v-if="!wizard.isFirstStep.value"
          @click="wizard.goPrev()"
          class="p-2 text-gray-600 active:scale-95"
        >
          ← 上一步
        </button>
        <h2 class="text-lg font-bold">
          {{ wizard.currentStepData.value.icon }}
          {{ wizard.currentStepData.value.title }}
          ({{ wizard.currentStep.value + 1 }}/{{ steps.length }})
        </h2>
        <div class="w-16"></div>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="pt-24 pb-28">
      <Transition name="slide-fade" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="wizard.currentStep.value"
          v-model="formData"
          @next="handleNext"
          @photo-recognize="handlePhotoRecognize"
        />
      </Transition>
    </div>

    <!-- 底部按钮 -->
    <div class="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent">
      <button
        v-if="!wizard.isLastStep.value"
        @click="handleNext"
        :disabled="!canProceed"
        class="w-full py-4 text-lg font-bold rounded-xl border-2 border-black transition-all active:scale-95"
        :class="canProceed
          ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
      >
        下一步 →
      </button>
      <button
        v-else
        @click="generateRecipes"
        :disabled="generating"
        class="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-xl border-2 border-black active:scale-95"
      >
        {{ generating ? '生成中...' : '🎯 开始生成菜谱' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWizard } from '@/composables/useWizard'
import StepIngredients from './wizard-steps/StepIngredients.vue'
import StepCuisine from './wizard-steps/StepCuisine.vue'
import StepConfirm from './wizard-steps/StepConfirm.vue'

const steps = [
  {
    title: '选择食材',
    icon: '📋',
    validate: () => formData.value.ingredients.length > 0
  },
  {
    title: '选择菜系',
    icon: '👨‍🍳',
    validate: () => formData.value.cuisine !== ''
  },
  {
    title: '确认生成',
    icon: '✨'
  }
]

const wizard = useWizard(steps)

const formData = ref({
  ingredients: [] as string[],
  cuisine: '',
  customRequirements: ''
})

const generating = ref(false)

const currentStepComponent = computed(() => {
  const components = [StepIngredients, StepCuisine, StepConfirm]
  return components[wizard.currentStep.value]
})

const canProceed = computed(() => {
  const step = steps[wizard.currentStep.value]
  return !step.validate || step.validate()
})

const handleNext = () => {
  wizard.goNext()
}

const handlePhotoRecognize = () => {
  // TODO: 实现拍照识别
  console.log('拍照识别食材')
}

const generateRecipes = async () => {
  generating.value = true
  try {
    // TODO: 调用AI生成API
    console.log('生成菜谱:', formData.value)
  } catch (error) {
    console.error('生成失败:', error)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
```
</details>

### 验证步骤

```bash
npm run dev

# 测试流程：
# 1. 打开主页
# 2. 验证分步流程显示正确
# 3. 尝试在未填写必填项时点"下一步"（应被阻止）
# 4. 填写完整流程并提交
# 5. 检查进度条动画
# 6. 检查步骤切换动画
```

### 验收标准

- [ ] useWizard composable 正常工作
- [ ] 3个分步组件正确显示
- [ ] 进度条准确显示进度
- [ ] 表单验证正常工作
- [ ] 步骤切换动画流畅
- [ ] 触摸目标足够大（≥44x44px）
- [ ] 移动端体验良好（无需滚动查看所有内容）

---

## 阶段 4-8 概要

由于篇幅限制，后续阶段将包含：

### 阶段 4: 卡片和详情优化
- RecipeCardCompact.vue
- RecipeDetail.vue (全屏详情页)
- 路由配置
- 图片懒加载

### 阶段 5: 手势和交互
- useSwipe.ts composable
- useLongPress.ts composable
- 触摸反馈优化
- 振动反馈

### 阶段 6: 性能优化
- 路由懒加载
- 组件异步加载
- 图片优化
- 虚拟滚动

### 阶段 7: 移动端特性
- PWA安装提示
- 原生分享API
- 相机调用
- 网络状态监测

### 阶段 8: 测试和优化
- 多设备测试
- 性能基准测试
- 问题修复
- 发布准备

---

## 🗂️ 关键文件清单

### 新建文件

```
public/
├── manifest.json                   # PWA manifest配置
├── sw.js                           # Service Worker
└── icons/                          # 应用图标
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── ...
    └── maskable-icon-512x512.png

src/
├── components/
│   ├── BottomTabBar.vue            # 底部导航栏
│   ├── TabItem.vue                 # Tab项组件
│   ├── RecipeCardCompact.vue       # 紧凑卡片
│   ├── InstallPrompt.vue           # 安装提示
│   └── ActionSheet.vue             # 操作面板
├── views/
│   ├── RecipeDetail.vue            # 菜谱详情页
│   └── wizard-steps/               # 分步组件
│       ├── StepIngredients.vue
│       ├── StepCuisine.vue
│       └── StepConfirm.vue
├── composables/
│   ├── useWizard.ts                # 分步向导
│   ├── useSwipe.ts                 # 滑动手势
│   ├── useLongPress.ts             # 长按手势
│   ├── useShare.ts                 # 原生分享
│   └── usePWAInstall.ts            # PWA安装
└── utils/
    └── haptics.ts                  # 振动反馈
```

### 修改文件

```
index.html                          # 添加PWA meta标签
src/main.ts                         # 注册Service Worker
src/App.vue                         # 添加底部导航
src/components/GlobalNavigation.vue # 移动端简化
src/views/Home.vue                  # 重构为分步模式
src/router/index.ts                 # 添加路由过渡
src/style.css                       # 触摸优化样式
```

---

## ✅ 验证检查清单

### 阶段 1 验证

- [ ] Lighthouse PWA 评分 ≥ 90
- [ ] 可添加到主屏幕（Android/iOS）
- [ ] Service Worker 成功注册
- [ ] 离线时静态资源可访问
- [ ] 独立窗口打开（无浏览器UI）

### 阶段 2 验证

- [ ] 底部导航在移动端显示
- [ ] 桌面端显示顶部导航
- [ ] 当前Tab正确高亮
- [ ] 页面切换动画流畅
- [ ] iOS刘海屏适配正确

### 阶段 3 验证

- [ ] 分步流程正常工作
- [ ] 进度条准确显示
- [ ] 表单验证生效
- [ ] 步骤切换动画流畅
- [ ] 触摸目标足够大

### 性能指标

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance > 90
- [ ] 打包体积 < 500KB (gzip)

---

## 📞 问题和反馈

实施过程中如遇到问题：

1. 检查浏览器控制台错误信息
2. 使用Chrome DevTools的Lighthouse审计
3. 参考PRD文档中的技术细节
4. 查看各阶段的验证步骤

---

**文档版本**: v1.0
**创建日期**: 2025-12-29
**预计完成时间**: 16-24天
**状态**: 🟢 Ready to Start
