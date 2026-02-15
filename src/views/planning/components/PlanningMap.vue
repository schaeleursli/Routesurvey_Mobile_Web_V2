<template>
  <div class="planning-map-container">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
    </l-map>
  </div>
</template>

<script setup>
import { ref } from "vue";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";

const zoom = ref(13);
const center = ref([47.41322, -1.219482]); // Default center
</script>

<style scoped>
.planning-map-container {
  height: 100%;
  width: 100%;
  z-index: 0;
}
</style>
