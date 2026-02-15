import { ref, readonly } from 'vue';
import { PhFileText } from "@phosphor-icons/vue";

// Global state for search context
const contextName = ref(null);
const searchFunction = ref(null);
const contextIcon = ref(PhFileText);

export function useSearchContext() {
    /**
     * Register a search provider for the current context (page/view)
     * @param {string} name - The display name of the context (e.g. "Current Route", "This Page")
     * @param {Function} searchFn - The async function to call with the query. Should return array of results.
     * @param {string} icon - Bootstrap icon class (default: bi-file-earmark-text)
     */
    const registerSearchContext = (name, searchFn, icon = PhFileText) => {
        contextName.value = name;
        searchFunction.value = searchFn;
        contextIcon.value = icon;
    };

    /**
     * Clear the current search context
     */
    const clearSearchContext = () => {
        contextName.value = null;
        searchFunction.value = null;
        contextIcon.value = PhFileText;
    };

    /**
     * Execute the context search
     * @param {string} query 
     */
    const executeContextSearch = async (query) => {
        if (!searchFunction.value) return [];
        try {
            return await searchFunction.value(query);
        } catch (e) {
            console.error('Context search failed', e);
            return [];
        }
    };

    return {
        contextName: readonly(contextName),
        contextIcon: readonly(contextIcon),
        hasContext: readonly(ref(!!contextName.value)), // structured this way to be reactive? actually computed is better but we use ref for simplicity in global state
        registerSearchContext,
        clearSearchContext,
        executeContextSearch
    };
}
