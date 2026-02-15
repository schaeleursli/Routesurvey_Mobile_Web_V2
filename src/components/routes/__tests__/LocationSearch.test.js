/**
 * Test suite for LocationSearch.vue component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import LocationSearch from '../LocationSearch.vue';

// Mock i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

// Mock BaseFormField and BaseLoadingIndicator
vi.mock('@/components/ui', () => ({
    BaseFormField: {
        name: 'BaseFormField',
        template: '<div class="base-form-field"><slot name="prefix"></slot><input v-model="modelValue" /><slot name="suffix"></slot></div>',
        props: ['modelValue', 'label', 'placeholder'],
        emits: ['update:modelValue', 'input']
    },
    BaseLoadingIndicator: {
        name: 'BaseLoadingIndicator',
        template: '<div class="loading-indicator"></div>',
        props: ['size', 'inline']
    }
}));

describe('LocationSearch.vue', () => {
    let wrapper;
    let mockFetch;

    beforeEach(() => {
        // Mock fetch API
        mockFetch = vi.fn();
        global.fetch = mockFetch;

        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => null);
        Storage.prototype.setItem = vi.fn();
        Storage.prototype.removeItem = vi.fn();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        wrapper = mount(LocationSearch, {
            props: {
                label: 'Search Location',
                placeholder: 'Enter location...'
            }
        });

        expect(wrapper.find('.location-search').exists()).toBe(true);
    });

    it('performs search on input with >3 characters', async () => {
        const mockResults = [
            {
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, NY, USA',
                type: 'city',
                address: {}
            }
        ];

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResults)
        });

        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('New York');

        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('nominatim.openstreetmap.org/search')
        );
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('New%20York')
        );
    });

    it('does not search with <3 characters', async () => {
        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('NY');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('displays search results', async () => {
        const mockResults = [
            {
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, NY, USA',
                type: 'city'
            },
            {
                lat: '34.0522',
                lon: '-118.2437',
                display_name: 'Los Angeles, CA, USA',
                type: 'city'
            }
        ];

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResults)
        });

        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('City');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();
        await nextTick();

        const resultItems = wrapper.findAll('.search-result-item');
        expect(resultItems).toHaveLength(2);
        expect(resultItems[0].text()).toContain('New York, NY, USA');
        expect(resultItems[1].text()).toContain('Los Angeles, CA, USA');
    });

    it('emits select event when result is clicked', async () => {
        const mockResults = [
            {
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, NY, USA',
                type: 'city'
            }
        ];

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResults)
        });

        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('New York');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();
        await nextTick();

        const resultItem = wrapper.find('.search-result-item');
        await resultItem.trigger('click');

        expect(wrapper.emitted('select')).toBeTruthy();
        expect(wrapper.emitted('select')[0][0]).toMatchObject({
            lat: 40.7128,
            lng: -74.0060,
            display_name: 'New York, NY, USA'
        });
    });

    it('stores recent searches in localStorage', async () => {
        const mockResults = [
            {
                lat: '40.7128',
                lon: '-74.0060',
                display_name: 'New York, NY, USA',
                type: 'city'
            }
        ];

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResults)
        });

        wrapper = mount(LocationSearch, {
            props: {
                showRecentSearches: true
            }
        });

        const input = wrapper.find('input');
        await input.setValue('New York');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();
        await nextTick();

        const resultItem = wrapper.find('.search-result-item');
        await resultItem.trigger('click');

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'recentLocationSearches',
            expect.stringContaining('New York')
        );
    });

    it('displays recent searches', async () => {
        const recentSearches = [
            {
                lat: 40.7128,
                lng: -74.0060,
                display_name: 'New York, NY, USA'
            }
        ];

        Storage.prototype.getItem.mockReturnValue(JSON.stringify(recentSearches));

        wrapper = mount(LocationSearch, {
            props: {
                showRecentSearches: true
            }
        });

        await nextTick();

        const recentItems = wrapper.findAll('.recent-item');
        expect(recentItems).toHaveLength(1);
        expect(recentItems[0].text()).toContain('New York, NY, USA');
    });

    it('clears search input', async () => {
        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('Test');

        const clearButton = wrapper.find('.clear-button');
        await clearButton.trigger('click');

        expect(input.element.value).toBe('');
    });

    it('shows loading state during search', async () => {
        let resolveSearch;
        const searchPromise = new Promise(resolve => {
            resolveSearch = resolve;
        });

        mockFetch.mockReturnValue(searchPromise);

        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('Searching...');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();

        expect(wrapper.find('.loading-spinner').exists()).toBe(true);

        resolveSearch({ json: () => Promise.resolve([]) });
        await nextTick();

        expect(wrapper.find('.loading-spinner').exists()).toBe(false);
    });

    it('handles search errors gracefully', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        mockFetch.mockRejectedValue(new Error('Network error'));

        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');
        await input.setValue('Error Test');

        await new Promise(resolve => setTimeout(resolve, 600));
        await nextTick();

        expect(consoleError).toHaveBeenCalledWith(
            'Location search error:',
            expect.any(Error)
        );

        consoleError.mockRestore();
    });

    it('respects maxResults prop', async () => {
        const mockResults = Array.from({ length: 10 }, (_, i) => ({
            lat: `${40 + i}`,
            lon: `${-74 + i}`,
            display_name: `Location ${i}`,
            type: 'place'
        }));

        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResults)
        });

        wrapper = mount(LocationSearch, {
            props: {
                maxResults: 3
            }
        });

        const input = wrapper.find('input');
        await input.setValue('Test');

        await new Promise(resolve => setTimeout(resolve, 600));

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('limit=3')
        );
    });

    it('debounces search input', async () => {
        wrapper = mount(LocationSearch);

        const input = wrapper.find('input');

        await input.setValue('T');
        await input.setValue('Te');
        await input.setValue('Tes');
        await input.setValue('Test');

        // Should not have called yet
        expect(mockFetch).not.toHaveBeenCalled();

        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 600));

        // Should only call once after debounce
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});
