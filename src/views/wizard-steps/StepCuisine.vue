<template>
  <div class="step-cuisine h-full overflow-y-auto pb-24">
    <!-- Custom prompt warning (Sticky at top if active) -->
    <div v-if="modelValue.customRequirements.trim()" class="sticky top-0 z-10 mb-4 p-3 bg-blue-50/95 backdrop-blur border-b-2 border-blue-200 shadow-sm animate-slide-down">
      <div class="flex items-start justify-between gap-2">
        <p class="text-xs text-blue-700 font-medium">✨ 已设置自定义要求，将优先使用此要求</p>
        <button @click="clearCustomPrompt" class="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 bg-white rounded border border-blue-200">
          清除
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Chinese cuisines -->
      <div class="animate-fade-in" :class="{ 'opacity-50 pointer-events-none grayscale': modelValue.customRequirements.trim() }">
        <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
          🇨🇳 中华八大菜系
        </h5>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="cuisine in chineseCuisines"
            :key="cuisine.id"
            @click="selectCuisine(cuisine.id)"
            :class="[
              'p-3 rounded-xl border-2 border-black font-medium text-sm transition-all duration-200 flex flex-col items-center justify-center gap-2 aspect-square active:scale-95',
              selectedCuisines.includes(cuisine.id)
                ? 'bg-yellow-400 text-dark-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
            ]"
          >
            <span class="text-2xl">{{ cuisine.avatar }}</span>
            <span class="text-xs font-bold">{{ cuisine.name.replace('大师', '') }}</span>
          </button>
        </div>
      </div>

      <!-- International cuisines -->
      <div class="animate-fade-in" style="animation-delay: 0.1s" :class="{ 'opacity-50 pointer-events-none grayscale': modelValue.customRequirements.trim() }">
        <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
          🌍 国际菜系
        </h5>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="cuisine in internationalCuisines"
            :key="cuisine.id"
            @click="selectCuisine(cuisine.id)"
            :class="[
              'p-3 rounded-xl border-2 border-black font-medium text-sm transition-all duration-200 flex flex-col items-center justify-center gap-2 aspect-square active:scale-95',
              selectedCuisines.includes(cuisine.id)
                ? 'bg-yellow-400 text-dark-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
            ]"
          >
            <span class="text-2xl">{{ cuisine.avatar }}</span>
            <span class="text-xs font-bold">{{ cuisine.name.replace('料理大师', '').replace('大师', '') }}</span>
          </button>
        </div>
      </div>

      <!-- Custom requirements -->
      <div class="border-t-2 border-dashed border-gray-200 pt-6 animate-fade-in" style="animation-delay: 0.2s">
        <!-- Toggle button -->
        <button
          @click="showCustomPrompt = !showCustomPrompt"
          class="flex items-center justify-between w-full p-4 bg-blue-50 text-sm text-gray-800 rounded-xl border-2 border-blue-200 active:scale-[0.98] transition-all duration-200 shadow-sm"
          :class="{ 'border-blue-400 ring-2 ring-blue-100': showCustomPrompt || modelValue.customRequirements.trim() }"
        >
          <div class="flex flex-col items-start gap-1">
            <span class="flex items-center gap-2 font-bold text-blue-900">
              <span class="text-xl">💭</span>
              自定义要求
            </span>
            <span class="text-xs text-blue-600 pl-7">例如：口味偏好、特定场景、忌口...</span>
          </div>
          <span
            class="transform transition-transform duration-200 text-blue-400 bg-white rounded-full p-1"
            :class="{ 'rotate-180': showCustomPrompt }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>

        <!-- Custom requirements content -->
        <div v-if="showCustomPrompt" class="mt-4 animate-slide-down">
          <!-- Quick presets -->
          <div class="mb-4 overflow-x-auto pb-2 -mx-1 px-1">
             <div class="flex gap-2 min-w-max">
                <button
                  v-for="preset in [...scenePresets.slice(0,3), ...tastePresets.slice(0,3)]"
                  :key="preset.id"
                  @click="applyPreset(preset.prompt)"
                  class="px-3 py-1.5 text-xs font-medium rounded-full border bg-white shadow-sm active:scale-95 transition-all whitespace-nowrap"
                  :class="preset.id.includes('light') || preset.id.includes('spicy') ? 'border-green-300 text-green-700' : 'border-blue-300 text-blue-700'"
                >
                  {{ preset.name }}
                </button>
                 <button
                  @click="showPresetPicker = !showPresetPicker"
                  class="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 bg-gray-50 text-gray-600 active:scale-95"
                 >
                   更多...
                 </button>
             </div>
          </div>

           <div
            v-if="showPresetPicker"
            class="mb-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in"
          >
             <h6 class="text-xs font-bold text-gray-400 mb-2 uppercase">更多场景与口味</h6>
             <div class="flex flex-wrap gap-2">
                 <button
                  v-for="preset in [...scenePresets.slice(3), ...tastePresets.slice(3)]"
                  :key="preset.id"
                  @click="applyPreset(preset.prompt)"
                   class="px-2 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
                 >
                   {{ preset.name }}
                 </button>
             </div>
          </div>

          <!-- Custom input -->
          <div class="relative">
            <textarea
              v-model="customInput"
              @input="limitCustomPrompt"
              placeholder="在这里告诉AI厨师你的具体要求..."
              class="w-full p-4 border-2 border-blue-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 min-h-[120px] shadow-inner bg-white"
              maxlength="200"
            ></textarea>
            <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-mono bg-white/80 px-1 rounded">
              {{ customInput.length }}/200
            </div>
          </div>
          
           <!-- Random inspiration -->
           <button
            @click="getRandomInspiration"
            class="mt-3 w-full py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 text-sm font-bold rounded-xl border border-purple-200 dashed flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <span>✨</span>
            <span>不知道写什么？点我获取灵感</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { cuisines as allCuisines } from '@/config/cuisines'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
  selectedCuisines?: string[]
}

const props = defineProps<{
  modelValue: FormData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
}>()

// Split cuisines into Chinese and international
const chineseCuisines = allCuisines.slice(0, 8)
const internationalCuisines = allCuisines.slice(8)

const selectedCuisines = ref<string[]>([])
const customInput = ref('')
const showCustomPrompt = ref(false)
const showPresetPicker = ref(false)

// Scene presets
const scenePresets = [
  { id: 'family', name: '家庭聚餐', prompt: '适合全家人一起享用的家常菜，老少皆宜，营养均衡' },
  { id: 'romantic', name: '浪漫晚餐', prompt: '适合情侣约会的精致菜品，卖相精美，氛围浪漫' },
  { id: 'quick', name: '快手菜', prompt: '制作简单快速的菜品，15分钟内完成，适合忙碌时光' },
  { id: 'party', name: '聚会小食', prompt: '适合朋友聚会的下酒菜或小食，方便分享' },
  { id: 'breakfast', name: '营养早餐', prompt: '健康营养的早餐搭配，提供一天的活力' },
  { id: 'lunch', name: '工作午餐', prompt: '适合上班族的午餐，营养丰富且不油腻' }
]

const tastePresets = [
  { id: 'light', name: '清淡口味', prompt: '口味清淡，少油少盐，突出食材本味' },
  { id: 'spicy', name: '香辣过瘾', prompt: '香辣刺激，层次丰富，适合喜欢辣味的人' },
  { id: 'sweet', name: '微甜可口', prompt: '带有淡淡甜味，口感温和，老少皆宜' },
  { id: 'sour', name: '酸爽开胃', prompt: '酸味突出，开胃解腻，适合夏天享用' },
  { id: 'savory', name: '鲜香浓郁', prompt: '鲜味十足，香气浓郁，回味无穷' },
  { id: 'crispy', name: '酥脆爽口', prompt: '口感酥脆，层次分明，嚼劲十足' }
]

// Random inspirations
const randomInspirations = [
  '制作一道有故事的菜，让人回味童年',
  '融合东西方口味，创新搭配',
  '用最简单的方法，做出最温暖的味道',
  '适合雨天享用的暖心料理',
  '颜值超高的网红打卡菜品',
  '妈妈味道的现代演绎',
  '适合深夜的治愈系美食',
  '带有节日氛围的特色菜',
  '健康养生的药膳料理',
  '适合野餐的便携美食',
  '有仪式感的精致小食',
  '适合看剧时享用的小零食',
  '能够暖胃暖心的汤品',
  '适合和朋友分享的下酒菜',
  '充满创意的摆盘艺术菜',
  '适合运动后补充能量的料理'
]

// Initialize from existing data
onMounted(() => {
  if (props.modelValue.selectedCuisines) {
    selectedCuisines.value = [...props.modelValue.selectedCuisines]
  }
  if (props.modelValue.customRequirements) {
    customInput.value = props.modelValue.customRequirements
  }
})

const selectCuisine = (cuisineId: string) => {
  const index = selectedCuisines.value.indexOf(cuisineId)
  if (index > -1) {
    selectedCuisines.value.splice(index, 1)
  } else {
    selectedCuisines.value.push(cuisineId)
  }

  // Update model value
  emit('update:modelValue', {
    ...props.modelValue,
    selectedCuisines: [...selectedCuisines.value]
  })
}

const clearCustomPrompt = () => {
  customInput.value = ''
  showCustomPrompt.value = false
  updateCustomRequirements()
}

const applyPreset = (presetPrompt: string) => {
  showCustomPrompt.value = true
  if (customInput.value.trim()) {
    const newContent = customInput.value.trim() + '，' + presetPrompt
    if (newContent.length <= 200) {
      customInput.value = newContent
    }
  } else {
    customInput.value = presetPrompt
  }
  updateCustomRequirements()
}

const limitCustomPrompt = () => {
  if (customInput.value.length > 200) {
    customInput.value = customInput.value.substring(0, 200)
  }
  updateCustomRequirements()
}

const getRandomInspiration = () => {
  showCustomPrompt.value = true
  const randomIndex = Math.floor(Math.random() * randomInspirations.length)
  const inspiration = randomInspirations[randomIndex]

  if (customInput.value.trim()) {
    const newContent = customInput.value.trim() + '，' + inspiration
    if (newContent.length <= 200) {
      customInput.value = newContent
    } else {
      customInput.value = inspiration
    }
  } else {
    customInput.value = inspiration
  }
  updateCustomRequirements()
}

const updateCustomRequirements = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    customRequirements: customInput.value.trim()
  })
}

watch(customInput, () => {
  updateCustomRequirements()
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}
.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
}
</style>
