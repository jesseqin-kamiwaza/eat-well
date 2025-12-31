<script setup lang="ts">
defineProps<{
  type?: 'card' | 'list' | 'text'
  count?: number
}>()
</script>

<template>
  <!-- RecipeCard骨架屏 -->
  <div v-if="type === 'card'" class="animate-pulse">
    <div class="card-brutal overflow-hidden">
      <!-- 图片骨架 -->
      <div class="w-full aspect-[4/3] bg-gray-200"></div>
      <!-- 内容骨架 -->
      <div class="p-4">
        <div class="h-6 bg-gray-200 rounded-lg mb-2"></div>
        <div class="flex gap-3 mb-3">
          <div class="h-4 w-20 bg-gray-200 rounded"></div>
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div class="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>

  <!-- 列表骨架屏 -->
  <div v-else-if="type === 'list'" class="space-y-3">
    <div v-for="i in (count || 3)" :key="i" class="animate-pulse flex gap-3">
      <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div class="flex-1">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>

  <!-- 文本骨架屏 -->
  <div v-else class="animate-pulse space-y-2">
    <div class="h-4 bg-gray-200 rounded"></div>
    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
    <div class="h-4 bg-gray-200 rounded w-4/6"></div>
  </div>
</template>
