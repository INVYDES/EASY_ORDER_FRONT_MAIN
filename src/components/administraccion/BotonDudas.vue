<template>
  <button
    @click="$emit('click')"
    class="flex items-center gap-2 px-4 py-2 bg-white text-[#245C4F] border border-[#DDE3DE] rounded-xl text-xs font-semibold hover:bg-[#E8F1ED] transition cursor-pointer shadow-xs"
  >
    <i class="fa-solid fa-circle-question text-sm text-[#245C4F]"></i> Dudas
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>