<template>
  <div class="recipe-detail fixed inset-0 bg-white z-50 overflow-y-auto">
    <!-- Top navigation -->
    <header class="sticky top-0 bg-white/95 backdrop-blur-sm border-b-2 border-black z-10">
      <div class="flex items-center justify-between px-4 py-3">
        <button
          @click="handleBack"
          class="p-2 active:scale-95 transition-transform flex items-center gap-1 font-medium text-gray-700"
        >
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-base md:text-lg font-bold truncate max-w-[50%]">{{ recipe?.name || '菜谱详情' }}</h1>
        <button
          @click="showMenu = true"
          class="p-2 active:scale-95 transition-transform text-gray-700"
        >
          ⋮
        </button>
      </div>
    </header>

    <div v-if="recipe" class="pb-24">
      <!-- Main image -->
      <div class="relative h-64 bg-gradient-to-br from-yellow-200 to-pink-200">
        <!-- Image placeholder - can be integrated with image generation service later -->
        <div class="w-full h-full flex items-center justify-center text-6xl">
          🍳
        </div>
        <!-- Floating tags -->
        <div class="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <span class="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium border-2 border-black">
            {{ recipe.cuisine }}
          </span>
          <span class="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm border-2 border-black">
            ⏱️ {{ formatTime(recipe.cookingTime) }}
          </span>
          <span class="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm border-2 border-black">
            {{ difficultyText }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-6">
        <!-- Ingredients -->
        <section class="mb-8">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>食材清单</span>
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(ingredient, index) in recipe.ingredients"
              :key="index"
              class="px-4 py-2.5 bg-yellow-50 rounded-lg border-2 border-yellow-400 text-sm font-medium"
            >
              {{ ingredient }}
            </div>
          </div>
        </section>

        <!-- Steps -->
        <section class="mb-8">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👨‍🍳</span>
            <span>烹饪步骤</span>
          </h2>
          <div class="space-y-4">
            <div
              v-for="(step, index) in recipe.steps"
              :key="index"
              class="flex gap-3"
            >
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 text-white flex items-center justify-center font-bold text-sm border-2 border-black">
                {{ step.step }}
              </div>
              <div class="flex-1 pt-0.5">
                <p class="text-gray-800 mb-2">{{ step.description }}</p>
                <div v-if="step.time || step.temperature" class="flex gap-2 text-xs text-gray-600">
                  <span v-if="step.time" class="bg-gray-100 px-2 py-1 rounded border border-gray-300">
                    ⏱️ {{ formatTime(step.time) }}
                  </span>
                  <span v-if="step.temperature" class="bg-gray-100 px-2 py-1 rounded border border-gray-300">
                    🌡️ {{ step.temperature }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Tips -->
        <section v-if="recipe.tips && recipe.tips.length > 0" class="mb-8">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>烹饪技巧</span>
          </h2>
          <div class="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <ul class="space-y-2">
              <li
                v-for="(tip, index) in recipe.tips"
                :key="index"
                class="flex items-start gap-2 text-gray-700"
              >
                <span class="text-blue-500 mt-1">•</span>
                <span class="text-sm">{{ tip }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Nutrition Analysis -->
        <section v-if="recipe.nutritionAnalysis">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>营养分析</span>
          </h2>
          <NutritionAnalysis :nutritionAnalysis="recipe.nutritionAnalysis" />
        </section>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- Bottom action bar -->
    <footer v-if="recipe" class="fixed bottom-20 md:bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 safe-area-bottom z-20">
      <div class="max-w-4xl mx-auto flex gap-3">
        <FavoriteButton :recipe="recipe" class="flex-1" large />
        <button
          @click="shareRecipe"
          class="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-white font-bold rounded-xl border-2 border-black active:scale-95 transition-all"
        >
          <span class="flex items-center justify-center gap-2">
            <span>📤</span>
            <span>分享</span>
          </span>
        </button>
      </div>
    </footer>

    <!-- Action menu -->
    <Transition name="fade">
      <div
        v-if="showMenu"
        class="fixed inset-0 bg-black/50 z-50 flex items-end"
        @click="showMenu = false"
      >
        <div
          class="w-full bg-white rounded-t-2xl border-2 border-black p-4 safe-area-bottom"
          @click.stop
        >
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div class="space-y-2">
            <button
              @click="regenerateImage"
              class="w-full p-4 text-left hover:bg-gray-50 rounded-lg active:scale-95 transition-all flex items-center gap-3"
            >
              <span class="text-2xl">🖼️</span>
              <span class="font-medium">重新生成图片</span>
            </button>
            <button
              @click="showMenu = false"
              class="w-full p-4 text-left text-gray-600 hover:bg-gray-50 rounded-lg active:scale-95 transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NutritionAnalysis from '@/components/NutritionAnalysis.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import type { Recipe } from '@/types'

const route = useRoute()
const router = useRouter()

const recipe = ref<Recipe | null>(null)
const showMenu = ref(false)

// Load recipe on mount
onMounted(() => {
  // Get recipe from route state (passed from RecipeCard)
  if (window.history.state.recipe) {
    recipe.value = window.history.state.recipe as Recipe
  }

  // If not found, try to get from localStorage
  if (!recipe.value) {
    const recipeId = route.params.id as string
    const stored = localStorage.getItem(`recipe_${recipeId}`)
    if (stored) {
      try {
        recipe.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored recipe:', e)
      }
    }
  }

  // If still not found, redirect back
  if (!recipe.value) {
    router.back()
  }
})

// Computed properties
const difficultyText = computed(() => {
  if (!recipe.value) return ''
  const map: Record<string, string> = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难',
    '简单': '简单',
    '中等': '中等',
    '困难': '困难'
  }
  return map[recipe.value.difficulty] || recipe.value.difficulty
})

// Methods
const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

const handleBack = () => {
  router.back()
}

const shareRecipe = async () => {
  if (!recipe.value) return

  const shareData = {
    title: recipe.value.name,
    text: `${recipe.value.name} - ${recipe.value.cuisine}\n烹饪时间: ${formatTime(recipe.value.cookingTime)}\n难度: ${difficultyText.value}`,
    url: window.location.href
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.log('Share cancelled or failed:', error)
    }
  } else {
    // Fallback: copy to clipboard
    const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`
    navigator.clipboard.writeText(text).then(() => {
      alert('链接已复制到剪贴板')
    })
  }
}

const regenerateImage = () => {
  showMenu.value = false
  alert('图片生成功能开发中...')
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
