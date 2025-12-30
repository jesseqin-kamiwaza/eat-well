<template>
  <div class="step-cuisine p-4">
    <h2 class="text-2xl font-bold mb-6">选择菜系</h2>

    <!-- Cuisine selection -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">中华八大菜系</h3>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="cuisine in cuisines"
          :key="cuisine.name"
          @click="selectCuisine(cuisine.name)"
          :class="[
            'p-4 rounded-xl border-2 border-black transition-all active:scale-95',
            modelValue.cuisine === cuisine.name
              ? 'bg-gradient-to-br from-yellow-400 to-pink-400 text-white'
              : 'bg-white'
          ]"
        >
          <div class="text-3xl mb-2">{{ cuisine.icon }}</div>
          <div class="font-bold">{{ cuisine.name }}</div>
        </button>
      </div>
    </div>

    <!-- Custom requirements -->
    <div class="mb-6">
      <h3 class="text-sm text-gray-600 mb-3">或自定义要求</h3>
      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="tag in customTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'px-4 py-2 rounded-full border-2 border-black transition-all',
            selectedTags.includes(tag)
              ? 'bg-pink-100 text-pink-700'
              : 'bg-white'
          ]"
        >
          {{ tag }}
        </button>
      </div>

      <textarea
        v-model="customInput"
        placeholder="其他要求（如：清淡健康、低卡路里...）"
        class="w-full px-4 py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
}>()

const cuisines = [
  { name: '川菜', icon: '🌶️' },
  { name: '粤菜', icon: '🦐' },
  { name: '湘菜', icon: '🔥' },
  { name: '鲁菜', icon: '🥟' },
  { name: '苏菜', icon: '🍲' },
  { name: '浙菜', icon: '🐟' },
  { name: '闽菜', icon: '🦀' },
  { name: '徽菜', icon: '🍖' }
]

const customTags = ['清淡健康', '麻辣', '家常', '宴客', '快手菜', '低卡']
const selectedTags = ref<string[]>([])
const customInput = ref('')

const selectCuisine = (cuisine: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    cuisine
  })
}

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  updateCustomRequirements()
}

watch(customInput, () => {
  updateCustomRequirements()
})

const updateCustomRequirements = () => {
  const tags = selectedTags.value.join('、')
  const custom = customInput.value.trim()
  const requirements = [tags, custom].filter(Boolean).join('；')

  emit('update:modelValue', {
    ...props.modelValue,
    customRequirements: requirements
  })
}
</script>
