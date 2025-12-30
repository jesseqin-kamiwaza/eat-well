<template>
  <div class="home-wizard min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
    <!-- Progress indicator -->
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
          class="p-2 text-gray-600 active:scale-95 transition-transform font-medium"
        >
          ← 上一步
        </button>
        <div v-else class="w-16"></div>
        <h2 class="text-base md:text-lg font-bold">
          {{ wizard.currentStepData.value.icon }}
          {{ wizard.currentStepData.value.title }}
          ({{ wizard.currentStep.value + 1 }}/{{ steps.length }})
        </h2>
        <div class="w-16"></div>
      </div>
    </div>

    <!-- Step content -->
    <div class="pt-24 pb-28 px-0 md:px-4 max-w-4xl mx-auto">
      <Transition name="slide-fade" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="wizard.currentStep.value"
          v-model="formData"
        />
      </Transition>
    </div>

    <!-- Bottom action buttons - fixed for mobile -->
    <div class="fixed bottom-20 md:bottom-4 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent z-30">
      <div class="max-w-4xl mx-auto">
        <button
          v-if="!wizard.isLastStep.value"
          @click="handleNext"
          :disabled="!canProceed"
          class="w-full py-4 text-lg font-bold rounded-xl border-2 border-black transition-all active:scale-95"
          :class="canProceed
            ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white hover:from-yellow-500 hover:to-pink-500'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
        >
          下一步 →
        </button>
        <button
          v-else
          @click="generateRecipes"
          :disabled="generating"
          class="w-full py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl border-2 border-black active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center gap-2 justify-center">
            <template v-if="generating">
              <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>生成中...</span>
            </template>
            <template v-else>
              <span class="text-xl">🎯</span>
              <span>开始生成菜谱</span>
            </template>
          </span>
        </button>
      </div>
    </div>

    <!-- Results section (shown after generation starts) -->
    <div v-if="showResults" ref="resultsSection" class="mt-8 px-4 pb-24 max-w-6xl mx-auto">
      <div class="bg-dark-800 text-white px-4 py-2 rounded-t-lg border-2 border-black border-b-0 inline-block">
        <span class="font-bold">生成结果</span>
      </div>
      <div class="bg-white border-2 border-black rounded-lg rounded-tl-none p-4 md:p-6">
        <!-- Loading state with cuisine slots -->
        <div v-if="generating || cuisineSlots.length > 0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="(cuisineInfo, index) in cuisineSlots"
              :key="cuisineInfo.id"
              class="border-2 border-black rounded-lg overflow-hidden"
              :class="cuisineInfo.recipe ? 'animate-fade-in-up' : ''"
              :style="cuisineInfo.recipe ? { animationDelay: `${index * 0.2}s` } : {}"
            >
              <!-- Recipe card (if generated) -->
              <RecipeCard v-if="cuisineInfo.recipe" :recipe="cuisineInfo.recipe" />

              <!-- Error state -->
              <div v-else-if="cuisineInfo.error" class="bg-white error-card">
                <div class="bg-gradient-to-r from-red-400 to-orange-400 text-white p-4 md:p-6 border-b-2 border-black">
                  <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
                    <span class="animate-bounce">😅</span>
                    {{ cuisineInfo.name }}不会这道菜
                  </h3>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="bg-white/20 px-2 py-1 rounded text-xs">{{ cuisineInfo.name }}</span>
                    <span>技能点不够</span>
                  </div>
                </div>
                <div class="p-4 md:p-6 text-center">
                  <p class="text-gray-600 text-sm mb-4">大师表示这个组合有点难度...</p>
                  <button
                    @click="retryFailedCuisine(cuisineInfo)"
                    class="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm border-2 border-black transition-all"
                  >
                    🔄 再试一次
                  </button>
                </div>
              </div>

              <!-- Loading state -->
              <div v-else class="bg-white loading-card">
                <div class="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-4 md:p-6 border-b-2 border-black">
                  <h3 class="text-lg font-bold mb-1">
                    <span class="animate-pulse">👨‍🍳</span>
                    {{ cuisineInfo.name }}创作中...
                  </h3>
                  <div class="text-sm">
                    <span class="animate-spin">⏱️</span>
                    预计10-20秒
                  </div>
                </div>
                <div class="p-4 md:p-6">
                  <div class="text-center py-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-dashed border-orange-200">
                    <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-gray-600 text-sm mb-3">{{ cuisineInfo.loadingText || '正在创作中...' }}</p>
                    <div class="max-w-xs mx-auto">
                      <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          class="bg-gradient-to-r from-orange-400 to-yellow-500 h-3 rounded-full transition-all duration-1000"
                          :style="{ width: cuisineInfo.progress + '%' }"
                        ></div>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">{{ Math.round(cuisineInfo.progress) }}% 完成</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="recipes.length === 0 && !errorMessage" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-gray-400 text-2xl">⭐</span>
          </div>
          <h3 class="text-xl font-bold text-gray-400 mb-2">准备开始生成...</h3>
          <p class="text-gray-500">完成配置后点击生成按钮</p>
        </div>

        <!-- Error state -->
        <div v-else-if="errorMessage" class="text-center py-12">
          <div class="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span class="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 class="text-xl font-bold text-red-600 mb-2">生成失败</h3>
          <p class="text-red-500 mb-4">{{ errorMessage }}</p>
          <button
            @click="generateRecipes"
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium border-2 border-black transition-all"
          >
            🔄 重新生成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWizard } from '@/composables/useWizard'
import StepIngredients from './wizard-steps/StepIngredients.vue'
import StepCuisine from './wizard-steps/StepCuisine.vue'
import StepConfirm from './wizard-steps/StepConfirm.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { cuisines as allCuisines } from '@/config/cuisines'
import { generateCustomRecipe, generateMultipleRecipesStream, generateRecipe } from '@/services/aiService'
import type { Recipe } from '@/types'

// Wizard steps definition
const steps = [
  {
    title: '选择食材',
    icon: '📋',
    validate: () => formData.value.ingredients.length > 0
  },
  {
    title: '选择菜系',
    icon: '👨‍🍳'
  },
  {
    title: '确认生成',
    icon: '✨'
  }
]

const wizard = useWizard(steps)

// Form data
const formData = ref({
  ingredients: [] as string[],
  cuisine: '',
  customRequirements: '',
  selectedCuisines: [] as string[]
})

// Generation state
const generating = ref(false)
const showResults = ref(false)
const recipes = ref<Recipe[]>([])
const errorMessage = ref('')
const resultsSection = ref<HTMLElement | null>(null)

// Cuisine slots for streaming generation
interface CuisineSlot {
  id: string
  name: string
  recipe?: Recipe
  loadingText: string
  progress: number
  error?: boolean
  errorMessage?: string
}
const cuisineSlots = ref<CuisineSlot[]>([])

// Current step component
const currentStepComponent = computed(() => {
  const components = [StepIngredients, StepCuisine, StepConfirm]
  return components[wizard.currentStep.value]
})

// Can proceed to next step
const canProceed = computed(() => {
  const step = steps[wizard.currentStep.value]
  return !step.validate || step.validate()
})

// Handle next step
const handleNext = () => {
  wizard.goNext()
}

// Generate recipes
const generateRecipes = async () => {
  if (formData.value.ingredients.length === 0) {
    return
  }

  // Reset state
  generating.value = true
  showResults.value = true
  recipes.value = []
  cuisineSlots.value = []
  errorMessage.value = ''

  // Scroll to results
  setTimeout(() => {
    if (resultsSection.value) {
      resultsSection.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, 100)

  try {
    if (formData.value.customRequirements.trim()) {
      // Custom requirements generation
      cuisineSlots.value = [
        {
          id: 'custom',
          name: '自定义大师',
          loadingText: '正在根据您的要求创作...',
          progress: 0
        }
      ]

      const progressInterval = setInterval(() => {
        if (cuisineSlots.value[0] && !cuisineSlots.value[0].recipe) {
          cuisineSlots.value[0].progress = Math.min(cuisineSlots.value[0].progress + Math.random() * 15, 90)
        }
      }, 500)

      const customRecipe = await generateCustomRecipe(formData.value.ingredients, formData.value.customRequirements.trim())

      if (cuisineSlots.value[0]) {
        cuisineSlots.value[0].recipe = customRecipe
        cuisineSlots.value[0].progress = 100
        cuisineSlots.value[0].loadingText = '创作完成！'
      }
      recipes.value = [customRecipe]
      generating.value = false
      clearInterval(progressInterval)
    } else {
      // Cuisine-based generation
      let selectedCuisineObjects = allCuisines.filter(c => formData.value.selectedCuisines.includes(c.id))

      if (selectedCuisineObjects.length === 0) {
        // Random selection
        const shuffled = [...allCuisines].sort(() => 0.5 - Math.random())
        selectedCuisineObjects = shuffled.slice(0, 2)
      }

      // Initialize cuisine slots
      cuisineSlots.value = selectedCuisineObjects.map(cuisine => ({
        id: cuisine.id,
        name: cuisine.name,
        loadingText: `${cuisine.name}正在精心创作...`,
        progress: 0
      }))

      // Start progress animations
      const progressIntervals: NodeJS.Timeout[] = []
      cuisineSlots.value.forEach((slot, index) => {
        const interval = setInterval(() => {
          if (!slot.recipe && !slot.error) {
            slot.progress = Math.min(slot.progress + Math.random() * 10, 85)
            const texts = [`${slot.name}正在挑选食材...`, `${slot.name}正在调配秘制酱料...`, `${slot.name}正在掌控火候...`]
            slot.loadingText = texts[Math.floor(Math.random() * texts.length)]
          }
        }, 800 + index * 200)
        progressIntervals.push(interval)
      })

      // Stream generation
      await generateMultipleRecipesStream(
        formData.value.ingredients,
        selectedCuisineObjects,
        (recipe: Recipe, index: number, total: number) => {
          const targetSlot = cuisineSlots.value.find(slot => selectedCuisineObjects[index] && slot.id === selectedCuisineObjects[index].id)

          if (targetSlot) {
            targetSlot.recipe = recipe
            targetSlot.progress = 100
            targetSlot.loadingText = '创作完成！'
          }

          recipes.value.push(recipe)

          const completedCount = recipes.value.length + cuisineSlots.value.filter(slot => slot.error).length
          if (completedCount === total) {
            generating.value = false
            progressIntervals.forEach(interval => clearInterval(interval))
          }
        },
        (error: Error, index: number, _cuisine, total: number) => {
          const targetSlot = cuisineSlots.value.find(slot => selectedCuisineObjects[index] && slot.id === selectedCuisineObjects[index].id)

          if (targetSlot) {
            targetSlot.error = true
            targetSlot.errorMessage = error.message
            targetSlot.progress = 0
            targetSlot.loadingText = '生成失败'
          }

          const completedCount = recipes.value.length + cuisineSlots.value.filter(slot => slot.error).length
          if (completedCount === total) {
            generating.value = false
            progressIntervals.forEach(interval => clearInterval(interval))
          }
        }
      )

      progressIntervals.forEach(interval => clearInterval(interval))
    }
  } catch (error) {
    console.error('生成菜谱失败:', error)
    errorMessage.value = error instanceof Error ? error.message : 'AI生成菜谱失败，请稍后重试'
    generating.value = false
  }
}

// Retry failed cuisine
const retryFailedCuisine = async (failedSlot: CuisineSlot) => {
  failedSlot.error = false
  failedSlot.errorMessage = undefined
  failedSlot.progress = 0
  failedSlot.loadingText = '大师重新思考中...'

  const cuisine = allCuisines.find(c => c.id === failedSlot.id)
  if (!cuisine) return

  const progressInterval = setInterval(() => {
    if (!failedSlot.recipe && !failedSlot.error) {
      failedSlot.progress = Math.min(failedSlot.progress + Math.random() * 10, 85)
    }
  }, 500)

  try {
    const delay = 1000 + Math.random() * 2000
    await new Promise(resolve => setTimeout(resolve, delay))

    const recipe = formData.value.customRequirements.trim()
      ? await generateCustomRecipe(formData.value.ingredients, formData.value.customRequirements.trim())
      : await generateRecipe(formData.value.ingredients, cuisine, formData.value.customRequirements.trim() || undefined)

    failedSlot.recipe = recipe
    failedSlot.progress = 100
    failedSlot.loadingText = '重新创作完成！'
    recipes.value.push(recipe)
    clearInterval(progressInterval)
  } catch (error) {
    console.error(`重试${cuisine.name}菜谱失败:`, error)
    failedSlot.error = true
    failedSlot.errorMessage = error instanceof Error ? error.message : `${cuisine.name}还是不会这道菜`
    failedSlot.progress = 0
    failedSlot.loadingText = '重试失败'
    clearInterval(progressInterval)
  }
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(249, 115, 22, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.6);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.loading-card {
  animation: pulse-glow 2s ease-in-out infinite;
}

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
