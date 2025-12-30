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
/* iOS safe area support */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
