<template>
  <div class="step-confirm p-4">
    <h2 class="text-2xl font-bold mb-6">确认生成</h2>

    <!-- Configuration preview -->
    <div class="bg-white rounded-xl border-2 border-black p-6 mb-6">
      <div class="mb-4">
        <h3 class="text-sm text-gray-600 mb-2">食材</h3>
        <p class="text-lg">{{ modelValue.ingredients.join('、') }}</p>
      </div>

      <div class="mb-4">
        <h3 class="text-sm text-gray-600 mb-2">菜系</h3>
        <p class="text-lg">{{ modelValue.cuisine || '未选择' }}</p>
      </div>

      <div v-if="modelValue.customRequirements">
        <h3 class="text-sm text-gray-600 mb-2">特殊要求</h3>
        <p class="text-lg">{{ modelValue.customRequirements }}</p>
      </div>
    </div>

    <!-- Hint message -->
    <div class="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 mb-6">
      <p class="text-sm text-blue-800">
        💡 AI将根据您的选择生成3-5道菜谱建议，每道菜包含详细的食材清单和烹饪步骤。
      </p>
    </div>

    <!-- Generation options -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">生成选项</h3>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black mb-2">
        <input
          v-model="generateImages"
          type="checkbox"
          class="w-5 h-5"
        />
        <span>同时生成菜品图片</span>
      </label>
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black">
        <input
          v-model="includeNutrition"
          type="checkbox"
          class="w-5 h-5"
        />
        <span>包含营养成分分析</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
}

defineProps<{
  modelValue: FormData
}>()

const generateImages = ref(true)
const includeNutrition = ref(false)
</script>
