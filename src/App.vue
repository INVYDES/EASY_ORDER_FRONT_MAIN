<template>
  <div id="app">
    <RouterView />
    <!-- Chatbot Global -->
    <ChatBotWidget />
  </div>
</template>

<script setup>
import ChatBotWidget from './components/chat/ChatBotWidget.vue'
</script>

<style>
/* Estilos globales para el chatbot si fuera necesario */
</style>


