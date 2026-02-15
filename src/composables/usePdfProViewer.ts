import { ref, computed, onMounted, onUnmounted } from "vue";
import { pdfjsLib } from "@/lib/pdfjs";

// Minimal PDF.js types
interface PdfProxy {
    numPages: number;
    getPage(num: number): Promise<PdfPageProxy>;
    getOutline(): Promise<PdfOutlineNode[]>;
    getDestination(id: string): Promise<unknown[]>;
    getPageIndex(ref: unknown): Promise<number>;
    destroy(): void;
}

interface PdfPageProxy {
    getViewport(params: { scale: number }): PdfViewport;
    render(params: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport; intent?: string }): { cancel: () => void; promise: Promise<void> };
    getTextContent(): Promise<{ items: { str: string }[] }>;
}

interface PdfViewport {
    width: number;
    height: number;
}

interface PdfOutlineNode {
    title: string;
    dest?: string | unknown[] | null;
    url?: string | null;
    items?: PdfOutlineNode[];
}

type RenderTask = { cancel?: () => void; promise?: Promise<void> };

export interface FlatOutlineItem {
    title: string;
    dest?: string | unknown[] | null;
    url?: string | null;
    level: number;
}

export function usePdfProViewer() {
    const pdf = ref<PdfProxy | null>(null);
    const numPages = ref(0);
    const outline = ref<PdfOutlineNode[]>([]);
    const loading = ref(true);
    const error = ref("");
    // ... (rest of simple refs)

    const url = ref("");
    const title = ref("Route Report");

    const uiScale = ref(1.0); // what user sees
    const dpr = ref(window.devicePixelRatio || 1);
    const renderScale = computed(() => Math.min(uiScale.value * dpr.value, 6)); // clamp

    const currentPage = ref(1);

    // virtualization window: render only visible ±2
    const windowRadius = ref(2);
    const renderWindow = computed(() => {
        const start = Math.max(1, currentPage.value - windowRadius.value);
        const end = Math.min(numPages.value, currentPage.value + windowRadius.value);
        return { start, end };
    });

    // task registry so we can cancel stale renders
    const pageTasks = new Map<number, RenderTask>();

    async function loadPdf(pdfUrl: string) {
        try {
            loading.value = true;
            error.value = "";
            url.value = pdfUrl;

            // Disable eval for stricter CSP compatibility (optional)
            const task = pdfjsLib.getDocument({
                url: pdfUrl,
                // cMapUrl/cMapPacked if you use them; omit for now
            });

            const doc = await task.promise;
            pdf.value = doc as unknown as PdfProxy;
            numPages.value = doc.numPages;

            try {
                outline.value = (await doc.getOutline()) as unknown as PdfOutlineNode[] || [];
            } catch {
                outline.value = [];
            }

            // Clear search cache
            pageTextCache.clear();
            searchMatches.value = [];
            searchQuery.value = "";
            searchBusy.value = false;
            searchProgress.value = { done: 0, total: 0 };
            activeMatchIndex.value = 0;
            searchRunId += 1; // cancel any in-flight search
        } catch (e) {
            console.error(e);
            error.value = "Failed to load PDF document.";
            pdf.value = null;
            numPages.value = 0;
            outline.value = [];
        } finally {
            loading.value = false;
        }
    }

    // ... (setScale, zoomIn, zoomOut omitted as they don't use non-primitive any)

    function setScale(next: number) {
        uiScale.value = Math.min(Math.max(next, 0.5), 3.0);
    }
    function zoomIn() {
        setScale(uiScale.value + 0.1);
    }
    function zoomOut() {
        setScale(uiScale.value - 0.1);
    }

    async function fitToWidth(containerEl: HTMLElement) {
        if (!pdf.value || !containerEl) return;
        const page = await pdf.value.getPage(currentPage.value);
        const viewport1 = page.getViewport({ scale: 1 });
        const containerWidth = Math.max(320, containerEl.clientWidth - 48); // padding
        setScale(containerWidth / viewport1.width);
    }

    function cancelRender(pageNumber: number) {
        const existing = pageTasks.get(pageNumber);
        if (existing?.cancel) existing.cancel();
        pageTasks.delete(pageNumber);
    }

    async function renderPageToCanvas(pageNumber: number, canvas: HTMLCanvasElement) {
        if (!pdf.value) return;

        // cancel any in-flight render for this page
        cancelRender(pageNumber);

        const page = await pdf.value.getPage(pageNumber);

        // render viewport uses DPR-aware scale (crisp)
        const viewport = page.getViewport({ scale: renderScale.value });

        const ctx = canvas.getContext("2d", { alpha: false })!;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // CSS size uses UI scale (no blur)
        const cssViewport = page.getViewport({ scale: uiScale.value });
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        // Render
        const task: RenderTask = page.render({
            canvasContext: ctx,
            viewport,
            intent: "display",
        });

        pageTasks.set(pageNumber, task);

        try {
            await task.promise;
        } catch {
            // canceled or failed; ignore for now
        }
    }

    async function renderThumbnailToCanvas(pageNumber: number, canvas: HTMLCanvasElement) {
        if (!pdf.value) return;

        // thumbnails should be fast + low-res, fixed scale
        const thumbScale = 0.18;
        const page = await pdf.value.getPage(pageNumber);
        const viewport = page.getViewport({ scale: thumbScale * (window.devicePixelRatio || 1) });

        const ctx = canvas.getContext("2d", { alpha: false })!;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // fixed CSS width
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        const task: RenderTask = page.render({
            canvasContext: ctx,
            viewport,
            intent: "display",
        });

        try {
            await task.promise;
        } catch {
            // ignore
        }
    }

    // ----- SEARCH (non-blocking index + jump) -----
    const searchQuery = ref("");
    const searchBusy = ref(false);
    const searchProgress = ref({ done: 0, total: 0 });
    const searchMatches = ref<{ page: number; count: number; snippet?: string }[]>([]);
    const activeMatchIndex = ref(0);

    const pageTextCache = new Map<number, string>();
    let searchRunId = 0; // cancels prior searches

    const searchTotal = computed(() =>
        searchMatches.value.reduce((sum, m) => sum + m.count, 0)
    );

    const flatMatchPages = computed(() => {
        const list: number[] = [];
        for (const m of searchMatches.value) {
            for (let i = 0; i < m.count; i++) list.push(m.page);
        }
        return list;
    });

    async function getPageText(pageNumber: number): Promise<string> {
        if (!pdf.value) return "";
        if (pageTextCache.has(pageNumber)) return pageTextCache.get(pageNumber)!;

        try {
            const page = await pdf.value.getPage(pageNumber);
            const tc = await page.getTextContent();

            const text = (tc.items || [])
                .map((it) => {
                    const item = it as unknown as { str: string };
                    return typeof item.str === "string" ? item.str : "";
                })
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            pageTextCache.set(pageNumber, text);
            return text;
        } catch (e) {
            return "";
        }
    }

    function countOccurrences(haystack: string, needle: string) {
        let idx = 0;
        let c = 0;
        while (true) {
            idx = haystack.indexOf(needle, idx);
            if (idx === -1) break;
            c += 1;
            idx += needle.length || 1;
        }
        return c;
    }

    function buildSnippet(text: string, needle: string, maxLen = 80) {
        const i = text.toLowerCase().indexOf(needle);
        if (i === -1) return text.slice(0, maxLen);
        const start = Math.max(0, i - 25);
        const end = Math.min(text.length, i + needle.length + 25);
        let snip = text.slice(start, end).trim();
        if (start > 0) snip = "…" + snip;
        if (end < text.length) snip = snip + "…";
        return snip;
    }

    async function runSearch(q: string) {
        if (!pdf.value) return;

        const needle = (q || "").trim().toLowerCase();
        searchQuery.value = q;
        searchMatches.value = [];
        activeMatchIndex.value = 0;

        // cancel previous run
        const myRun = ++searchRunId;

        if (!needle) {
            searchBusy.value = false;
            searchProgress.value = { done: 0, total: 0 };
            return;
        }

        searchBusy.value = true;
        searchProgress.value = { done: 0, total: numPages.value };

        // Chunk config (tune)
        const chunkSize = 6;     // pages per chunk
        const yieldMs = 0;       // yield to UI thread

        try {
            for (let start = 1; start <= numPages.value; start += chunkSize) {
                // if a newer search started, stop
                if (myRun !== searchRunId) return;

                const end = Math.min(numPages.value, start + chunkSize - 1);

                const chunkResults: { page: number; count: number; snippet?: string }[] = [];

                for (let p = start; p <= end; p++) {
                    if (myRun !== searchRunId) return;

                    const text = await getPageText(p);
                    if (!text) continue;

                    const lower = text.toLowerCase();
                    const c = countOccurrences(lower, needle);
                    if (c > 0) {
                        chunkResults.push({
                            page: p,
                            count: c,
                            snippet: buildSnippet(text, needle),
                        });
                    }
                }

                if (chunkResults.length) {
                    // append results progressively (keeps UI reactive)
                    searchMatches.value = [...searchMatches.value, ...chunkResults];
                }

                searchProgress.value = { done: end, total: numPages.value };

                // yield control so UI stays smooth
                await new Promise((r) => setTimeout(r, yieldMs));
            }
        } finally {
            if (myRun === searchRunId) searchBusy.value = false;
        }
    }

    function nextMatchPage(): number | null {
        const list = flatMatchPages.value;
        if (!list.length) return null;
        activeMatchIndex.value = (activeMatchIndex.value + 1) % list.length;
        return list[activeMatchIndex.value];
    }

    function prevMatchPage(): number | null {
        const list = flatMatchPages.value;
        if (!list.length) return null;
        activeMatchIndex.value = (activeMatchIndex.value - 1 + list.length) % list.length;
        return list[activeMatchIndex.value];
    }

    // DPR changes (drag window between monitors)
    function onResize() {
        dpr.value = window.devicePixelRatio || 1;
    }

    onMounted(() => window.addEventListener("resize", onResize));
    onUnmounted(() => {
        window.removeEventListener("resize", onResize);
        // cancel all tasks
        for (const [p] of pageTasks) cancelRender(p);
    });

    // Outline flatten helper (keep your current logic)
    function flattenOutline(items: PdfOutlineNode[], level = 0): FlatOutlineItem[] {
        const out: FlatOutlineItem[] = [];
        if (!items) return out;
        for (const it of items) {
            out.push({ title: it.title, dest: it.dest, url: it.url, level });
            if (it.items?.length) out.push(...flattenOutline(it.items, level + 1));
        }
        return out;
    }

    async function resolveDestToPage(dest: unknown): Promise<number | null> {
        if (!pdf.value || !dest) return null;
        try {
            let explicit = dest;
            if (typeof dest === "string") explicit = await pdf.value.getDestination(dest);
            if (!explicit) return null;

            const ref = (explicit as unknown[])[0];
            const idx = await pdf.value.getPageIndex(ref);
            return idx + 1;
        } catch (e) {
            console.warn("resolveDestToPage failed", e);
            return null;
        }
    }

    return {
        pdf,
        numPages,
        outline,
        loading,
        error,
        url,
        title,
        uiScale,
        renderScale,
        currentPage,
        renderWindow,
        windowRadius,

        loadPdf,
        renderPageToCanvas,
        renderThumbnailToCanvas,

        setScale,
        zoomIn,
        zoomOut,
        fitToWidth,

        // Search
        searchQuery, searchBusy, searchProgress, searchMatches, searchTotal, activeMatchIndex,
        runSearch, nextMatchPage, prevMatchPage,

        flattenOutline,
        resolveDestToPage,
    };
}
