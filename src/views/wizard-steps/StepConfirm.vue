<template>
  <div class="step-confirm p-4">
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
        <span class="text-white text-2xl">👨‍🍳</span>
      </div>
      <h2 class="text-2xl font-bold text-dark-800 mb-2">准备开始烹饪</h2>
      <p class="text-gray-600 text-sm">大师已准备就绪，确认配置后即可开始创作</p>
    </div>

    <!-- Configuration preview -->
    <div class="bg-white rounded-xl border-2 border-black p-4 md:p-6 mb-6">
      <h3 class="font-bold text-lg text-dark-800 mb-4 flex items-center gap-2">
        <span>📋</span>
        <span>当前配置</span>
      </h3>

      <!-- Ingredients list -->
      <div class="mb-4">
        <span class="text-sm font-medium text-gray-600">食材 ({{ modelValue.ingredients.length }})：</span>
        <div v-if="modelValue.ingredients.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="ingredient in modelValue.ingredients"
            :key="ingredient"
            class="inline-block bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium border-2 border-yellow-400"
          >
            {{ ingredient }}
          </span>
        </div>
        <span v-else class="text-sm text-gray-400">未添加食材</span>
      </div>

      <!-- Cuisines and masters -->
      <div class="mb-4">
        <span class="text-sm font-medium text-gray-600">
          菜系大师 {{ modelValue.selectedCuisines && modelValue.selectedCuisines.length > 0 ? `(${modelValue.selectedCuisines.length})` : '' }}：
        </span>
        <div v-if="modelValue.selectedCuisines && modelValue.selectedCuisines.length > 0 && !modelValue.customRequirements.trim()" class="mt-2">
          <div
            v-for="cuisineId in modelValue.selectedCuisines"
            :key="cuisineId"
            class="inline-flex items-center gap-1 bg-green-200 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium mr-2 mb-2 border-2 border-green-400"
          >
            <span>{{ getCuisineById(cuisineId)?.avatar || '👨‍🍳' }}</span>
            <span>{{ getCuisineById(cuisineId)?.name }}</span>
          </div>
        </div>
        <span v-else-if="!modelValue.customRequirements.trim()" class="text-sm text-gray-400 block mt-2">
          未选择（将随机推荐2个菜系）
        </span>
        <span v-else class="text-sm text-blue-600 block mt-2">✨ 使用自定义要求</span>
      </div>

      <!-- Custom requirements -->
      <div v-if="modelValue.customRequirements.trim()">
        <span class="text-sm font-medium text-gray-600">自定义要求：</span>
        <p class="text-sm text-blue-700 mt-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
          {{ modelValue.customRequirements }}
        </p>
      </div>
    </div>

    <!-- Hint message -->
    <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 p-4 mb-6">
      <p class="text-sm text-orange-800 mb-2 font-medium">
        💡 <strong>即将发生什么？</strong>
      </p>
      <ul class="text-xs text-orange-700 space-y-1 ml-4">
        <li v-if="modelValue.customRequirements.trim()">
          • AI将根据您的自定义要求生成创意菜谱
        </li>
        <li v-else>
          • 每个大师将创作一道独特的菜谱
        </li>
        <li>• 每道菜包含详细的食材清单和烹饪步骤</li>
        <li>• 生成过程大约需要10-30秒</li>
        <li v-if="generateImages">• 同时为每道菜生成精美的菜品图片</li>
      </ul>
    </div>

    <!-- Generation options -->
    <div class="mb-6">
      <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>⚙️</span>
        <span>生成选项</span>
      </h3>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          v-model="generateImages"
          type="checkbox"
          class="w-5 h-5 accent-pink-500"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-800">同时生成菜品图片</div>
          <div class="text-xs text-gray-500 mt-1">使用AI为每道菜生成高质量的菜品图片</div>
        </div>
      </label>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          v-model="includeNutrition"
          type="checkbox"
          class="w-5 h-5 accent-pink-500"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-800">包含营养成分分析</div>
          <div class="text-xs text-gray-500 mt-1">提供详细的热量、蛋白质等营养信息</div>
        </div>
      </label>
    </div>

    <!-- Helpful tips -->
    <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-sm text-purple-700">
      <p class="mb-1">✨ <strong>温馨提示:</strong></p>
      <ul class="text-xs space-y-1 ml-4">
        <li>• 点击"开始生成"后请耐心等待</li>
        <li>• 生成的菜谱可以收藏保存</li>
        <li>• 如果不满意可以返回调整配置重新生成</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { cuisines as allCuisines } from '@/config/cuisines'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
  selectedCuisines?: string[]
}

defineProps<{
  modelValue: FormData
}>()

const generateImages = ref(true)
const includeNutrition = ref(false)

// Get cuisine by ID
const getCuisineById = (id: string) => {
  return allCuisines.find(c => c.id === id)
}
</script>
