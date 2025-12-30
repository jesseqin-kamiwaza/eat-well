<template>
  <div class="step-ingredients p-4">
    <h2 class="text-2xl font-bold mb-6">选择食材</h2>

    <!-- Selected ingredients -->
    <div v-if="modelValue.ingredients.length > 0" class="mb-6">
      <h3 class="text-sm text-gray-600 mb-2">已选食材 ({{ modelValue.ingredients.length }})</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(ingredient, index) in modelValue.ingredients"
          :key="index"
          class="px-4 py-2 bg-yellow-100 rounded-full border-2 border-black flex items-center gap-2"
        >
          <span>{{ ingredient }}</span>
          <button
            @click="removeIngredient(index)"
            class="text-red-500 font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Input field -->
    <div class="mb-6">
      <input
        v-model="newIngredient"
        type="text"
        placeholder="输入食材名称..."
        class="w-full px-4 py-3 text-lg border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
        @keyup.enter="addIngredient"
      />
      <button
        @click="addIngredient"
        :disabled="!newIngredient.trim()"
        class="w-full mt-3 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded-xl border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
      >
        添加食材
      </button>
    </div>

    <!-- Quick select -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-2">快速选择</h3>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in quickIngredients"
          :key="item"
          @click="quickAdd(item)"
          class="py-3 px-2 text-sm bg-white border-2 border-black rounded-xl active:scale-95 transition-transform"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <!-- Photo recognition -->
    <button
      @click="$emit('photo-recognize')"
      class="w-full py-4 bg-white border-2 border-black rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
    >
      <span class="text-2xl">📷</span>
      <span>拍照识别食材</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  'photo-recognize': []
  'next': []
}>()

const newIngredient = ref('')

const quickIngredients = [
  '鸡肉', '猪肉', '牛肉', '鱼',
  '番茄', '土豆', '青椒', '洋葱',
  '胡萝卜', '白菜', '豆腐', '鸡蛋'
]

const addIngredient = () => {
  const ingredient = newIngredient.value.trim()
  if (ingredient && !props.modelValue.ingredients.includes(ingredient)) {
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
  if (!props.modelValue.ingredients.includes(ingredient)) {
    emit('update:modelValue', {
      ...props.modelValue,
      ingredients: [...props.modelValue.ingredients, ingredient]
    })
  }
}
</script>
