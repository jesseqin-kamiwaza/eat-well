<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Recipe } from '@/types'
import FavoriteButton from '@/components/FavoriteButton.vue'

const props = defineProps<{
  recipe: Recipe
  showFavoriteButton?: boolean
}>()

const router = useRouter()

const difficultyText = computed(() => {
  const map = { easy: '简单', medium: '中等', hard: '困难' }
  return map[props.recipe.difficulty] || '未知'
})

// 根据菜系返回 emoji
const getCuisineEmoji = (cuisine: string): string => {
  if (cuisine.includes('川')) return '🌶️'
  if (cuisine.includes('粤')) return '🥘'
  if (cuisine.includes('鲁')) return '🍖'
  if (cuisine.includes('苏')) return '🦐'
  if (cuisine.includes('浙')) return '🐟'
  if (cuisine.includes('闽')) return '🦀'
  if (cuisine.includes('湘')) return '🌶️'
  if (cuisine.includes('徽')) return '🥩'
  return '🍽️'
}

const handleViewDetail = () => {
  // Store recipe temporarily
  localStorage.setItem(`recipe_${props.recipe.id}`, JSON.stringify(props.recipe))

  // Navigate to recipe detail
  router.push(`/recipe/${props.recipe.id}`)
}

const shareRecipe = () => {
  // TODO: 实现分享功能
  if (navigator.share) {
    navigator.share({
      title: props.recipe.name,
      text: `${props.recipe.name} - ${props.recipe.cuisine}`,
      url: window.location.href
    })
  }
}
</script>

<template>
  <div class="recipe-card-v2 group cursor-pointer card-brutal overflow-hidden">
    <!-- 4:3大图区域 -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <!-- 暂无图片,显示占位符 -->
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-pink-100">
        <div class="text-center">
          <div class="text-6xl mb-2">{{ getCuisineEmoji(recipe.cuisine) }}</div>
          <div class="text-sm text-gray-600 font-medium">{{ recipe.name }}</div>
        </div>
      </div>

      <!-- 悬浮收藏按钮 - 右上角 -->
      <div
        v-if="showFavoriteButton !== false"
        class="absolute top-3 right-3"
      >
        <FavoriteButton
          :recipe="recipe"
          class="!bg-white/90 backdrop-blur-sm border-2 border-black
                 hover:!bg-white active:scale-95 transition-all"
        />
      </div>

      <!-- 标签组 - 左下角 -->
      <div class="absolute bottom-3 left-3 flex gap-2">
        <span class="px-2 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
          {{ recipe.cuisine }}
        </span>
        <span
          v-if="recipe.cookingTime <= 30"
          class="px-2 py-1 bg-yellow-400/90 text-black rounded-full text-xs font-medium"
        >
          ⚡快手
        </span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-4">
      <h3 class="font-bold text-lg mb-2 line-clamp-2">{{ recipe.name }}</h3>

      <!-- Meta信息行 - 横向排列 -->
      <div class="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <span>⏱️ {{ recipe.cookingTime }}分钟</span>
        <span class="text-gray-300">•</span>
        <span>🔥 {{ difficultyText }}</span>
      </div>

      <!-- 操作栏 -->
      <div class="flex gap-2">
        <button
          @click="handleViewDetail"
          class="flex-1 btn-primary text-sm py-2"
        >
          查看菜谱
        </button>
        <button
          @click.stop="shareRecipe"
          class="px-3 py-2 bg-white border-2 border-black rounded-lg
                 hover:bg-gray-50 active:scale-95 transition-all"
        >
          ↗️
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
