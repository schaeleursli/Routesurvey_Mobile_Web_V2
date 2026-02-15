<template>
  <div class="pdf-viewer-layout" ref="viewerContainer">
    <div v-if="loading && !pdfDocument" class="pdf-loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">Loading Document...</div>
    </div>
    <div v-else-if="error" class="pdf-error-overlay">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>{{ error }}</span>
      <BaseButton variant="secondary" class="mt-3" @click="closeViewer">Close</BaseButton>
    </div>
    <template v-else>
      <!-- Toolbar -->
      <div class="pdf-toolbar">
        <div class="toolbar-left">
          <BaseButton variant="ghost" size="small" @click="toggleSidebar" :title="showSidebar ? 'Hide Sidebar' : 'Show Sidebar'">
            <i class="bi" :class="showSidebar ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'"></i>
          </BaseButton>
          <div class="toolbar-divider"></div>
          <span class="doc-title">{{ title || 'Report' }}</span>
        </div>
        <div class="toolbar-center">
          <BaseButton variant="ghost" size="small" @click="prevPage" :disabled="currentPage <= 1" title="Previous Page">
            <i class="bi bi-chevron-left"></i>
          </BaseButton>
          <span class="page-indicator">
            <input type="number" v-model.lazy="pageInput" @change="jumpToPage" min="1" :max="numOfPages" class="page-input" />
            <span class="page-count">/ {{ numOfPages }}</span>
          </span>
          <BaseButton variant="ghost" size="small" @click="nextPage" :disabled="currentPage >= numOfPages" title="Next Page">
            <i class="bi bi-chevron-right"></i>
          </BaseButton>
          <div class="toolbar-divider"></div>
          <BaseButton variant="ghost" size="small" @click="zoomOut" title="Zoom Out">
            <i class="bi bi-dash-lg"></i>
          </BaseButton>
          <span class="zoom-indicator">{{ Math.round(scale * 100) }}%</span>
          <BaseButton variant="ghost" size="small" @click="zoomIn" title="Zoom In">
            <i class="bi bi-plus-lg"></i>
          </BaseButton>
          <BaseButton variant="ghost" size="small" @click="fitToWidth" title="Fit to Width">
            <i class="bi bi-arrows-expand-vertical"></i>
          </BaseButton>
        </div>
        <div class="toolbar-right">
          <BaseButton variant="ghost" size="small" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
            <i class="bi" :class="isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i>
          </BaseButton>
          <div class="toolbar-divider"></div>
          <BaseButton variant="primary" size="small" @click="downloadPdf" left-icon="bi bi-download" class="download-btn">
            <span class="btn-label">Download</span>
          </BaseButton>
          <BaseButton variant="ghost" size="small" @click="printPdf" title="Print">
            <i class="bi bi-printer"></i>
          </BaseButton>
          <div class="toolbar-divider"></div>
          <BaseButton variant="ghost" size="small" @click="closeViewer" title="Close" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </BaseButton>
        </div>
      </div>
      <!-- Main Body -->
      <div class="pdf-body">
        <!-- Sidebar (Thumbnails) -->
        <div class="pdf-sidebar" :class="{ collapsed: !showSidebar }">
          <div class="sidebar-header"><span>Pages</span></div>
          <div class="thumbnails-container">
            <div v-for="page in numOfPages" :key="page" class="thumbnail-item" :id="'thumbnail-' + page" :class="{ active: currentPage === page }" @click="goToPage(page)">
              <div class="thumbnail-preview">
                <VuePdf :src="pdfSrc" :page="page" :scale="0.2" />
              </div>
              <span class="thumbnail-label">{{ page }}</span>
            </div>
          </div>
        </div>
        <!-- Main Content (Pages) -->
        <div class="pdf-content" ref="pdfContentRef">
          <div class="pdf-pages-container" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">
            <div v-for="page in numOfPages" :key="page" class="pdf-page-wrapper" :id="'page-' + page" :class="{ active: currentPage === page }">
              <VuePdf :src="pdfSrc" :page="page" :scale="1" :enable-text-selection="true" @click="handlePageClick(page)" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({
  pdfUrl: { type: String, required: true },
  title: { type: String, default: '' },
  downloadUrl: { type: String, default: '' }
});

const router = useRouter();

// State
const viewerContainer = ref(null);
const loading = ref(true);
const error = ref('');
const pdfSrc = ref(null);
const pdfDocument = ref(null);
const numOfPages = ref(0);
const currentPage = ref(1);
const pageInput = ref(1);
const scale = ref(1.0);
const showSidebar = ref(true);
const isFullscreen = ref(false);
const documentTitle = ref(props.title || 'Report');

function loadPdf(url) {
  if (!url || !url.endsWith('.pdf')) {
    error.value = 'Invalid or missing PDF URL.';
    loading.value = false;
    return;
  }
  try {
    const loadingTask = createLoadingTask(url);
    pdfSrc.value = loadingTask;
    pdfDocument.value = loadingTask.promise;
    pdfDocument.value.then(doc => {
      numOfPages.value = doc.numPages;
      loading.value = false;
    }).catch(err => {
      console.error('Error loading PDF:', err);
      error.value = 'Failed to load PDF document.';
      loading.value = false;
    });
  } catch (e) {
    console.error(e);
    error.value = 'Failed to load PDF document.';
    loading.value = false;
  }
}

onMounted(() => {
  loadPdf(props.pdfUrl);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

watch(() => props.pdfUrl, (newUrl) => {
  loading.value = true;
  error.value = '';
  loadPdf(newUrl);
});

watch(currentPage, (val) => {
  pageInput.value = val;
  nextTick(() => {
    const thumb = document.getElementById('thumbnail-' + val);
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

function toggleSidebar() { showSidebar.value = !showSidebar.value; }
function prevPage() { if (currentPage.value > 1) goToPage(currentPage.value - 1); }
function nextPage() { if (currentPage.value < numOfPages.value) goToPage(currentPage.value + 1); }
function jumpToPage() { let p = parseInt(pageInput.value); if (p < 1) p = 1; if (p > numOfPages.value) p = numOfPages.value; goToPage(p); }
function goToPage(p) { currentPage.value = p; scrollToPage(p); }
function scrollToPage(p) { const el = document.getElementById('page-' + p); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function zoomIn() { scale.value = Math.min(scale.value + 0.1, 3.0); }
function zoomOut() { scale.value = Math.max(scale.value - 0.1, 0.5); }
function fitToWidth() { scale.value = 1.0; }
function handlePageClick(page) { currentPage.value = page; }
function downloadPdf() {
  const url = props.downloadUrl || props.pdfUrl;
  const link = document.createElement('a');
  link.href = url;
  link.download = documentTitle.value + '.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function printPdf() {
  const url = props.pdfUrl;
  const w = window.open(url, '_blank');
  if (w) w.print();
}
function closeViewer() { router.back(); }
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    viewerContainer.value?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
function handleFullscreenChange() { isFullscreen.value = !!document.fullscreenElement; }
</script>

<style scoped>
.pdf-viewer-layout { display: flex; flex-direction: column; height: 100%; width: 100%; min-height: calc(100vh - 64px); background-color: var(--bg-surface); overflow: hidden; }
.pdf-loading-overlay, .pdf-error-overlay { position: absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background: rgb(255 255 255 / 90%); z-index:100; }
.spinner { width:48px; height:48px; border:5px solid rgb(0 167 225 / 20%); border-top:5px solid var(--accent); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }

@keyframes spin { 0% { transform:rotate(0deg);} 100% { transform:rotate(360deg);} }
.pdf-toolbar { height:60px; background:white; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 16px; box-shadow:0 2px 4px rgb(0 0 0 / 5%); z-index:10; flex-shrink:0; }
.toolbar-left, .toolbar-center, .toolbar-right { display:flex; align-items:center; gap:8px; }
.toolbar-center { position:absolute; left:50%; transform:translateX(-50%); }
.toolbar-divider { width:1px; height:24px; background:var(--border); margin:0 4px; }
.doc-title { font-weight:600; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:14px; color:var(--text-primary); }
.page-indicator { display:flex; align-items:center; gap:4px; font-size:14px; color:var(--text-secondary); }
.page-input { width:40px; text-align:center; border:1px solid var(--border); border-radius:4px; padding:4px 0; background:var(--bg-surface); color:var(--text-primary); }
.zoom-indicator { min-width:48px; text-align:center; font-variant-numeric:tabular-nums; font-size:14px; color:var(--text-secondary); }
.pdf-body { flex:1; display:flex; overflow:hidden; position:relative; }
.pdf-sidebar { width:240px; background:#f8f9fa; border-right:1px solid var(--border); display:flex; flex-direction:column; transition:width 0.3s ease; flex-shrink:0; z-index:5; }
.pdf-sidebar.collapsed { width:0; overflow:hidden; border-right:none; }
.sidebar-header { padding:12px 16px; font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); border-bottom:1px solid var(--border); background:var(--bg-surface); }
.thumbnails-container { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:16px; }
.thumbnail-item { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; }
.thumbnail-preview { width:100%; aspect-ratio:0.707; background:white; box-shadow:0 2px 4px rgb(0 0 0 / 10%); border:2px solid transparent; border-radius:4px; overflow:hidden; transition:all 0.2s; position:relative; }
.thumbnail-item.active .thumbnail-preview { border-color:var(--accent); box-shadow:0 0 0 4px rgb(0 167 225 / 20%); }
.thumbnail-item:hover .thumbnail-preview { border-color:var(--accent); }
.thumbnail-label { font-size:12px; color:var(--text-secondary); }
.pdf-content { flex:1; overflow:auto; background:#525659; display:flex; justify-content:center; padding:24px; position:relative; }
.pdf-pages-container { display:flex; flex-direction:column; gap:24px; transition:transform 0.2s ease-out; }
.pdf-page-wrapper { background:white; box-shadow:0 4px 8px rgb(0 0 0 / 20%); margin:0 auto; }

@media (width <= 900px) { .pdf-sidebar { position:absolute; top:0; left:0; height:100%; z-index:20; box-shadow:4px 0 8px rgb(0 0 0 / 10%); } .toolbar-center { display:none; } .doc-title { max-width:150px; } .btn-label { display:none; } }
</style>
