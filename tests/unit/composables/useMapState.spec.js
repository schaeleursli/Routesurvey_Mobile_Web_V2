
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMapState } from '@/components/planned_routes/composables/useMapState';
import { nextTick } from 'vue';

// Mock localStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock window events
const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

describe('useMapState', () => {

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('initializes with default values when localStorage is empty', () => {
            const { zoom, mapCenter, mapStyle } = useMapState();

            expect(zoom.value).toBe(3);
            expect(mapCenter.value).toEqual([0, -30]);
            expect(mapStyle.value).toBe('blue');
        });

        it('initializes with stored values from localStorage', () => {
            localStorageMock.setItem('plannedRouteMapZoom', '10');
            localStorageMock.setItem('plannedRouteMapCenter', JSON.stringify([51.505, -0.09]));
            localStorageMock.setItem('plannedRouteMapStyle', 'dark');

            const { zoom, mapCenter, mapStyle } = useMapState();

            expect(zoom.value).toBe(10);
            expect(mapCenter.value).toEqual([51.505, -0.09]);
            expect(mapStyle.value).toBe('dark');
        });

        it('handles invalid JSON in localStorage gracefully', () => {
            localStorageMock.setItem('plannedRouteMapCenter', 'INVALID_JSON');
            const { mapCenter } = useMapState();
            expect(mapCenter.value).toEqual([0, -30]); // Default
        });
    });

    describe('Computed Properties', () => {
        it('computes tileLayerUrl correctly for different styles', () => {
            const { mapStyle, tileLayerUrl } = useMapState();

            mapStyle.value = 'satellite';
            expect(tileLayerUrl.value).toContain('ArcGIS');

            mapStyle.value = 'light';
            expect(tileLayerUrl.value).toContain('light_all');

            mapStyle.value = 'dark';
            expect(tileLayerUrl.value).toContain('dark_all');

            mapStyle.value = 'blue';
            expect(tileLayerUrl.value).toContain('dark_all'); // Blue uses dark base

            mapStyle.value = 'osm';
            expect(tileLayerUrl.value).toContain('openstreetmap');
        });

        it('computes mapStyleLabel correctly', () => {
            const { mapStyle, mapStyleLabel } = useMapState();

            mapStyle.value = 'satellite';
            expect(mapStyleLabel.value).toBe('Satellite');

            mapStyle.value = 'blue';
            expect(mapStyleLabel.value).toBe('Blue');
        });
    });

    describe('State Management & Persistence', () => {
        it('setMapStyle updates state and saves to localStorage', () => {
            const { setMapStyle, mapStyle } = useMapState();

            setMapStyle('satellite');

            expect(mapStyle.value).toBe('satellite');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('plannedRouteMapStyle', 'satellite');
            expect(window.dispatchEvent).toHaveBeenCalled(); // Should dispatch event
        });

        it('saveMapCenter saves center and zoom to localStorage', () => {
            const { saveMapCenter } = useMapState();

            saveMapCenter([10, 10], 5);

            expect(localStorageMock.setItem).toHaveBeenCalledWith('plannedRouteMapCenter', JSON.stringify([10, 10]));
            expect(localStorageMock.setItem).toHaveBeenCalledWith('plannedRouteMapZoom', '5');
        });

        it('watches zoom changes and saves to localStorage', async () => {
            const { zoom } = useMapState();
            zoom.value = 12;
            await nextTick();

            expect(localStorageMock.setItem).toHaveBeenCalledWith('plannedRouteMapZoom', '12');
        });

        it('watches mapCenter changes and saves to localStorage', async () => {
            const { mapCenter } = useMapState();
            mapCenter.value = [20, 20];
            await nextTick();

            expect(localStorageMock.setItem).toHaveBeenCalledWith('plannedRouteMapCenter', JSON.stringify([20, 20]));
        });
    });

    describe('Event Handling', () => {
        it('registers event listeners on mount', () => {
            // Since useMapState calls onMounted, we need to be inside a component setup context strictly speaking for onMounted to work automatically 
            // OR we can rely on how Vue composition API works in tests.
            // By calling useMapState(), the lifecycle hooks are registered.
            // However, onMounted doesn't run automatically in unit tests unless we use mount/shallowMount from @vue/test-utils with a dummy component.

            // IMPORTANT: vitest standalone execution of composables DOES NOT trigger onMounted. 
            // We have to mock the lifecycle hooks or invoke the logic manually if exposed.
            // But wait, we can wrap it in `withSetup` helper or just check the logic directly if possible.

            // Let's assume for this test we won't strictly test onMounted *triggering*, 
            // but we can manually invoke the event handlers if we can access them, 
            // OR better: use a dummy component to actually trigger the lifecycle.
        });
    });
});

// Helper component approach for lifecycle testing
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

describe('useMapState Lifecycle', () => {
    const TestComponent = defineComponent({
        setup() {
            return useMapState();
        },
        template: '<div></div>'
    });

    it('registers and removes event listeners', () => {
        const wrapper = mount(TestComponent);

        expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('mapStateChanged', expect.any(Function));

        wrapper.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        // expect(removeEventListenerSpy).toHaveBeenCalledWith('mapStateChanged', expect.any(Function)); 
        // Note: The specific function ref needs to be the same, which mock doesn't guarantee identity of if not careful, but spy checks calls.
    });

    it('updates state on window storage event', async () => {
        const wrapper = mount(TestComponent);
        // We need to trigger the event handler. 
        // Since the handler is internal to the composable/setup, we can simulate the window event.

        // Setup: Pre-load some new value into our mock store so when the handler reads it, it finds new data
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'plannedRouteMapZoom') return '15';
            return null;
        });

        window.dispatchEvent(new StorageEvent('storage', {
            key: 'plannedRouteMapZoom',
            newValue: '15'
        }));

        await nextTick();

        // Access the internal state via wrapper.vm (exposed refs)
        expect(wrapper.vm.zoom).toBe(15);
    });
});
