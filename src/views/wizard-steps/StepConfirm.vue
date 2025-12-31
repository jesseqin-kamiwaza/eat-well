<template>
  <div class="step-confirm h-full flex flex-col pb-24">
    <!-- Configuration preview card -->
    <div class="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 animate-fade-in">
      <div class="flex items-center gap-3 mb-4 border-b-2 border-gray-100 pb-3">
        <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl border-2 border-black">
          📋
        </div>
        <div>
          <h3 class="font-bold text-lg text-dark-800">生成清单</h3>
          <p class="text-xs text-gray-500">确认以下信息无误</p>
        </div>
      </div>

      <!-- Ingredients list -->
      <div class="mb-4">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">已选食材</span>
        <div v-if="modelValue.ingredients.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="ingredient in modelValue.ingredients"
            :key="ingredient"
            class="inline-block bg-yellow-50 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium border border-yellow-200"
          >
            {{ ingredient }}
          </span>
        </div>
        <span v-else class="text-sm text-gray-400 italic">未添加食材</span>
      </div>

      <!-- Cuisines and masters -->
      <div class="mb-4">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">烹饪风格</span>
        
        <div v-if="modelValue.customRequirements.trim()" class="bg-blue-50 p-3 rounded-xl border border-blue-100">
           <span class="text-xs font-bold text-blue-500 block mb-1">自定义要求</span>
           <p class="text-sm text-blue-800">{{ modelValue.customRequirements }}</p>
        </div>
        
        <div v-else-if="modelValue.selectedCuisines && modelValue.selectedCuisines.length > 0">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="cuisineId in modelValue.selectedCuisines"
              :key="cuisineId"
              class="inline-flex items-center gap-1 bg-green-50 text-green-800 px-3 py-1 rounded-lg text-sm font-medium border border-green-200"
            >
              <span>{{ getCuisineById(cuisineId)?.avatar || '👨‍🍳' }}</span>
              <span>{{ getCuisineById(cuisineId)?.name }}</span>
            </div>
          </div>
        </div>
        
        <span v-else class="text-sm text-gray-400 flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
          <span>🎲</span>
          将随机邀请2位大师为您创作
        </span>
      </div>
    </div>

    <!-- Generation options -->
    <div class="space-y-3 animate-fade-in" style="animation-delay: 0.1s">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
        高级选项
      </h3>
      
      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black active:scale-[0.99] transition-all shadow-sm">
        <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl">
           📷
        </div>
        <div class="flex-1">
          <div class="font-bold text-gray-800 text-sm">生成精美配图</div>
          <div class="text-xs text-gray-500">AI绘制成品效果图</div>
        </div>
         <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input v-model="generateImages" type="checkbox" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-400 transition-all duration-300"/>
            <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
        </div>
      </label>

      <label class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-black active:scale-[0.99] transition-all shadow-sm">
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
           📊
        </div>
        <div class="flex-1">
          <div class="font-bold text-gray-800 text-sm">营养成分分析</div>
          <div class="text-xs text-gray-500">计算热量与营养素</div>
        </div>
         <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input v-model="includeNutrition" type="checkbox" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-400 transition-all duration-300"/>
            <label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
        </div>
      </label>
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

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

/* Custom Toggle Checkbox */
.toggle-checkbox:checked {
  right: 0;
  border-color: #68D391;
}
.toggle-checkbox:checked + .toggle-label {
  background-color: #68D391;
}
.toggle-checkbox {
  right: 24px;
}
.toggle-label {
  width: 48px;
}
</style>
