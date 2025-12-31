<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SearchHeader from '@/components/SearchHeader.vue'
import FilterChips from '@/components/FilterChips.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { generateRecipe } from '@/services/aiService'
import { cuisines } from '@/config/cuisines'
import type { Recipe, CuisineType } from '@/types'

const router = useRouter()

// 状态管理
const generating = ref(false)
const recipes = ref<Recipe[]>([])
const activeFilters = ref<string[]>([])
const errorMessage = ref('')

// 食材管理
const selectedIngredients = ref<string[]>([])
const currentIngredient = ref('')

// 常用食材列表
const commonIngredients = [
  '猪肉', '鸡肉', '牛肉', '鸡蛋',
  '青菜', '土豆', '西红柿', '豆腐',
  '白菜', '胡萝卜', '洋葱', '大蒜'
]

// 处理筛选器变化
const handleFilterChange = (filters: string[]) => {
  activeFilters.value = filters
  console.log('Active filters:', filters)
}

// 添加食材
const addIngredient = () => {
  const ingredient = currentIngredient.value.trim()
  if (ingredient && !selectedIngredients.value.includes(ingredient)) {
    selectedIngredients.value.push(ingredient)
    currentIngredient.value = ''
  }
}

// 移除食材
const removeIngredient = (index: number) => {
  selectedIngredients.value.splice(index, 1)
}

// 快捷添加食材
const quickAddIngredient = (ingredient: string) => {
  if (!selectedIngredients.value.includes(ingredient)) {
    selectedIngredients.value.push(ingredient)
  }
}

// 根据食材生成菜谱
const handleGenerateWithIngredients = async () => {
  if (selectedIngredients.value.length === 0) return

  generating.value = true
  errorMessage.value = ''

  try {
    // 选择默认菜系（家常菜）
    const cuisineType: CuisineType = cuisines.find((c: CuisineType) => c.id === 'home-cooking') || cuisines[0]

    // 构建自定义提示词
    let customPrompt = `使用这些食材: ${selectedIngredients.value.join('、')}`

    // 添加筛选条件
    if (activeFilters.value.length > 0) {
      customPrompt += `\n要求：${activeFilters.value.join('、')}`
    }

    // 调用AI生成菜谱
    const recipe = await generateRecipe(
      selectedIngredients.value,
      cuisineType,
      customPrompt
    )

    // 添加菜系信息
    recipe.cuisine = cuisineType.name

    // 更新菜谱列表
    recipes.value = [recipe]

    // 滚动到结果
    setTimeout(() => {
      const resultsEl = document.getElementById('recipe-results')
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } catch (error) {
    console.error('生成菜谱失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '生成菜谱失败,请重试'
  } finally {
    generating.value = false
  }
}

// 重新生成
const handleRegenerate = () => {
  if (selectedIngredients.value.length > 0) {
    handleGenerateWithIngredients()
  }
}

// 清除结果
const clearResults = () => {
  recipes.value = []
  selectedIngredients.value = []
  currentIngredient.value = ''
  errorMessage.value = ''
}

// 跳转到高级模式(旧版wizard)
const goToAdvancedMode = () => {
  router.push('/home-wizard')
}

// 计算是否显示结果区域
const hasResults = computed(() => recipes.value.length > 0)

// 页面加载时的欢迎提示
const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) return '早上好! 开始今天的美味旅程吧 ☀️'
  if (hour >= 9 && hour < 12) return '上午好! 准备做点什么好吃的? 🍳'
  if (hour >= 12 && hour < 14) return '午餐时间! 看看有什么想吃的 🍱'
  if (hour >= 14 && hour < 17) return '下午好! 为晚餐做点准备吧 ☕'
  if (hour >= 17 && hour < 20) return '晚上好! 今天吃什么呢? 🌆'
  return '夜深了,来点夜宵如何? 🌙'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 pb-20">
    <!-- 搜索头部 -->
    <SearchHeader />

    <!-- 快速筛选 -->
    <FilterChips @change="handleFilterChange" />

    <!-- 欢迎消息 -->
    <div v-if="!hasResults && !generating" class="px-4 pt-6 pb-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">
        {{ welcomeMessage }}
      </h1>
      <p class="text-sm text-gray-600">
        告诉我你有什么食材，AI 为你定制专属菜谱
      </p>
    </div>

    <!-- 食材输入区域 - 核心功能 -->
    <div v-if="!generating && !hasResults" class="px-4 py-6">
      <div class="card-brutal p-6 bg-white">
        <!-- 标题 -->
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🥬</span>
          <h2 class="text-lg font-bold text-gray-800">我有这些食材</h2>
        </div>

        <!-- 食材输入框 -->
        <div class="mb-4">
          <div class="flex gap-2">
            <input
              v-model="currentIngredient"
              @keyup.enter="addIngredient"
              type="text"
              placeholder="输入食材（如：猪肉、鸡蛋、青菜）"
              class="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-base
                     focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
            />
            <button
              @click="addIngredient"
              class="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg
                     border-2 border-black active:scale-95 transition-all"
            >
              ➕
            </button>
          </div>

          <!-- 已添加的食材 -->
          <div v-if="selectedIngredients.length > 0" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="(ingredient, index) in selectedIngredients"
              :key="index"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-gray-800 rounded-full text-sm font-medium border-2 border-yellow-300"
            >
              {{ ingredient }}
              <button
                @click="removeIngredient(index)"
                class="text-gray-600 hover:text-red-600 font-bold"
              >
                ✕
              </button>
            </span>
          </div>
        </div>

        <!-- 常用食材快捷按钮 -->
        <div class="mb-4">
          <div class="text-xs text-gray-600 mb-2">常用食材：</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ingredient in commonIngredients"
              :key="ingredient"
              @click="quickAddIngredient(ingredient)"
              :disabled="selectedIngredients.includes(ingredient)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                selectedIngredients.includes(ingredient)
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 active:scale-95'
              ]"
            >
              {{ ingredient }}
            </button>
          </div>
        </div>

        <!-- 生成按钮 -->
        <button
          @click="handleGenerateWithIngredients"
          :disabled="selectedIngredients.length === 0"
          class="w-full py-4 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded-xl
                 border-2 border-black shadow-brutal-lg
                 hover:shadow-brutal-md active:shadow-brutal-sm
                 active:translate-x-[2px] active:translate-y-[2px]
                 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal-lg"
        >
          <span v-if="selectedIngredients.length === 0">请先添加食材</span>
          <span v-else>✨ 开始生成菜谱（{{ selectedIngredients.length }}种食材）</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="generating" class="px-4 py-12">
      <div class="card-brutal p-8 text-center">
        <div class="animate-spin text-6xl mb-4">🍳</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">AI 大厨正在烹饪...</h3>
        <p class="text-sm text-gray-600">
          根据 {{ selectedIngredients.length }} 种食材生成专属菜谱
        </p>
        <div class="mt-3 flex flex-wrap justify-center gap-2">
          <span
            v-for="ingredient in selectedIngredients"
            :key="ingredient"
            class="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs"
          >
            {{ ingredient }}
          </span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage && !generating" class="px-4 py-4">
      <div class="bg-red-50 border-2 border-red-500 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div class="flex-1">
            <h4 class="font-bold text-red-800 mb-1">生成失败</h4>
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>
        </div>
        <button
          @click="handleRegenerate"
          class="mt-3 btn-secondary w-full"
        >
          重试
        </button>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div v-if="hasResults && !generating" id="recipe-results" class="px-4 py-6">
      <!-- 结果头部 -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800">
          为你推荐 - 基于你的食材
        </h2>
        <div class="flex gap-2">
          <button
            @click="handleRegenerate"
            class="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            换一个
          </button>
          <button
            @click="clearResults"
            class="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            清除
          </button>
        </div>
      </div>

      <!-- 菜谱卡片 -->
      <div class="space-y-4">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>

      <!-- 更多操作 -->
      <div class="mt-6 flex gap-3">
        <button
          @click="handleRegenerate"
          class="flex-1 btn-secondary"
        >
          🔄 再来一个
        </button>
        <button
          @click="clearResults"
          class="flex-1 btn-secondary"
        >
          ✨ 重新选择
        </button>
      </div>
    </div>

    <!-- 食材识别入口 (折叠) -->
    <div v-if="!hasResults && !generating" class="px-4 py-6">
      <details class="card-brutal overflow-hidden">
        <summary class="p-4 cursor-pointer font-medium flex items-center justify-between hover:bg-gray-50">
          <span class="flex items-center gap-2">
            <span class="text-2xl">📷</span>
            <span>拍照识别食材</span>
          </span>
          <span class="text-gray-400">▼</span>
        </summary>
        <div class="p-4 border-t-2 border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-600 mb-3">
            上传冰箱照片,AI 识别食材,智能推荐菜谱
          </p>
          <button
            @click="router.push('/camera')"
            class="btn-secondary w-full"
          >
            打开相机
          </button>
        </div>
      </details>
    </div>

    <!-- 高级选项 (wizard模式入口) -->
    <div v-if="!hasResults && !generating" class="px-4 pb-6">
      <button
        @click="goToAdvancedMode"
        class="w-full text-sm text-gray-500 hover:text-gray-700 underline py-2"
      >
        使用高级模式 (3步精确配置) →
      </button>
    </div>
  </div>
</template>
