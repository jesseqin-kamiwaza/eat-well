<template>
  <router-link
    :to="to"
    class="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
    :class="[
      active
        ? 'text-pink-500 scale-110'
        : 'text-gray-600 active:scale-95'
    ]"
    active-class="text-pink-500"
  >
    <span class="text-2xl mb-1">{{ icon }}</span>
    <span class="text-xs font-medium">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  to: string
  active?: boolean
}>()
</script>
