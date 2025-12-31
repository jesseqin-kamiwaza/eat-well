<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSwipe } from '@vueuse/core'

const props = defineProps<{
  modelValue: boolean
  size?: 'small' | 'medium' | 'large' | 'full'
  dismissible?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sheetRef = ref<HTMLElement | null>(null)

const heightMap = {
  small: '40vh',
  medium: '60vh',
  large: '80vh',
  full: '95vh'
}

// 使用@vueuse/core的useSwipe
const { lengthY } = useSwipe(sheetRef, {
  onSwipeEnd: (_e, dir) => {
    if (dir === 'down' && lengthY.value > 100 && props.dismissible !== false) {
      close()
    }
  }
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 阻止背景滚动
watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div v-if="modelValue" class="fixed inset-0 z-[100]">
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="dismissible !== false && close()"
        ></div>

        <!-- Sheet内容 -->
        <div
          ref="sheetRef"
          class="absolute bottom-0 left-0 right-0 bg-white
                 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-black
                 shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]
                 overflow-hidden flex flex-col touch-pan-y"
          :style="{ height: heightMap[size || 'medium'] }"
        >
          <!-- 拖拽手柄 -->
          <div class="flex justify-center py-3 border-b border-gray-200 flex-shrink-0">
            <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <!-- 内容区域 -->
          <div class="flex-1 overflow-y-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-sheet-enter-active > div:last-child,
.bottom-sheet-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from > div:last-child,
.bottom-sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
