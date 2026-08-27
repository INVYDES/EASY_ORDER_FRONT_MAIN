<template>
  <button
    @click="$emit('click')"
    class="flex items-center gap-2.5 px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-base font-bold hover:bg-indigo-100 hover:border-indigo-200 transition active:scale-95 cursor-pointer"
  >
    <i class="fa-solid fa-circle-question text-lg"></i> Dudas
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>