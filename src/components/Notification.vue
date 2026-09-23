<template>
  <div class="notifications-container">
    <TransitionGroup name="toast">
      <div
        v-for="n in store.notifications"
        :key="n.id"
        class="toast"
        :class="`toast-${n.type}`"
        @click="store.remove(n.id)"
      >
        <span class="toast-icon">{{ n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️' }}</span>
        <span class="toast-msg">{{ n.message }}</span>
        <button class="toast-close" @click.stop="store.remove(n.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
const store = useNotificationStore()
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  min-width: 280px;
  max-width: 400px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-left: 5px solid #ccc;
  transition: all 0.3s ease;
}
.toast-success { border-left-color: #10b981; background: #f0fdf4; }
.toast-error { border-left-color: #ef4444; background: #fef2f2; }
.toast-info { border-left-color: #3b82f6; background: #eff6ff; }

.toast-icon { font-size: 18px; }
.toast-msg { font-size: 14px; font-weight: 600; flex: 1; }
.toast-close {
  background: none;
  border: 0;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.toast-close:hover { color: #0f172a; }

/* Transitions */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
