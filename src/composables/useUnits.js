import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * Composable for managing unit preferences (metric/imperial)
 * Provides reactive unit state and distance formatting utilities
 */
export function useUnits() {
    // Get initial unit from localStorage or default to metric
    const getInitialUnit = () => {
        return localStorage.getItem('unit') || 'metric';
    };

    const selectedUnit = ref(getInitialUnit());
    const isImperial = computed(() => selectedUnit.value === 'imperial');

    // Listen for unit changes from MainLayout
    const handleUnitChange = (event) => {
        if (event.detail && event.detail.unit) {
            selectedUnit.value = event.detail.unit;
        } else {
            // Fallback: check localStorage
            selectedUnit.value = getInitialUnit();
        }
    };

    // Format distance based on current unit preference
    const formatDistance = (meters) => {
        if (!meters && meters !== 0) return '0' + (isImperial.value ? 'ft' : 'm');
        
        const distance = Number(meters);
        if (isNaN(distance)) return 'N/A';

        if (distance < 1000) {
            // For distances less than 1000m, show in meters/feet
            const converted = isImperial.value ? distance * 3.28084 : distance;
            const unit = isImperial.value ? 'ft' : 'm';
            return `${converted.toFixed(2)}${unit}`;
        } else {
            // For distances 1000m or more, show in km/miles
            const converted = isImperial.value ? distance / 1609.34 : distance / 1000;
            const unit = isImperial.value ? 'mi' : 'km';
            return `${converted.toFixed(1)}${unit}`;
        }
    };

    // Format distance with custom precision
    const formatDistanceWithPrecision = (meters, precision = 1) => {
        if (!meters && meters !== 0) return '0' + (isImperial.value ? 'ft' : 'm');
        
        const distance = Number(meters);
        if (isNaN(distance)) return 'N/A';

        if (distance < 1000) {
            const converted = isImperial.value ? distance * 3.28084 : distance;
            const unit = isImperial.value ? 'ft' : 'm';
            return `${converted.toFixed(precision)}${unit}`;
        } else {
            const converted = isImperial.value ? distance / 1609.34 : distance / 1000;
            const unit = isImperial.value ? 'mi' : 'km';
            return `${converted.toFixed(precision)}${unit}`;
        }
    };

    // Convert meters to the current unit (returns the numeric value)
    const convertDistance = (meters) => {
        if (!meters && meters !== 0) return 0;
        const distance = Number(meters);
        if (isNaN(distance)) return 0;

        if (distance < 1000) {
            return isImperial.value ? distance * 3.28084 : distance;
        } else {
            return isImperial.value ? distance / 1609.34 : distance / 1000;
        }
    };

    // Get the unit label for the current unit
    const getUnitLabel = (short = false) => {
        if (isImperial.value) {
            return short ? 'mi' : 'miles';
        } else {
            return short ? 'km' : 'kilometers';
        }
    };

    // Get the unit label for small distances
    const getSmallUnitLabel = () => {
        return isImperial.value ? 'ft' : 'm';
    };

    // Set up event listener on mount
    onMounted(() => {
        window.addEventListener('unit-changed', handleUnitChange);
        // Also check localStorage periodically in case it was changed elsewhere
        const checkInterval = setInterval(() => {
            const currentUnit = getInitialUnit();
            if (currentUnit !== selectedUnit.value) {
                selectedUnit.value = currentUnit;
            }
        }, 1000);
        
        // Store interval ID for cleanup
        window._unitCheckInterval = checkInterval;
    });

    // Clean up event listener on unmount
    onUnmounted(() => {
        window.removeEventListener('unit-changed', handleUnitChange);
        if (window._unitCheckInterval) {
            clearInterval(window._unitCheckInterval);
        }
    });

    return {
        selectedUnit,
        isImperial,
        formatDistance,
        formatDistanceWithPrecision,
        convertDistance,
        getUnitLabel,
        getSmallUnitLabel,
    };
}

