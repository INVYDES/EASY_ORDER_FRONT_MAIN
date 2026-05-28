<template>
  <div id="app">
    <RouterView />
    <!-- Chatbot Global -->
    <ChatBotWidget />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import ChatBotWidget from './components/chat/ChatBotWidget.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})
</script>

<style>
/* Estilos globales para el chatbot si fuera necesario */
</style>


