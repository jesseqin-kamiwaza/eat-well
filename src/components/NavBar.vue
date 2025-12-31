<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b-2 border-black transition-all duration-300"
    :class="{ 'shadow-md': isScrolled }"
  >
    <div class="safe-area-top"></div>
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Left: Back or Custom Action -->
      <div class="flex-shrink-0 w-10 flex items-center justify-start">
        <slot name="left">
          <button
            v-if="showBack"
            @click="handleBack"
            class="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="返回"
          >
            <span class="text-xl">←</span>
          </button>
        </slot>
      </div>

      <!-- Center: Title -->
      <div class="flex-1 flex items-center justify-center min-w-0 px-2">
        <slot name="title">
          <h1 class="text-lg font-bold truncate text-dark-800">{{ title }}</h1>
        </slot>
      </div>

      <!-- Right: Actions -->
      <div class="flex-shrink-0 w-10 flex items-center justify-end">
        <slot name="right"></slot>
      </div>
    </div>
  </header>
  <!-- Spacer to prevent content from hiding behind fixed header -->
  <div class="h-14 safe-area-top"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  title?: string
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const isScrolled = ref(false)

const handleBack = () => {
  if (props.showBack) {
    emit('back')
    if (!emit.length) { // If no listener, default to router back
        router.back()
    }
  }
}

const checkScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top);
  height: env(safe-area-inset-top);
}
</style>

