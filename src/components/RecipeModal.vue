<template>
  <!-- 移动端: BottomSheet -->
  <BottomSheet
    v-if="isMobile"
    :model-value="true"
    @update:model-value="handleClose"
    size="large"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">菜谱详情</h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>
      <RecipeCard :recipe="recipe" :showFavoriteButton="false" />
    </div>
  </BottomSheet>

  <!-- 桌面端: 居中Modal (保留) -->
  <div
    v-else
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg border-2 border-[#0A0910] max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b-2 border-black p-4 flex items-center justify-between">
        <h3 class="text-lg font-bold">菜谱详情</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-xl">✕</button>
      </div>
      <div class="p-4">
        <RecipeCard :recipe="recipe" :showFavoriteButton="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import type { Recipe } from '@/types'
import RecipeCard from './RecipeCard.vue'
import BottomSheet from './ui/BottomSheet.vue'

const isMobile = useMediaQuery('(max-width: 768px)')

interface Props {
    recipe: Recipe
}

defineProps<Props>()

const emit = defineEmits<{
    close: []
}>()

const handleClose = (value: boolean) => {
  if (!value) {
    emit('close')
  }
}
</script>
