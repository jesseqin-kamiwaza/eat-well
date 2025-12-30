<template>
    <div id="app" class="min-h-screen">
        <!-- Main content area - add bottom padding on mobile to avoid bottom nav overlap -->
        <main class="pb-0 md:pb-0 min-h-screen" :class="{ 'pb-20': showBottomNav }">
            <router-view v-slot="{ Component, route }">
                <Transition :name="route.meta.transition || 'fade'" mode="out-in">
                    <component :is="Component" :key="route.path" />
                </Transition>
            </router-view>
        </main>

        <!-- Bottom navigation - mobile only -->
        <BottomTabBar v-if="showBottomNav" class="md:hidden" />

        <!-- <FloatingDonation /> -->
        <GlobalNoticeModal />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomTabBar from './components/BottomTabBar.vue'
import GlobalNoticeModal from './components/GlobalNoticeModal.vue'

const route = useRoute()

// Show bottom nav on main pages only
const showBottomNav = computed(() => {
  const mainPaths = ['/', '/today-eat', '/table-design', '/favorites']
  return mainPaths.includes(route.path)
})
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide left transition */
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

/* Slide up transition (for detail pages) */
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
</style>
