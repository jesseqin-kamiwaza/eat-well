<template>
  <div class="step-ingredients p-4">
    <h2 class="text-2xl font-bold mb-6">选择食材</h2>

    <!-- Selected ingredients -->
    <div v-if="modelValue.ingredients.length > 0" class="mb-6">
      <h3 class="text-sm text-gray-600 mb-2">已选食材 ({{ modelValue.ingredients.length }}/10)</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(ingredient, index) in modelValue.ingredients"
          :key="index"
          class="px-4 py-2 bg-yellow-100 rounded-full border-2 border-black flex items-center gap-2"
        >
          <span>{{ ingredient }}</span>
          <button
            @click="removeIngredient(index)"
            class="text-red-500 font-bold hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Input field with photo button -->
    <div class="mb-6">
      <div class="flex gap-2">
        <input
          v-model="newIngredient"
          type="text"
          placeholder="输入食材名称..."
          class="flex-1 px-4 py-3 text-lg border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
          @keyup.enter="addIngredient"
        />
        <!-- Photo recognition button -->
        <div class="relative group">
          <button
            @click="triggerImageUpload"
            :disabled="isRecognizing"
            class="relative h-full px-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 rounded-xl border-2 border-black transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[3.5rem]"
          >
            <!-- Normal state -->
            <span v-if="!isRecognizing" class="text-2xl">📷</span>

            <!-- Loading state -->
            <div v-else class="relative flex items-center justify-center">
              <div class="absolute w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <div class="absolute w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </button>

          <!-- Tooltip -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            <div class="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
              拍照识别
              <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div class="w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
        class="hidden"
      />

      <button
        @click="addIngredient"
        :disabled="!newIngredient.trim() || modelValue.ingredients.length >= 10"
        class="w-full mt-3 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded-xl border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        添加食材
      </button>
    </div>

    <!-- Quick select with categories -->
    <div class="mb-6">
      <button
        @click="showIngredientPicker = !showIngredientPicker"
        class="flex items-center justify-between w-full p-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
      >
        <span class="flex items-center gap-2">
          <span class="text-base">🥬</span>
          <span class="font-medium">快速选择食材</span>
        </span>
        <span
          class="transform transition-transform duration-200 text-gray-400"
          :class="{ 'rotate-180': showIngredientPicker }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>

      <div
        v-if="showIngredientPicker"
        class="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
      >
        <div class="p-3 max-h-80 overflow-y-auto">
          <div class="space-y-4">
            <div v-for="category in ingredientCategories" :key="category.id">
              <!-- Category header -->
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm">{{ category.icon }}</span>
                <span class="text-sm font-bold text-gray-700">{{ category.name }}</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              <!-- Ingredient buttons -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="item in category.items"
                  :key="item"
                  @click="quickAdd(item)"
                  :disabled="modelValue.ingredients.includes(item) || modelValue.ingredients.length >= 10"
                  class="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 hover:border-pink-400 hover:bg-pink-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 transition-all duration-200 hover:shadow-sm"
                  :class="{
                    'bg-yellow-100 border-yellow-400 text-yellow-800 shadow-sm': modelValue.ingredients.includes(item),
                    'hover:scale-105': !modelValue.ingredients.includes(item) && modelValue.ingredients.length < 10
                  }"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status bar -->
        <div class="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
          <span>点击食材快速添加到列表</span>
          <span class="font-medium">已选择 {{ modelValue.ingredients.length }}/10</span>
        </div>
      </div>
    </div>

    <!-- Helpful tips -->
    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-sm text-blue-700">
      <p class="mb-1">💡 <strong>小提示:</strong></p>
      <ul class="text-xs space-y-1 ml-4">
        <li>• 使用📷拍照快速识别冰箱里的食材</li>
        <li>• 至少添加1种食材才能继续</li>
        <li>• 最多可以添加10种食材</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ingredientCategories } from '@/config/ingredients'

interface FormData {
  ingredients: string[]
  cuisine: string
  customRequirements: string
}

const props = defineProps<{
  modelValue: FormData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
  'next': []
}>()

const newIngredient = ref('')
const showIngredientPicker = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const isRecognizing = ref(false)

const addIngredient = () => {
  const ingredient = newIngredient.value.trim()
  if (ingredient && !props.modelValue.ingredients.includes(ingredient) && props.modelValue.ingredients.length < 10) {
    emit('update:modelValue', {
      ...props.modelValue,
      ingredients: [...props.modelValue.ingredients, ingredient]
    })
    newIngredient.value = ''
  }
}

const removeIngredient = (index: number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ingredients: props.modelValue.ingredients.filter((_, i) => i !== index)
  })
}

const quickAdd = (ingredient: string) => {
  if (!props.modelValue.ingredients.includes(ingredient) && props.modelValue.ingredients.length < 10) {
    emit('update:modelValue', {
      ...props.modelValue,
      ingredients: [...props.modelValue.ingredients, ingredient]
    })
  }
}

// Photo recognition
const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  isRecognizing.value = true

  try {
    const base64Data = await fileToBase64(file)
    const recognizedIngredients = await recognizeIngredientsFromImage(base64Data)

    if (recognizedIngredients && recognizedIngredients.length > 0) {
      recognizedIngredients.forEach(ingredient => {
        if (!props.modelValue.ingredients.includes(ingredient) && props.modelValue.ingredients.length < 10) {
          props.modelValue.ingredients.push(ingredient)
        }
      })

      emit('update:modelValue', {
        ...props.modelValue,
        ingredients: [...props.modelValue.ingredients]
      })

      alert(`成功识别到 ${recognizedIngredients.length} 种食材：${recognizedIngredients.join('、')}`)
    } else {
      alert('未能识别到食材，请尝试拍摄更清晰的照片')
    }
  } catch (error) {
    console.error('图片识别失败:', error)
    alert('图片识别失败，请重试')
  } finally {
    isRecognizing.value = false
    target.value = ''
  }
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const recognizeIngredientsFromImage = async (base64Data: string): Promise<string[]> => {
  const apiKey = import.meta.env.VITE_IMAGE_GENERATION_API_KEY

  const systemPrompt = `You are a professional refrigerator ingredient recognition system. Please strictly follow these rules:

Recognition rules:
1. Only recognize clearly visible, identifiable ingredients
2. Use common Chinese names (e.g., 西兰花, not "青花菜")

Output format:
- Format: Plain text, ingredient names separated by commas
- Quantity: Maximum 20 items, sorted by visual prominence
- Empty result: Return empty string if no ingredients found
- No prefix/suffix explanations

Priority sorting:
1. Complete, independently visible ingredients
2. Ingredients occupying main area of frame
3. Ingredients with high color/shape recognition

Example:
Input: Refrigerator interior photo
Output: 西红柿,鸡蛋,青椒,酸奶,牛肉

Special handling:
- Partially visible: Mark as "未知蔬菜/肉类" etc
- Packaged foods: Recognize visible parts (e.g., "牛奶盒" as "牛奶")
- Condiments/beverages: Only recognize when primary items`

  const userPrompt = '请识别图片中的所有食材，只返回食材名称，用逗号分隔'

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'GLM-4.1V-Thinking-Flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              },
              {
                type: 'text',
                text: userPrompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    const ingredientsList = content
      .split(/[,，、]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0 && item.length < 10)
      .slice(0, 10)

    return ingredientsList
  } catch (error) {
    console.error('AI recognition error:', error)
    throw error
  }
}
</script>

<style scoped>
.step-ingredients {
  /* Ensure full height usage */
  min-height: 100%;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-pop-in {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
