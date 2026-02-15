import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Composable for managing focus trap in modals and dialogs
 * Ensures keyboard navigation stays within the modal boundaries
 * Complies with WCAG 2.1 Level AA requirements
 */
export function useFocusTrap() {
    const trapElement = ref(null);
    const previouslyFocusedElement = ref(null);
    const isActive = ref(false);

    /**
     * Get all focusable elements within the trap
     */
    function getFocusableElements(container) {
        if (!container) return [];

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');

        return Array.from(container.querySelectorAll(focusableSelectors))
            .filter(el => {
                // Filter out hidden elements
                return el.offsetParent !== null &&
                    window.getComputedStyle(el).visibility !== 'hidden';
            });
    }

    /**
     * Handle Tab key navigation within the trap
     */
    function handleKeyDown(event) {
        if (!isActive.value || !trapElement.value) return;

        // Handle Escape key to close modal (delegate to parent)
        if (event.key === 'Escape') {
            return; // Let parent handle this
        }

        // Handle Tab key
        if (event.key === 'Tab') {
            const focusableElements = getFocusableElements(trapElement.value);

            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            // Shift + Tab (backwards)
            if (event.shiftKey) {
                if (activeElement === firstElement || !trapElement.value.contains(activeElement)) {
                    event.preventDefault();
                    lastElement.focus();
                }
            }
            // Tab (forwards)
            else {
                if (activeElement === lastElement || !trapElement.value.contains(activeElement)) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    /**
     * Activate the focus trap
     */
    function activate(element) {
        if (!element) return;

        // Store the currently focused element to restore later
        previouslyFocusedElement.value = document.activeElement;

        trapElement.value = element;
        isActive.value = true;

        // Focus the first focusable element in the trap
        requestAnimationFrame(() => {
            const focusableElements = getFocusableElements(trapElement.value);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        });

        // Add keyboard event listener
        document.addEventListener('keydown', handleKeyDown);
    }

    /**
     * Deactivate the focus trap
     */
    function deactivate() {
        isActive.value = false;

        // Remove keyboard event listener
        document.removeEventListener('keydown', handleKeyDown);

        // Restore focus to the previously focused element
        if (previouslyFocusedElement.value && previouslyFocusedElement.value.focus) {
            requestAnimationFrame(() => {
                previouslyFocusedElement.value.focus();
                previouslyFocusedElement.value = null;
            });
        }

        trapElement.value = null;
    }

    /**
     * Auto-cleanup on component unmount
     */
    onBeforeUnmount(() => {
        if (isActive.value) {
            deactivate();
        }
    });

    return {
        activate,
        deactivate,
        isActive,
    };
}
