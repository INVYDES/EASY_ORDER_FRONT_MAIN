<template>
  <div class="flex h-screen bg-gray-100">

    <!-- Sidebar (responsivo) -->
    <AppSidebar 
      :is-open="isSidebarOpen" 
      @relative-close="isSidebarOpen = false" 
    />

    <!-- Contenedor principal -->
    <div class="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">

      <!-- Header (responsivo) -->
      <AppHeader 
        @toggle="isSidebarOpen = !isSidebarOpen" 
      />

      <!-- Área con scroll -->
      <main class="flex-1 overflow-y-auto p-6 w-full relative">
        <RouterView />
      </main>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

// Estado del sidebar (cerrado por defecto en móvil)
const isSidebarOpen = ref(false)
</script>