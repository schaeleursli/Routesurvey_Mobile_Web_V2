<template>
  <div class="pdf-viewer-layout" ref="viewerContainer" tabindex="0">
    <div v-if="loading" class="pdf-loading-overlay">
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
          <span class="doc-title">{{ documentTitle || 'Route Report' }}</span>
        </div>

        <div class="toolbar-center">
          <BaseButton variant="ghost" size="small" @click="prevPage" :disabled="currentPage <= 1" title="Previous Page">
            <i class="bi bi-chevron-left"></i>
          </BaseButton>

          <span class="page-indicator">
            <input
              type="number"
              v-model.lazy="pageInput"
              @change="jumpToPage"
              min="1"
              :max="numPages"
              class="page-input"
            />
            <span class="page-count">/ {{ numPages }}</span>
          </span>

          <BaseButton variant="ghost" size="small" @click="nextPage" :disabled="currentPage >= numPages" title="Next Page">
            <i class="bi bi-chevron-right"></i>
          </BaseButton>

          <div class="toolbar-divider"></div>

          <BaseButton variant="ghost" size="small" @click="zoomOutClick" title="Zoom Out">
            <i class="bi bi-dash-lg"></i>
          </BaseButton>
          <span class="zoom-indicator">{{ Math.round(uiScale * 100) }}%</span>
          <BaseButton variant="ghost" size="small" @click="zoomInClick" title="Zoom In">
            <i class="bi bi-plus-lg"></i>
          </BaseButton>

          <BaseButton variant="ghost" size="small" @click="fitWidth" title="Fit to Width">
            <i class="bi bi-arrows-expand-vertical"></i>
          </BaseButton>
          
          <div class="toolbar-divider"></div>
          
          <!-- Search UI -->
          <!-- Search UI -->
          <div class="search-box">
            <input
              ref="searchInputEl"
              class="search-input"
              v-model="searchInput"
              placeholder="Search in PDF"
              @focus="openDropdown"
              @keydown.enter.prevent="onSearch"
            />
            <BaseButton variant="ghost" size="small" @click="onSearch" :disabled="searchBusy" title="Search">
              <i class="bi bi-search"></i>
            </BaseButton>
            <BaseButton variant="ghost" size="small" @click="onPrevMatch" :disabled="searchTotal === 0" title="Previous match">
              <i class="bi bi-arrow-up"></i>
            </BaseButton>
            <BaseButton variant="ghost" size="small" @click="onNextMatch" :disabled="searchTotal === 0" title="Next match">
              <i class="bi bi-arrow-down"></i>
            </BaseButton>
            <span class="search-count">
              <span v-if="searchBusy" class="indexing-text">Indx {{ searchProgress.done }}/{{ searchProgress.total }}</span>
              <span v-else>{{ searchTotal }} matches</span>
            </span>

            <!-- Dropdown -->
            <div v-if="showSearchDropdown" class="search-dropdown">
              <div v-if="!searchInput.trim()" class="search-empty">
                Type a term and press Enter.
              </div>

              <div v-else-if="searchBusy && searchMatches.length === 0" class="search-empty">
                Searching...
              </div>

              <div v-else-if="!searchBusy && searchMatches.length === 0" class="search-empty">
                No results.
              </div>

              <div v-else class="search-results">
                <button
                  v-for="r in searchMatches"
                  :key="r.page"
                  class="search-result"
                  @click="jumpToResult(r.page)"
                >
                  <div class="search-result-top">
                    <span class="sr-page">Page {{ r.page }}</span>
                    <span class="sr-count">{{ r.count }}</span>
                  </div>
                  <div class="sr-snippet">{{ r.snippet }}</div>
                </button>
              </div>
            </div>
          </div>
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
        <!-- Sidebar -->
        <div class="pdf-sidebar" :class="{ collapsed: !showSidebar }">
          <div class="sidebar-header">
            <div class="sidebar-tabs">
              <button class="sidebar-tab" :class="{ active: activeSidebarTab === 'thumbnails' }" @click="activeSidebarTab = 'thumbnails'">
                Pages
              </button>
              <button class="sidebar-tab" :class="{ active: activeSidebarTab === 'outline' }" @click="activeSidebarTab = 'outline'" :disabled="flatOutline.length === 0">
                Outline
              </button>
            </div>
          </div>

          <div v-if="activeSidebarTab === 'thumbnails'" class="thumbnails-container" ref="thumbsRef">
            <div
              v-for="p in numPages"
              :key="p"
              class="thumbnail-item"
              :id="'thumbnail-' + p"
              :class="{ active: currentPage === p }"
              @click="goToPage(p)"
              ref="thumbItems"
            >
              <div class="thumbnail-preview">
                <PdfCanvas
                  :page="p"
                  :enabled="thumbEnabled[p] === true"
                  :render="renderThumbnail"
                  :skeleton="true"
                />
              </div>
              <span class="thumbnail-label">{{ p }}</span>
            </div>
          </div>

          <div v-else class="outline-container">
            <div v-if="flatOutline.length === 0" class="empty-outline">No table of contents found.</div>
            <ul v-else class="outline-list">
              <li v-for="(item, idx) in flatOutline" :key="idx" class="outline-item" @click="navigateTo(item)">
                <span class="outline-title" :style="{ paddingLeft: (item.level || 0) * 12 + 'px' }">
                  {{ item.title }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Content -->
        <div class="pdf-content" ref="pdfContentRef">
          <div class="pdf-pages-container" :style="isSmoothZooming ? { transform: `scale(${smoothZoomScale})`, transformOrigin: 'top center' } : {}">
            <div
              v-for="p in numPages"
              :key="p"
              class="pdf-page-wrapper"
              :id="'page-' + p"
              :class="{ active: currentPage === p }"
              ref="pageItems"
            >
              <PdfCanvas
                :page="p"
                :enabled="p >= renderWindow.start && p <= renderWindow.end"
                :render="renderPage"
                :skeleton="true"
                :renderKey="renderKey" 
                @click="currentPage = p"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import PdfCanvas from "@/components/pdf/PdfCanvas.vue";
import { usePdfProViewer } from "@/composables/usePdfProViewer";

const route = useRoute();
const router = useRouter();

const viewerContainer = ref<HTMLElement | null>(null);
const pdfContentRef = ref<HTMLElement | null>(null);
const thumbsRef = ref<HTMLElement | null>(null);

const showSidebar = ref(true);
const activeSidebarTab = ref<"thumbnails" | "outline">("thumbnails");
const isFullscreen = ref(false);

const pageInput = ref(1);
const documentTitle = ref("Route Report");

// Search & Zoom state
const searchInput = ref("");
const renderKey = ref(0);
const smoothZoomScale = ref(1.0);
const isSmoothZooming = ref(false);
let zoomTimer: number | null = null;

const {
  numPages,
  outline,
  loading,
  error,
  url,
  uiScale,
  currentPage,
  renderWindow,
  loadPdf,
  renderPageToCanvas,
  renderThumbnailToCanvas,
  // zoomIn, zoomOut, // replaced by custom smooth zoom
  setScale,
  fitToWidth,
  flattenOutline,
  resolveDestToPage,
  // Search
  searchBusy, searchTotal, searchMatches, searchProgress, activeMatchIndex, runSearch, nextMatchPage, prevMatchPage
} = usePdfProViewer();

const flatOutline = computed(() => flattenOutline(outline.value || []));

// ---------- base64 decode ----------
function base64Decode(str: string) {
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch {
    return "";
  }
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

function prevPage() {
  if (currentPage.value > 1) goToPage(currentPage.value - 1);
}
function nextPage() {
  if (currentPage.value < numPages.value) goToPage(currentPage.value + 1);
}

function jumpToPage() {
  let p = Number(pageInput.value);
  if (!Number.isFinite(p)) p = 1;
  p = Math.max(1, Math.min(numPages.value, p));
  goToPage(p);
}

function goToPage(p: number) {
  currentPage.value = p;
  scrollToPage(p);
}

function scrollToPage(p: number) {
  const el = document.getElementById("page-" + p);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Smooth Zoom Logic
function commitZoom(nextScale: number) {
  nextScale = Math.min(Math.max(nextScale, 0.5), 3.0);
  const ratio = nextScale / uiScale.value;
  smoothZoomScale.value = ratio;
  isSmoothZooming.value = true;
  
  if (zoomTimer) window.clearTimeout(zoomTimer);
  zoomTimer = window.setTimeout(() => {
    setScale(nextScale);   // commit
    renderKey.value += 1;  // force rerender
    smoothZoomScale.value = 1.0;
    isSmoothZooming.value = false;
  }, 120);
}

function zoomInClick() { commitZoom(uiScale.value + 0.1); }
function zoomOutClick() { commitZoom(uiScale.value - 0.1); }

async function fitWidth() {
  if (!pdfContentRef.value) return;
  // Use core fit logic, but we might want to wrap it in commitZoom style if we want smooth transition
  // for now direct call is fine or we can manually set scale
  await fitToWidth(pdfContentRef.value);
  // Manual trigger if fitToWidth updates uiScale directly
  renderKey.value += 1;
  const c = currentPage.value;
  currentPage.value = Math.max(1, Math.min(numPages.value, c));
}

// Search Actions
// Search Actions
const showSearchDropdown = ref(false);
const searchInputEl = ref<HTMLInputElement | null>(null);

function openDropdown() { showSearchDropdown.value = true; }
function closeDropdown() {
  showSearchDropdown.value = false;
  viewerContainer.value?.focus?.();
}

function onClickOutside(e: MouseEvent) {
  const t = e.target as HTMLElement;
  if (!t.closest(".search-box")) closeDropdown();
}

function isTypingContext(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

function handleGlobalKeydown(e: KeyboardEvent) {
  // ESC: close dropdown + blur search
  if (e.key === "Escape") {
    if (showSearchDropdown.value) {
      e.preventDefault();
      closeDropdown();
    }
    if (document.activeElement === searchInputEl.value) {
      (searchInputEl.value as HTMLInputElement).blur();
    }
    return;
  }

  // "/" focuses search (unless you're typing in some field already)
  if (e.key === "/") {
    if (isTypingContext(e.target)) return;
    e.preventDefault();
    openDropdown();
    searchInputEl.value?.focus();
    searchInputEl.value?.select();
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", handleGlobalKeydown);
});

async function onSearch() {
  openDropdown();
  await runSearch(searchInput.value);
  // do NOT auto-jump during indexing; jump only after first results appear
  if (searchMatches.value.length) goToPage(searchMatches.value[0].page);
}

function onNextMatch() {
  const p = nextMatchPage();
  if (p) goToPage(p);
}

function onPrevMatch() {
  const p = prevMatchPage();
  if (p) goToPage(p);
}

function jumpToResult(page: number) {
  goToPage(page);
  closeDropdown();
}

interface OutlineNavigationItem {
  url?: string | null;
  dest?: unknown;
  title?: string;
}

async function navigateTo(item: OutlineNavigationItem) {
  if (item.url) {
    window.open(item.url, "_blank");
    return;
  }
  const p = await resolveDestToPage(item.dest);
  if (p) goToPage(p);
}

function downloadPdf() {
  if (!url.value) return;
  const link = document.createElement("a");
  link.href = url.value;
  link.download = (documentTitle.value || "Route Report") + ".pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printPdf() {
  if (!url.value) return;
  const w = window.open(url.value, "_blank");
  if (w) w.print();
}

function closeViewer() {
  if (window.history.length > 1) router.back();
  else router.push({ name: "Dashboard" });
}

// ---------- Fullscreen ----------
function toggleFullscreen() {
  const el = viewerContainer.value;
  if (!el) return;

  if (!document.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// ---------- Rendering adapters ----------
async function renderPage(page: number, canvas: HTMLCanvasElement) {
  await renderPageToCanvas(page, canvas);
}
async function renderThumbnail(page: number, canvas: HTMLCanvasElement) {
  await renderThumbnailToCanvas(page, canvas);
}

// ---------- Scroll -> current page (IntersectionObserver) ----------
let pageObserver: IntersectionObserver | null = null;
const pageItems = ref<HTMLElement[]>([]);

function setupPageObserver() {
  if (pageObserver) pageObserver.disconnect();

  const root = pdfContentRef.value;
  if (!root) return;

  pageObserver = new IntersectionObserver(
    (entries) => {
      // choose the most visible page
      let bestPage = currentPage.value;
      let bestRatio = 0;

      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = (e.target as HTMLElement).id; // page-#
        const pageNum = Number(id.replace("page-", ""));
        if (e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio;
          bestPage = pageNum;
        }
      }
      if (bestRatio > 0 && bestPage !== currentPage.value) currentPage.value = bestPage;
    },
    { root, threshold: [0.15, 0.25, 0.35, 0.5, 0.65] }
  );

  nextTick(() => {
    const nodes = Array.from(root.querySelectorAll(".pdf-page-wrapper")) as HTMLElement[];
    for (const n of nodes) pageObserver!.observe(n);
  });
}

// ---------- Lazy thumbnails (IntersectionObserver) ----------
const thumbEnabled = ref<Record<number, boolean>>({});
let thumbObserver: IntersectionObserver | null = null;
const thumbItems = ref<HTMLElement[]>([]);

function setupThumbObserver() {
  if (thumbObserver) thumbObserver.disconnect();
  const root = thumbsRef.value;
  if (!root) return;

  thumbObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = (e.target as HTMLElement).id; // thumbnail-#
        const p = Number(id.replace("thumbnail-", ""));
        if (!thumbEnabled.value[p]) thumbEnabled.value[p] = true;
      }
    },
    { root, rootMargin: "400px 0px", threshold: 0.01 }
  );

  nextTick(() => {
    const nodes = Array.from(root.querySelectorAll(".thumbnail-item")) as HTMLElement[];
    for (const n of nodes) thumbObserver!.observe(n);
  });
}

// keep page input synced
watch(currentPage, async (p) => {
  pageInput.value = p;
  // keep thumbnail in view (smooth)
  await nextTick();
  const thumb = document.getElementById("thumbnail-" + p);
  thumb?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ---------- init ----------
onMounted(async () => {
  const base64Url = route.query.url as string | undefined;
  const titleParam = route.query.title as string | undefined;
  if (titleParam) documentTitle.value = titleParam;

  if (!base64Url) return;

  const decoded = base64Decode(base64Url);
  if (!decoded || !decoded.endsWith(".pdf")) return;

  await loadPdf(decoded);

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  // initialize lazy thumb map (all false)
  const map: Record<number, boolean> = {};
  for (let i = 1; i <= numPages.value; i++) map[i] = false;
  thumbEnabled.value = map;

  // observers
  setupPageObserver();
  setupThumbObserver();

  // initial fit-to-width feels premium
  if (pdfContentRef.value) await fitToWidth(pdfContentRef.value);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  pageObserver?.disconnect();
  thumbObserver?.disconnect();
});
</script>

<style scoped>
/* Keep your existing styles; only important change: remove CSS transform scaling. */
.pdf-viewer-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: #f5f5f5;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.pdf-viewer-layout:fullscreen { height: 100vh; width: 100vw; }

.pdf-loading-overlay,
.pdf-error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 90%);
  z-index: 100;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid rgb(0 167 225 / 20%);
  border-top: 5px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }

.pdf-toolbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
  z-index: 10;
  flex-shrink: 0;
}

.toolbar-left, .toolbar-center, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center { position: absolute; left: 50%; transform: translateX(-50%); }

.toolbar-divider { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }

.doc-title {
  font-weight: 600;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: var(--text-primary);
}

.page-indicator { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-secondary); }
.page-input {
  width: 52px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 0;
  background: var(--bg-surface);
  color: var(--text-primary);
}
.zoom-indicator {
  min-width: 48px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  color: var(--text-secondary);
}

.search-box { position: relative; display: flex; align-items: center; gap: 6px; margin-left:8px; }
.search-input {
  width: 180px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  background: var(--bg-surface);
  color: var(--text-primary);
}
.search-count { font-size: 12px; color: var(--text-secondary); min-width: 60px; text-align: right; }
.indexing-text { font-size: 11px; white-space: nowrap; }

/* Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 320px;
  max-height: 320px;
  overflow: auto;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgb(0 0 0 / 12%);
  z-index: 50;
  padding: 8px;
}

.search-empty {
  padding: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.search-results { display: flex; flex-direction: column; gap: 6px; }

.search-result {
  text-align: left;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: transform .08s ease, border-color .08s ease;
  width: 100%;
}
.search-result:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.search-result-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.sr-page { font-weight: 600; font-size: 13px; color: var(--text-primary); }
.sr-count {
  font-size: 11px;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 6px;
  background: white;
}
.sr-snippet { font-size: 12px; color: var(--text-secondary); line-height: 1.35; }

.pdf-body { flex: 1; display: flex; overflow: hidden; position: relative; }

.pdf-sidebar {
  width: 240px;
  background: #f8f9fa;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
  z-index: 5;
}
.pdf-sidebar.collapsed { width: 0; overflow: hidden; border-right: none; }

.sidebar-header {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}
.sidebar-tabs { display: flex; gap: 16px; }
.sidebar-tab {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  cursor: pointer;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}
.sidebar-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.sidebar-tab:disabled { opacity: 0.5; cursor: not-allowed; }

.thumbnails-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.thumbnail-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
.thumbnail-preview {
  width: 100%;
  aspect-ratio: 0.707;
  background: white;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}
.thumbnail-item.active .thumbnail-preview {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgb(0 167 225 / 20%);
}
.thumbnail-label { font-size: 12px; color: var(--text-secondary); }

.outline-container { flex: 1; overflow-y: auto; padding: 16px; }
.outline-list { list-style: none; padding: 0; margin: 0; }
.outline-item { padding: 8px 0; cursor: pointer; border-bottom: 1px solid var(--border-subtle); }
.outline-item:hover { color: var(--accent); }
.outline-title { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-outline { text-align: center; color: var(--text-secondary); font-style: italic; font-size: 13px; margin-top: 20px; }

.pdf-content {
  flex: 1;
  overflow: auto;
  background: #525659;
  display: flex;
  justify-content: center;
  padding: 24px;
  position: relative;
}

.pdf-pages-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pdf-page-wrapper {
  background: white;
  box-shadow: 0 4px 8px rgb(0 0 0 / 20%);
  margin: 0 auto;
  border-radius: 6px;
  overflow: hidden;
}

@media (width <= 900px) {
  .pdf-sidebar { position: absolute; top: 0; left: 0; height: 100%; z-index: 20; box-shadow: 4px 0 8px rgb(0 0 0 / 10%); }
  .toolbar-center { display: none; }
  .doc-title { max-width: 150px; }
  .btn-label { display: none; }
}
</style>