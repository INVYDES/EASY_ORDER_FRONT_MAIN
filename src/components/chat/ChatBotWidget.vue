<template>
  <div class="chatbot-wrapper">
    <!-- Botón Flotante -->
    <button 
      @click="toggleChat"
      class="chat-trigger shadow-2xl transition-all duration-300 active:scale-90"
      :class="{ 'trigger-active': isOpen }"
    >
      <div v-if="!isOpen" class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span class="pulse-ring"></span>
      </div>
      <span v-else class="text-xl">✕</span>
    </button>

    <!-- Ventana de Chat -->
    <transition name="chat-window-slide">
      <div v-if="isOpen" class="chat-window shadow-2xl">
        <!-- Header -->
        <div class="chat-header">
          <div class="flex items-center gap-3">
            <div class="avatar-status">
              <span class="bot-avatar">🤖</span>
              <span class="status-dot"></span>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">Asistente TiendaFer</h3>
              <p class="text-[10px] text-indigo-200 uppercase tracking-widest font-black">En línea • IA Gemini</p>
            </div>
          </div>
          <button @click="clearChat" class="text-indigo-300 hover:text-white transition text-xs font-bold">Limpiar</button>
        </div>

        <!-- Mensajes -->
        <div class="chat-messages" ref="messageContainer">
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx" 
            :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']"
          >
            <div class="message-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-bot'">
              <p class="text-sm leading-relaxed whitespace-pre-line">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Indicador Escribiendo -->
          <div v-if="isLoading" class="bot-row message-row">
            <div class="bubble-bot typing-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Sugerencias Quick Actions -->
        <div v-if="messages.length < 2 && !isLoading" class="quick-actions p-4 flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            v-for="q in quickActions" 
            :key="q"
            @click="sendQuick(q)"
            class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 hover:bg-indigo-600 hover:text-white transition shadow-sm"
          >
            {{ q }}
          </button>
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="input-container">
            <input 
              v-model="inputValue" 
              @keyup.enter="handleSend"
              placeholder="Escribe tu mensaje..."
              :disabled="isLoading"
              class="custom-input"
            />
            <button 
              @click="handleSend"
              :disabled="!inputValue.trim() || isLoading"
              class="send-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Overlay de Sugerencia/WhatsApp -->
        <transition name="fade">
          <div v-if="showSuggestionForm" class="suggestion-overlay">
            <div class="suggestion-card scale-in shadow-2xl">
              <div class="text-center mb-6">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">📱</div>
                <h4 class="font-black text-slate-800">Enviar Comentario</h4>
                <p class="text-[10px] text-slate-400 font-bold uppercase mt-1">Llegará directamente al dueño</p>
              </div>
              
              <div class="space-y-4">
                <div class="input-group">
                  <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block">Tu Nombre</label>
                  <input v-model="suggestionForm.name" placeholder="Ej: Juan Pérez" class="form-input" />
                </div>
                <div class="input-group">
                  <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block">WhatsApp / Teléfono</label>
                  <input v-model="suggestionForm.contact" placeholder="Ej: 5512345678" class="form-input" />
                </div>
                <div class="input-group">
                  <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block">Mensaje</label>
                  <textarea v-model="suggestionForm.message" rows="3" class="form-input resize-none" placeholder="¿En qué podemos mejorar?"></textarea>
                </div>
              </div>

              <div class="flex gap-3 mt-8">
                <button @click="showSuggestionForm = false" class="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                <button 
                  @click="submitSuggestion"
                  :disabled="sendingSuggestion || !suggestionForm.name || !suggestionForm.contact"
                  class="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {{ sendingSuggestion ? 'Enviando...' : 'Enviar' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive, watch } from 'vue'
import { apiClient } from '@/utils/apiClient'

// --- Estado ---
const isOpen = ref(false)
const isLoading = ref(false)
const inputValue = ref('')
const messageContainer = ref(null)
const messages = ref([])
const showSuggestionForm = ref(false)
const sendingSuggestion = ref(false)

const suggestionForm = reactive({
  name: '',
  contact: '',
  message: ''
})

const quickActions = [
  '¿Tienen promociones?',
  '¿Cuál es el horario?',
  'Dejar una sugerencia',
  'Consultar menú'
]

// --- Métodos ---
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

const handleSend = async () => {
  if (!inputValue.value.trim() || isLoading.value) return

  const userMessage = inputValue.value.trim()
  inputValue.value = ''

  // Agregar mensaje del usuario
  messages.value.push({ role: 'user', content: userMessage })
  scrollToBottom()

  isLoading.value = true

  try {
    const chatHistory = messages.value.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content
    }))

    const resp = await apiClient.post('/chatbot/chat', {
      message: userMessage,
      history: chatHistory
    })

    if (resp.reply) {
      messages.value.push({ role: 'bot', content: resp.reply })
      
      // Persistencia
      sessionStorage.setItem('chat_history', JSON.stringify(messages.value))

      // Detección de sugerencia
      const triggerWords = ['¿Quieres que envíe tu comentario?', 'dejar una sugerencia', 'enviar tu queja', 'comentarle al dueño']
      if (triggerWords.some(word => resp.reply.toLowerCase().includes(word))) {
        // Pre-poblar el mensaje de la sugerencia con el último mensaje del usuario si parece relevante
        suggestionForm.message = userMessage
      }
    }
  } catch (err) {
    messages.value.push({ 
      role: 'bot', 
      content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo?' 
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const sendQuick = (text) => {
  if (text === 'Dejar una sugerencia') {
    showSuggestionForm.value = true
    return
  }
  inputValue.value = text
  handleSend()
}

const submitSuggestion = async () => {
  sendingSuggestion.value = true
  try {
    const resp = await apiClient.post('/chatbot/sugerencia', suggestionForm)
    if (resp.success) {
      showSuggestionForm.value = false
      messages.value.push({ role: 'bot', content: '✅ ¡Tu sugerencia ha sido enviada directamente al dueño! Gracias por ayudarnos a mejorar.' })
      scrollToBottom()
      // Limpiar form
      suggestionForm.name = ''
      suggestionForm.contact = ''
      suggestionForm.message = ''
    }
  } catch (err) {
    alert('Hubo un error al enviar tu sugerencia.')
  } finally {
    sendingSuggestion.value = false
  }
}

const clearChat = () => {
  messages.value = [{ 
    role: 'bot', 
    content: '¡Hola! Soy el asistente virtual de TiendaFer. ¿En qué puedo ayudarte hoy?' 
  }]
  sessionStorage.removeItem('chat_history')
}

const loadHistory = () => {
  const saved = sessionStorage.getItem('chat_history')
  if (saved) {
    messages.value = JSON.parse(saved)
  } else {
    clearChat()
  }
}

onMounted(() => {
  loadHistory()
})

watch(isOpen, (val) => {
  if (val) scrollToBottom()
})
</script>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Botón disparador */
.chat-trigger {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 22px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
}

.trigger-active {
  background: #1e293b;
  border-radius: 50%;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #6366f1;
  border-radius: 22px;
  animation: pulse 2s infinite;
  opacity: 0;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Ventana de chat */
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  transform-origin: bottom right;
}

@media (max-width: 450px) {
  .chat-window {
    width: calc(100vw - 48px);
    height: calc(100vh - 150px);
  }
}

/* Header */
.chat-header {
  background: #4f46e5;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.bot-avatar {
  font-size: 20px;
  background: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar-status {
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #4f46e5;
  border-radius: 50%;
}

/* Mensajes */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
}

.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.message-row {
  display: flex;
  width: 100%;
}

.user-row { justify-content: flex-end; }
.bot-row { justify-content: flex-start; }

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.bubble-bot {
  background: white;
  color: #1e293b;
  border-radius: 4px 20px 20px 20px;
  border: 1px solid #f1f5f9;
}

.bubble-user {
  background: #4f46e5;
  color: white;
  border-radius: 20px 20px 4px 20px;
}

/* Typing indicator */
.typing-bubble {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #cbd5e1;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Input area */
.chat-input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.input-container {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 20px;
}

.custom-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  color: #1e293b;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
.send-btn:hover:not(:disabled) { transform: scale(1.05); background: #4338ca; }

/* Quick Actions */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Formulario Sugerencia */
.suggestion-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  z-index: 10;
}

.suggestion-card {
  width: 100%;
  background: white;
  border-radius: 32px 32px 0 0;
  padding: 32px 24px;
}

.form-input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* Animaciones */
.chat-window-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-window-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.chat-window-slide-enter-from,
.chat-window-slide-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(100px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from { transform: translateY(100px); }
  to { transform: translateY(0); }
}
</style>
