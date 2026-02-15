// ReportViewer.spec.js
import { mount } from '@vue/test-utils';
import { vi, describe, it, expect } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import ReportViewer from '@/components/reports/ReportViewer.vue';

// Mock vue3-pdfjs components
vi.mock('vue3-pdfjs', () => ({
    VuePdf: { template: '<div class="mock-pdf"></div>' },
    createLoadingTask: vi.fn(() => ({
        promise: Promise.resolve({ numPages: 3 })
    }))
}));

// Stub BaseButton with default export
vi.mock('@/components/ui/BaseButton.vue', () => ({
    default: {
        name: 'BaseButton',
        props: ['variant', 'size', 'disabled', 'title', 'leftIcon'],
        template: '<button :title="title" :disabled="disabled"><slot/></button>'
    }
}));

// Simple router stub
const router = createRouter({
    history: createWebHistory(),
    routes: []
});

describe('ReportViewer.vue', () => {
    const dummyPdf = 'https://example.com/test.pdf';

    it('renders toolbar and title', async () => {
        const wrapper = mount(ReportViewer, {
            global: { plugins: [router] },
            props: { pdfUrl: dummyPdf, title: 'Test Report' }
        });
        // Wait for async onMounted loading
        await new Promise(r => setTimeout(r, 50));
        expect(wrapper.find('.pdf-toolbar').exists()).toBe(true);
        expect(wrapper.find('.doc-title').text()).toBe('Test Report');
    });

    it('navigates pages via next/prev buttons', async () => {
        const wrapper = mount(ReportViewer, {
            global: { plugins: [router] },
            props: { pdfUrl: dummyPdf }
        });
        await new Promise(r => setTimeout(r, 50));
        const nextBtn = wrapper.find('button[title="Next Page"]');
        const prevBtn = wrapper.find('button[title="Previous Page"]');
        expect(nextBtn.exists()).toBe(true);
        expect(prevBtn.exists()).toBe(true);
        expect(wrapper.vm.currentPage).toBe(1);
        await nextBtn.trigger('click');
        expect(wrapper.vm.currentPage).toBe(2);
        await prevBtn.trigger('click');
        expect(wrapper.vm.currentPage).toBe(1);
    });

    it('zooms in and out', async () => {
        const wrapper = mount(ReportViewer, {
            global: { plugins: [router] },
            props: { pdfUrl: dummyPdf }
        });
        await new Promise(r => setTimeout(r, 50));
        const zoomInBtn = wrapper.find('button[title="Zoom In"]');
        const zoomOutBtn = wrapper.find('button[title="Zoom Out"]');
        expect(zoomInBtn.exists()).toBe(true);
        expect(zoomOutBtn.exists()).toBe(true);
        const initialScale = wrapper.vm.scale;
        await zoomInBtn.trigger('click');
        expect(wrapper.vm.scale).toBeCloseTo(initialScale + 0.1);
        await zoomOutBtn.trigger('click');
        expect(wrapper.vm.scale).toBeCloseTo(initialScale);
    });
});
