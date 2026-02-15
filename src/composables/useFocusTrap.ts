import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * Composable for trapping focus within a container element
 * Ensures keyboard navigation stays within the modal for accessibility
 */
export function useFocusTrap() {
    const containerRef: Ref<HTMLElement | null> = ref(null);
    const isActive = ref(false);
    const previousActiveElement: Ref<HTMLElement | null> = ref(null);

    // Get all focusable elements within container
    function getFocusableElements(): HTMLElement[] {
        if (!containerRef.value) return [];

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        return Array.from(
            containerRef.value.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter(el => {
            // Filter out hidden elements
            return el.offsetParent !== null;
        });
    }

    // Handle tab key to trap focus
    function handleKeyDown(event: KeyboardEvent) {
        if (!isActive.value || event.key !== 'Tab') return;

        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab on first element -> go to last
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
        // Tab on last element -> go to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    // Activate focus trap
    function activate() {
        if (isActive.value) return;

        // Save currently focused element to restore later
        previousActiveElement.value = document.activeElement as HTMLElement;

        isActive.value = true;
        document.addEventListener('keydown', handleKeyDown);

        // Focus first focusable element after a short delay
        setTimeout(() => {
            const focusableElements = getFocusableElements();
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }, 100);
    }

    // Deactivate focus trap
    function deactivate() {
        if (!isActive.value) return;

        isActive.value = false;
        document.removeEventListener('keydown', handleKeyDown);

        // Restore focus to previous element
        if (previousActiveElement.value) {
            previousActiveElement.value.focus();
            previousActiveElement.value = null;
        }
    }

    // Cleanup on unmount
    onBeforeUnmount(() => {
        deactivate();
    });

    return {
        containerRef,
        activate,
        deactivate,
        isActive
    };
}
