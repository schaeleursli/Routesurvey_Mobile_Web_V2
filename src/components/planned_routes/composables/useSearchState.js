import { ref } from "vue";

export function useSearchState() {
  // Search state
  const searchQuery = ref("");
  const searchResults = ref([]);
  const showResults = ref(false);
  const searching = ref(false);

  const searchLocation = async () => {
    if (!searchQuery.value.trim()) return;

    searching.value = true;
    showResults.value = true;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.value
        )}&limit=5`
      );
      const data = await response.json();
      searchResults.value = data;
    } catch (error) {
      console.error("Error searching for location:", error);
      searchResults.value = [];
    } finally {
      searching.value = false;
    }
  };

  const handleSearchInput = () => {
    if (searchQuery.value.trim()) {
      showResults.value = true;
    } else {
      showResults.value = false;
    }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Get the full address information from the search result
    const addressInfo = {
      lat: lat,
      lng: lng,
      display_name: result.display_name,
      type: result.type,
      place_id: result.place_id,
      address: {
        house_number: result.address?.house_number,
        road: result.address?.road,
        suburb: result.address?.suburb,
        city: result.address?.city,
        state: result.address?.state,
        postcode: result.address?.postcode,
        country: result.address?.country,
      },
    };

    searchQuery.value = result.display_name;
    showResults.value = false;

    return { lat, lng, addressInfo };
  };

  return {
    searchQuery,
    searchResults,
    showResults,
    searching,
    searchLocation,
    handleSearchInput,
    selectSearchResult,
  };
}
