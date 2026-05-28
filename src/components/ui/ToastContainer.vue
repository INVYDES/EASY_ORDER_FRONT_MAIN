<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
    <div v-for="toast in toasts" :key="toast.id"
      :class="[
        'px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 animate-slide-in pointer-events-auto',
        toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' :
        toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800' :
        'bg-blue-50 border-l-4 border-blue-500 text-blue-800'
      ]">
      <span>{{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}</span>
      <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
      <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '@/composables/useToast'

defineProps<{
  toasts: Toast[]
}>()

const emit = defineEmits<{
  remove: [id: number]
}>()

const removeToast = (id: number) => emit('remove', id)
</script>

<style scoped>
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
</style>
