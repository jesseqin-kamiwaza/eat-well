<template>
  <div class="step-cuisine p-4">
    <h2 class="text-2xl font-bold mb-6">选择菜系</h2>

    <!-- Custom prompt warning -->
    <div v-if="modelValue.customRequirements.trim()" class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
      <p class="text-sm text-blue-700 mb-2">✓ 已设置自定义要求，将优先使用自定义要求生成菜谱</p>
      <button @click="clearCustomPrompt" class="text-blue-600 hover:text-blue-700 underline text-sm">
        清除自定义要求以选择菜系
      </button>
    </div>

    <!-- Chinese cuisines -->
    <div class="mb-4" :class="{ 'opacity-50': modelValue.customRequirements.trim() }">
      <h5 class="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">🇨🇳 中华八大菜系</h5>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="cuisine in chineseCuisines"
          :key="cuisine.id"
          @click="selectCuisine(cuisine.id)"
          :class="[
            'p-2 rounded-lg border-2 border-black font-medium text-sm transition-all duration-200 relative flex items-center justify-center gap-1',
            selectedCuisines.includes(cuisine.id)
              ? 'bg-yellow-400 text-dark-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <span>{{ cuisine.avatar }}</span>
          <span>{{ cuisine.name.replace('大师', '') }}</span>
        </button>
      </div>
    </div>

    <!-- International cuisines -->
    <div class="mb-6" :class="{ 'opacity-50': modelValue.customRequirements.trim() }">
      <h5 class="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">🌍 国际菜系</h5>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="cuisine in internationalCuisines"
          :key="cuisine.id"
          @click="selectCuisine(cuisine.id)"
          :class="[
            'p-2 rounded-lg border-2 border-black font-medium text-sm transition-all duration-200 relative flex items-center justify-center gap-1',
            selectedCuisines.includes(cuisine.id)
              ? 'bg-yellow-400 text-dark-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <span>{{ cuisine.avatar }}</span>
          <span>{{ cuisine.name.replace('料理大师', '').replace('大师', '') }}</span>
        </button>
      </div>
    </div>

    <!-- Custom requirements -->
    <div class="border-t border-gray-200 pt-4">
      <!-- Toggle button -->
      <button
        @click="showCustomPrompt = !showCustomPrompt"
        class="flex items-center justify-between w-full p-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 mb-3"
        :class="{ 'bg-blue-50 border-blue-300': showCustomPrompt || modelValue.customRequirements.trim() }"
      >
        <span class="flex items-center gap-2">
          <span class="text-base">💭</span>
          <span class="font-medium">或自定义要求</span>
          <span v-if="modelValue.customRequirements.trim()" class="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">已设置</span>
        </span>
        <span
          class="transform transition-transform duration-200 text-gray-400"
          :class="{ 'rotate-180': showCustomPrompt }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>

      <!-- Custom requirements content -->
      <div v-if="showCustomPrompt" class="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
        <!-- Quick presets -->
        <div class="mb-3">
          <button
            @click="showPresetPicker = !showPresetPicker"
            class="flex items-center justify-between w-full p-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 mb-2"
          >
            <span class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <span class="font-medium">快速预设</span>
            </span>
            <span
              class="transform transition-transform duration-200 text-gray-400"
              :class="{ 'rotate-180': showPresetPicker }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </span>
          </button>

          <div
            v-if="showPresetPicker"
            class="space-y-2 mb-3 p-2 bg-white/70 rounded-lg border border-blue-200 shadow-sm max-h-40 overflow-y-auto"
          >
            <!-- Scene presets -->
            <div>
              <h6 class="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">🎯 场景需求</h6>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="preset in scenePresets"
                  :key="preset.id"
                  @click="applyPreset(preset.prompt)"
                  class="px-2 py-1 text-xs font-medium rounded-full border border-blue-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  {{ preset.name }}
                </button>
              </div>
            </div>

            <!-- Taste presets -->
            <div>
              <h6 class="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">👅 口味偏好</h6>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="preset in tastePresets"
                  :key="preset.id"
                  @click="applyPreset(preset.prompt)"
                  class="px-2 py-1 text-xs font-medium rounded-full border border-green-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                >
                  {{ preset.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom input -->
        <div>
          <label class="block text-sm font-bold text-blue-800 mb-2">自由描述：</label>
          <textarea
            v-model="customInput"
            @input="limitCustomPrompt"
            placeholder="例如：做一道清淡的汤，适合老人食用，不要太咸..."
            class="w-full p-2 border-2 border-blue-300 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 h-20"
            maxlength="200"
          ></textarea>
          <div v-if="customInput.trim()" class="mt-1 flex justify-between items-center">
            <span class="text-xs text-green-600">✓ 已设置自定义要求</span>
            <button @click="customInput = ''; updateCustomRequirements()" class="text-xs text-red-600 hover:text-red-700 underline">清除</button>
          </div>
        </div>

        <!-- Random inspiration -->
        <div class="mt-2">
          <button
            @click="getRandomInspiration"
            class="w-full py-1.5 px-2 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg border-2 border-black transition-all duration-200 transform active:scale-95"
          >
            ✨ 随机灵感
          </button>
        </div>

        <!-- Bottom hint -->
        <div class="mt-2 pt-2 border-t border-blue-200">
          <div class="flex items-center justify-between text-xs text-blue-600">
            <span>💡 提示：越具体越好！</span>
            <span :class="{ 'text-red-500': customInput.length > 180 }">{{ customInput.length }}/200</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Helpful tips -->
    <div class="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-3 text-sm text-green-700">
      <p class="mb-1">💡 <strong>小提示:</strong></p>
      <ul class="text-xs space-y-1 ml-4">
        <li>• 可以选择多个菜系，大师们会各显神通</li>
        <li>• 使用自定义要求可以更精确控制菜谱风格</li>
        <li>• 未选择菜系时，系统会随机推荐</li>
      </ul>
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
