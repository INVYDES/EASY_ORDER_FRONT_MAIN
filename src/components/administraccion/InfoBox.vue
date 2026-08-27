<template>
</template>

<script setup>
defineProps({
  titulo:   { type: String, required: true },
  paraQue:  { type: String, default: '' },
  medir:    { type: String, default: '' },
  queHacer: { type: String, default: '' },
})
</script>