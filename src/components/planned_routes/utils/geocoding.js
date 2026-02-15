// Function to get address information from coordinates using reverse geocoding
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data && data.display_name) {
      return {
        display_name: data.display_name,
        type: data.type,
        place_id: data.place_id,
        address: data.address || {},
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    return null;
  }
};
