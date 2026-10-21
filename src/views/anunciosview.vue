<template>
  <div class="space-y-6">
    
    <div class="fixed top-4 right-4 z-[60] space-y-2 pointer-events-none">
      <TransitionGroup name="list">
        <div v-for="toast in toasts" :key="toast.id"
          :class="['px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] pointer-events-auto border backdrop-blur-md',
            toast.type==='success'?'bg-emerald-50/90 border-emerald-200 text-emerald-900':'bg-red-50/90 border-red-200 text-red-900']">
          <i :class="toast.type==='success' ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-circle-xmark text-red-600'" class="text-lg"></i>
          <span class="text-sm font-semibold flex-1">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="opacity-50 hover:opacity-100 text-lg">×</button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Sticky Header & Controls -->
    <div class="sticky -top-4 lg:-top-8 z-20 bg-gray-50/95 backdrop-blur-xs -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 lg:pt-8 pb-3 border-b border-[#DDE3DE] space-y-3 shadow-xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-[#202723] tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-bullhorn text-[#245C4F]"></i> Marquesina de Anuncios
          </h1>
          <p class="text-[#68736C] font-medium text-sm">Impulsa tus ventas con promociones en tiempo real</p>
        </div>
        <button @click="abrirModal()"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#245C4F] text-white font-bold rounded-xl hover:bg-[#1D4A3F] hover:shadow-md transition-all active:scale-95 text-sm">
          <i class="fa-solid fa-plus"></i> Nuevo anuncio
        </button>
      </div>

      <!-- Filtros Tab Bar -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button v-for="f in filtros" :key="f.key" @click="filtroActivo=f.key"
          :class="['px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap border',
            filtroActivo===f.key ? 'bg-[#245C4F] text-white border-[#245C4F] shadow-xs' : 'bg-white text-[#68736C] border-[#DDE3DE] hover:border-[#245C4F]/40 hover:text-[#202723]']">
          {{ f.label }}
          <span :class="['ml-1.5 px-1.5 py-0.5 rounded-md text-[10px]', filtroActivo===f.key ? 'bg-white/20' : 'bg-gray-100']">
            {{ contarFiltro(f.key) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Vista previa Marquesita -->
    <div class="bg-white rounded-2xl shadow-sm border border-[#DDE3DE] overflow-hidden group">
      <div class="px-5 py-3.5 border-b border-[#DDE3DE] flex items-center justify-between bg-white">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 class="font-bold text-[#202723] text-xs uppercase tracking-wider">Vista previa en tiempo real</h3>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 p-1 rounded-xl">
             <button @click="previewTipo = 'cliente'" 
               :class="['px-3 py-1 text-[9px] font-black rounded-lg transition-all', 
                 previewTipo === 'cliente' ? 'bg-white text-[#245C4F] shadow-xs' : 'text-gray-400 hover:text-gray-600']">
               CLIENTES
             </button>
             <button @click="previewTipo = 'interno'"
               :class="['px-3 py-1 text-[9px] font-black rounded-lg transition-all', 
                 previewTipo === 'interno' ? 'bg-white text-[#245C4F] shadow-xs' : 'text-gray-400 hover:text-gray-600']">
               MENÚ DIGITAL
             </button>
          </div>
          <div class="flex gap-1.5 border-l border-[#DDE3DE] pl-4">
            <div v-for="v in ['dark', 'light', 'color', 'amber']" :key="v" 
              @click="previewVariant = v"
              :class="['w-4 h-4 rounded-full cursor-pointer border transition-all hover:scale-110', 
                previewVariant === v ? 'ring-2 ring-offset-2 ring-[#245C4F]' : 'border-gray-200']"
              :style="{ backgroundColor: v === 'dark' ? '#030712' : v === 'amber' ? '#f59e0b' : v === 'color' ? '#245C4F' : '#f8fafc' }">
            </div>
          </div>
        </div>
      </div>
      <MarquesitaWidget 
        :api-url="API_URL" 
        :get-headers="getHeaders" 
        :tipo="previewTipo" 
        :variant="previewVariant" 
        :restaurante-id="restauranteId"
      />
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <div class="w-10 h-10 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-medium text-sm">Sincronizando anuncios...</p>
    </div>

    <div v-else-if="anunciosFiltrados.length === 0" class="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-[#DDE3DE]">
      <i class="fa-solid fa-inbox text-5xl text-gray-300 block mb-3"></i>
      <h3 class="text-lg font-bold text-[#202723]">No hay anuncios aquí</h3>
      <p class="text-[#68736C] text-sm max-w-xs mx-auto mt-1">Crea un nuevo anuncio para empezar a mostrar promociones en tu marquesina.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="a in anunciosFiltrados" :key="a.id"
        class="group bg-white rounded-2xl shadow-sm border border-[#DDE3DE] transition-all hover:shadow-md hover:border-[#245C4F]/30"
        :class="a.vigente ? '' : 'opacity-75 grayscale-[0.3]'">
        
        <div class="p-4 flex items-center justify-between border-b border-[#DDE3DE]"
          :class="`bg-${a.color || 'indigo'}-50/50` ">
          <div class="flex items-center gap-3">
            <span class="text-2xl drop-shadow-sm">{{ a.emoji || '📢' }}</span>
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md block w-fit mb-1"
                :class="`bg-${a.color || 'indigo'}-100 text-${a.color || 'indigo'}-700` ">
                {{ a.tipo }}
              </span>
              <div class="flex gap-1">
                 <span v-if="a.mostrar_cliente" class="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#DDE3DE] text-[#68736C]">CLIENTES</span>
                 <span v-if="a.mostrar_interno" class="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#DDE3DE] text-[#68736C] uppercase">MENÚ DIGITAL</span>
              </div>
            </div>
          </div>
          <button @click="toggleActivo(a)" 
            :title="a.activo ? 'Desactivar anuncio' : 'Activar anuncio'"
            :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs', 
              a.activo ? 'bg-emerald-50 text-emerald-600 hover:scale-105 border border-emerald-200' : 'bg-gray-100 text-gray-400 hover:text-gray-600 border border-gray-200']">
            <i class="fa-solid fa-power-off text-sm"></i>
          </button>
        </div>
        
        <div class="p-5">
          <img v-if="a.imagen_url" :src="resolveImageUrl(a.imagen_url)" :alt="a.titulo"
            class="w-full h-32 object-cover rounded-xl mb-3 border border-[#DDE3DE]" />
          <h4 class="font-bold text-[#202723] text-base leading-tight mb-1">{{ a.titulo }}</h4>
          <p v-if="a.contenido" class="text-sm text-[#68736C] line-clamp-2">{{ a.contenido }}</p>
          
          <div v-if="a.producto || a.paquete" class="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-[#DDE3DE] group-hover:bg-[#E8F1ED]/30 transition-colors">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-[#DDE3DE] shadow-xs flex items-center justify-center">
               <img v-if="(a.producto || a.paquete).imagen_url" :src="resolveImageUrl((a.producto || a.paquete).imagen_url)" :alt="(a.producto || a.paquete).nombre || 'Imagen'" class="w-full h-full object-cover" />
               <i v-else class="fa-solid fa-utensils text-gray-300 text-base"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-gray-200 text-[#202723]">{{ a.paquete ? 'COMBO' : 'PLATO' }}</span>
                <p class="text-xs font-bold text-[#202723] truncate uppercase">{{ (a.producto || a.paquete).nombre }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[#245C4F] bg-[#E8F1ED] px-1.5 py-0.5 rounded" v-if="a.precio_promo">${{ Number(a.precio_promo).toFixed(2) }}</span>
                <span class="text-[10px] text-gray-400 line-through">antes {{ (a.producto || a.paquete).precio_formateado || '$' + (a.producto || a.paquete).precio }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-5 pt-3 border-t border-[#DDE3DE] flex items-center justify-between">
            <div class="text-[10px] font-semibold text-[#68736C] flex flex-col uppercase tracking-tighter">
               <span><span class="text-emerald-600 font-bold">Inicia:</span> {{ a.fecha_inicio ? formatFechaCorta(a.fecha_inicio) : 'Inmediato' }}</span>
               <span><span class="text-rose-600 font-bold">Finaliza:</span> {{ a.fecha_fin ? formatFechaCorta(a.fecha_fin) : 'Indefinido' }}</span>
               <span v-if="formatoDias(a.dias_semana)" class="mt-0.5">
                 <span class="text-[#245C4F] font-bold">Días:</span> {{ formatoDias(a.dias_semana) }}
               </span>
            </div>
            <div class="flex gap-1.5">
              <button @click="abrirModal(a)" title="Editar" class="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#245C4F] hover:text-white transition-all flex items-center justify-center border border-[#DDE3DE]">
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button @click="eliminar(a.id)" title="Eliminar" class="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#B93838] hover:text-white transition-all flex items-center justify-center border border-[#DDE3DE]">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" @click="showModal=false"></div>
        
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[92vh] border border-[#DDE3DE]">
          <div class="p-5 border-b border-[#DDE3DE] flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h3 class="text-xl font-bold text-[#202723] flex items-center gap-2">
                <i class="fa-solid fa-bullhorn text-[#245C4F]"></i> {{ editando ? 'Editar Anuncio' : 'Crear Anuncio' }}
              </h3>
              <p class="text-xs text-[#68736C]">Configura cómo se verá tu mensaje en las pantallas</p>
            </div>
            <button @click="showModal=false" class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto space-y-6">
            <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-red-600"></i> {{ formError }}
            </div>
            
            <section>
              <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-2 ml-1">¿Qué tipo de anuncio es?</label>
              <div class="grid grid-cols-4 gap-3">
                <button v-for="t in tipos" :key="t.value" @click="form.tipo=t.value; form.emoji=t.emoji"
                  :class="['p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5',
                    form.tipo===t.value ? 'border-[#245C4F] bg-[#E8F1ED] shadow-xs' : 'border-[#DDE3DE] hover:border-[#245C4F]/40']">
                  <span class="text-2xl">{{ t.emoji }}</span>
                  <span :class="['text-[10px] font-bold tracking-wider', form.tipo===t.value ? 'text-[#245C4F]' : 'text-[#68736C]']">{{ t.label }}</span>
                </button>
              </div>
            </section>
            
            <section class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div class="sm:col-span-3">
                <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-1.5 ml-1">Título del Mensaje</label>
                <input v-model="form.titulo" type="text" placeholder="Ej: ¡Happy Hour Activado!"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-[#DDE3DE] rounded-xl focus:bg-white focus:border-[#245C4F] transition-all outline-none font-bold text-[#202723] text-sm" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-1.5 ml-1 text-center">Emoji</label>
                <input v-model="form.emoji" type="text" class="w-full py-2.5 bg-gray-50 border border-[#DDE3DE] rounded-xl text-center text-xl focus:bg-white focus:border-[#245C4F] transition-all outline-none" />
              </div>
            </section>
            
            <section>
              <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-1.5 ml-1">Contenido (Opcional)</label>
              <textarea v-model="form.contenido" rows="2" placeholder="Describe brevemente la oferta..."
                class="w-full px-4 py-2.5 bg-gray-50 border border-[#DDE3DE] rounded-xl focus:bg-white focus:border-[#245C4F] transition-all outline-none text-sm text-[#202723] resize-none"></textarea>
            </section>

            <section>
              <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-1.5 ml-1">Imagen (Opcional)</label>
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-[#DDE3DE] flex items-center justify-center shrink-0">
                  <img v-if="imagenPreview" :src="imagenPreview" alt="Vista previa" class="w-full h-full object-cover" />
                  <i v-else class="fa-solid fa-image text-2xl text-gray-300"></i>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="px-3.5 py-2 text-xs font-bold text-[#245C4F] bg-[#E8F1ED] rounded-xl cursor-pointer hover:bg-[#245C4F] hover:text-white transition text-center border border-[#245C4F]/20">
                    {{ imagenPreview ? 'Cambiar imagen' : 'Subir imagen' }}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" @change="onImagenChange" />
                  </label>
                  <button v-if="imagenPreview" type="button" @click="quitarImagen"
                    class="px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition border border-red-200">
                    Quitar imagen
                  </button>
                  <p class="text-[10px] text-gray-400 font-medium">JPG, PNG o WebP · máx. 2 MB</p>
                </div>
              </div>
            </section>
            
            <section class="flex flex-wrap items-center justify-between gap-6">
              <div>
                <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-2 ml-1">Color de Énfasis</label>
                <div class="flex gap-2.5">
                  <button v-for="c in colores" :key="c.value" @click="form.color=c.value"
                    :class="['w-7 h-7 rounded-full border-2 transition-all shadow-xs', 
                      c.bg, form.color===c.value ? 'border-white ring-2 ring-[#245C4F] scale-110' : 'border-transparent hover:scale-105']">
                  </button>
                </div>
              </div>
              <div class="w-32">
                <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider mb-1.5 ml-1">Orden / Prioridad</label>
                <input v-model="form.orden" type="number" class="w-full px-3 py-1.5 bg-gray-50 rounded-xl font-bold text-center border border-[#DDE3DE] focus:border-[#245C4F] outline-none text-sm" />
              </div>
            </section>

            <section class="p-4 bg-[#E8F1ED]/40 rounded-2xl border border-[#DDE3DE]">
              <div class="flex items-center gap-2 mb-3">
                <i class="fa-solid fa-utensils text-[#245C4F]"></i>
                <label class="text-xs font-bold text-[#245C4F] uppercase tracking-wider">Vincular a un platillo / combo</label>
              </div>
              
              <div class="relative product-selector">
                <button type="button" @click="dropdownOpen = !dropdownOpen"
                  class="w-full px-4 py-3 text-left border border-[#DDE3DE] rounded-xl bg-white flex items-center justify-between shadow-xs hover:border-[#245C4F]/40 transition-all">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <template v-if="selectedItem">
                      <img v-if="selectedItem.imagen_url" :src="resolveImageUrl(selectedItem.imagen_url)" :alt="selectedItem.nombre || 'Imagen'" class="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-100" />
                      <i v-else class="fa-solid fa-utensils text-gray-400 text-sm"></i>
                      <div class="min-w-0">
                        <p class="font-bold text-[#202723] text-xs truncate uppercase">
                          <span class="text-[8px] px-1 bg-gray-100 rounded mr-1">{{ selectedItem.es_paquete ? 'COMBO' : 'PLATO' }}</span>
                          {{ selectedItem.nombre }}
                        </p>
                        <p class="text-[10px] text-[#245C4F] font-bold">{{ selectedItem.precio_formateado || '$' + selectedItem.precio }}</p>
                      </div>
                    </template>
                    <span v-else class="text-gray-400 font-medium text-xs px-1">¿Quieres asociar un producto o combo?</span>
                  </div>
                  <i :class="dropdownOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="text-xs text-gray-400 mr-1"></i>
                </button>
                
                <div v-if="dropdownOpen" class="absolute z-50 w-full mt-2 bg-white border border-[#DDE3DE] rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                  <div class="p-2.5 border-b border-[#DDE3DE] bg-gray-50/50">
                    <input v-model="searchTerm" type="text" placeholder="Escribe para buscar..." 
                      class="w-full px-3 py-1.5 text-xs border border-[#DDE3DE] bg-white rounded-lg outline-none focus:border-[#245C4F] font-medium" @click.stop />
                  </div>
                  <div class="overflow-y-auto flex-1 custom-scrollbar">
                    <div v-for="p in itemsFiltrados" :key="p.uid" @click="seleccionarItem(p)"
                      class="p-3 hover:bg-[#E8F1ED]/40 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors">
                      <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" :alt="p.nombre || 'Producto'" class="w-9 h-9 rounded-lg object-cover border border-[#DDE3DE] bg-gray-100" />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                          <span :class="['text-[8px] font-bold px-1 py-0.5 rounded', p.es_paquete ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700']">
                            {{ p.es_paquete ? 'COMBO' : 'PLATO' }}
                          </span>
                          <p class="text-xs font-bold text-[#202723] truncate uppercase">{{ p.nombre }}</p>
                        </div>
                        <p class="text-[10px] text-[#245C4F] font-bold">{{ p.precio_formateado || '$' + p.precio }}</p>
                      </div>
                    </div>
                  </div>
                  <button v-if="form.producto_id || form.paquete_id" @click="form.producto_id=null; form.paquete_id=null; dropdownOpen=false" class="w-full py-2.5 bg-red-50 text-red-600 text-[10px] font-bold hover:bg-red-100 tracking-wider">QUITAR VÍNCULO</button>
                </div>
              </div>
              
              <div v-if="form.producto_id || form.paquete_id" class="mt-4">
                <label class="block text-[10px] font-bold text-[#245C4F] uppercase tracking-wider mb-2 ml-1">Nuevo Precio Promocional</label>
                <div class="flex items-center gap-4 bg-white p-3 rounded-xl shadow-xs border border-[#DDE3DE]">
                  <span class="text-gray-400 line-through font-bold text-base leading-none">{{ selectedItem?.precio_formateado || '$' + selectedItem?.precio }}</span>
                  <div class="flex-1 relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-[#245C4F] font-bold text-lg">$</span>
                    <input v-model="form.precio_promo" type="number" step="0.01" 
                      class="w-full pl-5 bg-transparent text-[#245C4F] text-xl font-black outline-none"
                      placeholder="0.00" />
                  </div>
                </div>
              </div>
            </section>

            <section class="space-y-3 pt-1">
              <label class="block text-[10px] font-bold text-[#68736C] uppercase tracking-wider ml-1">Mostrar anuncio en:</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-[#DDE3DE] hover:border-[#245C4F]/40 transition-all">
                  <input v-model="form.mostrar_cliente" type="checkbox" class="w-4 h-4 rounded-md accent-[#245C4F]" />
                  <span class="font-bold text-[#202723] text-xs group-hover:text-[#245C4F] flex items-center gap-1.5">
                    <i class="fa-solid fa-mobile-screen text-[#245C4F]"></i> App Clientes
                  </span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-[#DDE3DE] hover:border-[#245C4F]/40 transition-all">
                  <input v-model="form.mostrar_interno" type="checkbox" class="w-4 h-4 rounded-md accent-[#245C4F]" />
                  <span class="font-bold text-[#202723] text-xs group-hover:text-[#245C4F] flex items-center gap-1.5">
                    <i class="fa-solid fa-desktop text-[#245C4F]"></i> Menú Digital
                  </span>
                </label>
              </div>
            </section>

            <section class="pt-1">
              <CalendarioVigencia
                v-model:inicio="form.fecha_inicio"
                v-model:fin="form.fecha_fin"
                :dias="form.dias_semana"
                @update:dias="form.dias_semana = $event"
              />
            </section>
          </div>
          
          <div class="p-4 border-t border-[#DDE3DE] flex gap-3 bg-gray-50/50 sticky bottom-0">
            <button @click="showModal=false"
              class="flex-1 py-3 text-xs font-bold text-[#68736C] bg-white rounded-xl hover:bg-gray-100 transition-all uppercase tracking-wider border border-[#DDE3DE]">Cancelar</button>
            <button @click="guardar" :disabled="guardando"
              class="flex-1 py-3 text-xs font-bold text-white bg-[#245C4F] rounded-xl hover:bg-[#1D4A3F] shadow-xs transition-all uppercase tracking-wider disabled:opacity-50 active:scale-95">
              {{ guardando ? 'Guardando...' : 'Publicar Anuncio' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MarquesitaWidget from '../components/MarquesitaWidget.vue'
import CalendarioVigencia from '../components/CalendarioVigencia.vue'
import { API_URL, STORAGE_URL, resolveImageUrl } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

// Formatea una fecha (yyyy-mm-dd o ISO) en formato corto tipo "6 ago 2026"
const formatFechaCorta = (fecha) => {
  if (!fecha) return ''
  const d = new Date(String(fecha).replace(' ', 'T'))
  if (isNaN(d)) return fecha
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Convierte [0..6] a "Dom, Jue, Sáb"
const NOMBRES_DIA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const formatoDias = (dias) => {
  if (!Array.isArray(dias) || dias.length === 0) return ''
  return dias.map(d => NOMBRES_DIA_CORTOS[Number(d)]).join(', ')
}

// --- ESTADO ---
const anuncios = ref([])
const productos = ref([])
const paquetes = ref([])
const loading = ref(false)
const guardando = ref(false)
const toasts = ref([])
const showModal = ref(false)
const editando = ref(null)
const formError = ref('')
const filtroActivo = ref('todos')
const dropdownOpen = ref(false)
const searchTerm = ref('')
const previewVariant = ref(localStorage.getItem('marquesina_variant') || 'dark')
const previewTipo = ref('interno')

const imagenFile    = ref(null)
const imagenPreview = ref('')
const eliminarImagen = ref(false)

const onImagenChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    formError.value = 'La imagen no debe pesar más de 2 MB'
    return
  }
  formError.value = ''
  imagenFile.value = file
  eliminarImagen.value = false
  imagenPreview.value = URL.createObjectURL(file)
}

const quitarImagen = () => {
  imagenFile.value = null
  imagenPreview.value = ''
  eliminarImagen.value = true
}

// Si hay imagen nueva o se quitó la actual, se manda FormData; si no, JSON sin campo imagen
const buildPayload = () => {
  if (!imagenFile.value && !eliminarImagen.value) {
    const data = { ...form.value }
    delete data.imagen
    delete data.imagen_url
    return data
  }

  const fd = new FormData()
  const nulables = ['producto_id', 'paquete_id', 'precio_promo', 'fecha_inicio', 'fecha_fin']
  Object.entries(form.value).forEach(([k, v]) => {
    if (['imagen', 'imagen_url', 'producto', 'paquete'].includes(k)) return
    if (v === null || v === undefined) {
      if (nulables.includes(k)) fd.append(k, '')   // Laravel lo convierte en null
      return
    }
    if (Array.isArray(v)) {
      if (v.length === 0) fd.append(`${k}[]`, '')  // Vaciar array
      else v.forEach(x => fd.append(`${k}[]`, x))
    }
    else if (typeof v === 'object') return
    else if (typeof v === 'boolean') fd.append(k, v ? 1 : 0)
    else fd.append(k, v)
  })
  if (imagenFile.value) fd.append('imagen', imagenFile.value)
  if (eliminarImagen.value) fd.append('eliminar_imagen', 1)
  return fd
}

watch(previewVariant, (newVal) => {
  localStorage.setItem('marquesina_variant', newVal)
})

// Variable reactiva para el ID del restaurante - esto asegura que el Widget se entere del cambio
const restauranteId = ref(sessionGet('restaurante_id_activo'))

// Si no hay id activo, intentamos sacar el del usuario
if (!restauranteId.value) {
  const userRaw = sessionGet('user') ?? '{}'
  try {
    restauranteId.value = JSON.parse(userRaw)?.restaurante_id || null
  } catch { restauranteId.value = null }
}

// Cronómetro para detectar cambios de sucursal en el header (localStorage no es reactivo por sí solo)
const checkRestaurante = setInterval(() => {
  const currentId = sessionGet('restaurante_id_activo')
  if (currentId && currentId !== restauranteId.value) {
    restauranteId.value = currentId
    cargar()
    cargarProductos()
    cargarPaquetes()
  }
}, 1000)

const lastRestId = ref(restauranteId.value)

// --- AUTH HEADERS ---
const getHeaders = () => {
  const token = sessionGet('token')
  return { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': token ? `Bearer ${token}` : '' 
  }
}

// --- CONFIGURACIÓN UI ---
const tipos = [
  { value: 'info', label: 'INFO', emoji: 'ℹ️' },
  { value: 'promo', label: 'PROMO', emoji: '🎉' },
  { value: 'alerta', label: 'ALERTA', emoji: '⚠️' },
  { value: 'producto', label: 'PLATO', emoji: '🍽️' },
]

const colores = [
  { value: 'indigo', bg: 'bg-indigo-500' },
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'amber', bg: 'bg-amber-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'blue', bg: 'bg-blue-500' },
  { value: 'purple', bg: 'bg-purple-500' },
]

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'En vivo' },
  { key: 'cliente', label: 'Clientes' },
  { key: 'interno', label: 'Menú Digital' },
  { key: 'promo', label: 'Promos' },
]

// --- FORMULARIO ---
const defaultForm = () => ({
  titulo: '', contenido: '', tipo: 'info', emoji: '📢', color: 'indigo',
  mostrar_cliente: true, mostrar_interno: false,
  fecha_inicio: '', fecha_fin: '', dias_semana: [], orden: 0,
  producto_id: null, paquete_id: null, precio_promo: null, activo: true
})
const form = ref(defaultForm())

// --- COMPUTED ---
const selectedItem = computed(() => {
  if (form.value.producto_id) return productos.value.find(p => p.id === form.value.producto_id)
  if (form.value.paquete_id) return paquetes.value.find(p => p.id === form.value.paquete_id)
  return null
})

const itemsFiltrados = computed(() => {
  const term = searchTerm.value.toLowerCase()
  const pList = productos.value.map(p => ({ ...p, es_paquete: false, uid: `p-${p.id}` }))
  const qList = paquetes.value.map(q => ({ ...q, es_paquete: true, uid: `q-${q.id}` }))
  
  return [...pList, ...qList].filter(i => 
    i.nombre.toLowerCase().includes(term) ||
    (i.categoria?.nombre || '').toLowerCase().includes(term)
  ).slice(0, 15)
})

const anunciosFiltrados = computed(() => {
  let list = anuncios.value
  if (filtroActivo.value === 'activos') list = list.filter(a => a.vigente)
  if (filtroActivo.value === 'cliente') list = list.filter(a => a.mostrar_cliente)
  if (filtroActivo.value === 'interno') list = list.filter(a => a.mostrar_interno)
  if (filtroActivo.value === 'promo') list = list.filter(a => ['promo','producto'].includes(a.tipo))
  return list
})

const contarFiltro = (key) => {
  if (key === 'todos') return anuncios.value.length
  if (key === 'activos') return anuncios.value.filter(a => a.vigente).length
  if (key === 'cliente') return anuncios.value.filter(a => a.mostrar_cliente).length
  if (key === 'interno') return anuncios.value.filter(a => a.mostrar_interno).length
  if (key === 'promo') return anuncios.value.filter(a => ['promo','producto'].includes(a.tipo)).length
  return 0
}

// --- MÉTODOS ---
const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const seleccionarItem = (item) => {
  if (item.es_paquete) {
    form.value.paquete_id = item.id
    form.value.producto_id = null
  } else {
    form.value.producto_id = item.id
    form.value.paquete_id = null
  }
  form.value.precio_promo = item.precio
  dropdownOpen.value = false
  searchTerm.value = ''
}

const cargarPaquetes = async () => {
  try {
    const data = await apiClient.get('/paquetes')
    if (data.success) paquetes.value = data.data
  } catch (err) { console.error('Error paquetes:', err) }
}

const cargarProductos = async () => {
  try {
    const data = await apiClient.get('/productos?per_page=150')
    if (data.success) productos.value = data.data
  } catch (err) { console.error('Error productos:', err) }
}

const cargar = async () => {
  loading.value = true
  try {
    if (!restauranteId.value) {
      const restData = await apiClient.get('/restaurantes')
      if (restData.success && restData.data.restaurante_activo) {
        restauranteId.value = restData.data.restaurante_activo.id
      }
    }

    const data = await apiClient.get('/admin/anuncios')
    if (data.success) {
      const hoy = new Date()
      anuncios.value = data.data.map(a => {
        const dias = Array.isArray(a.dias_semana) ? a.dias_semana.map(Number) : []
        let esVigente = a.activo
        if (dias.length > 0 && !dias.includes(hoy.getDay())) esVigente = false
        if (a.fecha_inicio) {
          const inicio = new Date(a.fecha_inicio)
          if (hoy < inicio) esVigente = false
        }
        if (a.fecha_fin) {
          const fin = new Date(a.fecha_fin)
          fin.setHours(23, 59, 59, 999) // Hacer fin de día inclusivo
          if (hoy > fin) esVigente = false
        }
        return { ...a, dias_semana: dias, vigente: esVigente }
      })
    }
  } catch (err) {
    showToast('Error al conectar con el servidor', 'error')
  } finally { loading.value = false }
}

const abrirModal = (a = null) => {
  editando.value = a
  formError.value = ''
  dropdownOpen.value = false
  searchTerm.value = ''

  imagenFile.value = null
  eliminarImagen.value = false
  imagenPreview.value = a?.imagen_url ? resolveImageUrl(a.imagen_url) : ''
  
  if (a) {
    form.value = { ...defaultForm(), ...a }
    // Normalizar días de la semana a números
    form.value.dias_semana = Array.isArray(a.dias_semana) ? a.dias_semana.map(Number) : []
    // Asignar IDs de producto o paquete vinculados
    if (a.producto_id) form.value.producto_id = a.producto_id
    else if (a.producto && a.producto.id) form.value.producto_id = a.producto.id

    if (a.paquete_id) form.value.paquete_id = a.paquete_id
    else if (a.paquete && a.paquete.id) form.value.paquete_id = a.paquete.id
    // Formatear fechas para input type="date"
    if(a.fecha_inicio) form.value.fecha_inicio = a.fecha_inicio.split(' ')[0]
    if(a.fecha_fin) form.value.fecha_fin = a.fecha_fin.split(' ')[0]
  } else {
    form.value = defaultForm()
  }
  showModal.value = true
}

const guardar = async () => {
  if (!form.value.titulo) return formError.value = 'El título es requerido'
  
  guardando.value = true
  try {
    const payload = buildPayload()
    const data = editando.value
      ? (payload instanceof FormData
          ? (payload.append('_method', 'PUT'), await apiClient.post(`/admin/anuncios/${editando.value.id}`, payload))
          : await apiClient.put(`/admin/anuncios/${editando.value.id}`, payload))
      : await apiClient.post('/admin/anuncios', payload)
    
    if (data.success) {
      showToast(editando.value ? '¡Anuncio actualizado!' : '¡Anuncio publicado correctamente!', 'success')
      showModal.value = false
      cargar()
    } else {
      formError.value = data.message || 'Error al guardar el anuncio'
    }
  } catch (err) {
    formError.value = 'Fallo de conexión con el servidor'
  } finally { guardando.value = false }
}

const toggleActivo = async (a) => {
  try {
    const data = await apiClient.put(`/admin/anuncios/${a.id}`, { activo: !a.activo })
    if (data.success) {
      showToast(a.activo ? 'Anuncio pausado' : 'Anuncio activado con éxito')
      cargar()
    }
  } catch (err) { showToast('Error de red', 'error') }
}

const eliminar = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar este anuncio? Esta acción es permanente.')) return
  try {
    const data = await apiClient.delete(`/admin/anuncios/${id}`)
    if (data.success) {
      showToast('Anuncio eliminado del sistema')
      cargar()
    }
  } catch (err) { showToast('Error al eliminar', 'error') }
}

const handleClickOutside = (e) => {
  if (dropdownOpen.value && !e.target.closest('.product-selector')) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  cargar()
  cargarProductos()
  cargarPaquetes()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  clearInterval(checkRestaurante)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Animaciones */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.3s ease-out forwards; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
</style>