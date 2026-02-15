/**
 * Map Tile Caching Service
 * Provides offline map tile storage using IndexedDB
 */

const DB_NAME = 'RSConsole_MapTiles';
const DB_VERSION = 1;
const STORE_NAME = 'tiles';
const MAX_CACHE_SIZE_MB = 100;
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;

class MapTileCache {
    constructor() {
        this.db = null;
        this.currentCacheSize = 0;
        this.isEnabled = false;
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.calculateCacheSize();
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('size', 'size', { unique: false });
                }
            };
        });
    }

    /**
     * Enable offline mode
     */
    async enable() {
        if (!this.db) {
            await this.init();
        }
        this.isEnabled = true;
        console.log('Offline map mode enabled');
    }

    /**
     * Disable offline mode
     */
    disable() {
        this.isEnabled = false;
        console.log('Offline map mode disabled');
    }

    /**
     * Check if offline mode is enabled
     */
    isOfflineModeEnabled() {
        return this.isEnabled;
    }

    /**
     * Generate cache key for tile
     */
    getTileKey(url, z, x, y) {
        return `${url}_${z}_${x}_${y}`;
    }

    /**
     * Fetch and cache a tile
     */
    async cacheTile(url, z, x, y) {
        const key = this.getTileKey(url, z, x, y);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch tile: ${response.statusText}`);
            }

            const blob = await response.blob();
            const size = blob.size;

            // Check if adding this tile would exceed cache limit
            if (this.currentCacheSize + size > MAX_CACHE_SIZE_BYTES) {
                await this.evictOldestTiles(size);
            }

            // Store tile in IndexedDB
            await this.storeTile(key, blob, size);

            return blob;
        } catch (error) {
            console.error('Error caching tile:', error);
            throw error;
        }
    }

    /**
     * Store tile in IndexedDB
     */
    async storeTile(key, blob, size) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const tileData = {
                key,
                blob,
                size,
                timestamp: Date.now()
            };

            const request = store.put(tileData);

            request.onsuccess = () => {
                this.currentCacheSize += size;
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get cached tile
     */
    async getTile(url, z, x, y) {
        const key = this.getTileKey(url, z, x, y);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.blob);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Check if tile is cached
     */
    async hasTile(url, z, x, y) {
        const tile = await this.getTile(url, z, x, y);
        return tile !== null;
    }

    /**
     * Pre-cache tiles for a bounding box
     */
    async cacheBoundingBox(bounds, zoomLevels, tileUrl) {
        const tiles = this.getTilesForBounds(bounds, zoomLevels);
        const totalTiles = tiles.length;
        let cachedCount = 0;
        let failedCount = 0;

        console.log(`Caching ${totalTiles} tiles for offline use...`);

        // Cache tiles in batches to avoid overwhelming the network
        const batchSize = 10;
        for (let i = 0; i < tiles.length; i += batchSize) {
            const batch = tiles.slice(i, i + batchSize);
            const promises = batch.map(async ({ z, x, y }) => {
                const url = this.formatTileUrl(tileUrl, z, x, y);
                try {
                    await this.cacheTile(url, z, x, y);
                    cachedCount++;
                } catch (error) {
                    failedCount++;
                    console.error(`Failed to cache tile ${z}/${x}/${y}:`, error);
                }
            });

            await Promise.all(promises);

            // Log progress
            const progress = Math.round(((i + batch.length) / totalTiles) * 100);
            console.log(`Caching progress: ${progress}% (${cachedCount} cached, ${failedCount} failed)`);
        }

        return {
            total: totalTiles,
            cached: cachedCount,
            failed: failedCount
        };
    }

    /**
     * Get list of tiles covering a bounding box
     */
    getTilesForBounds(bounds, zoomLevels) {
        const tiles = [];

        for (const zoom of zoomLevels) {
            const minTile = this.latLngToTile(bounds.north, bounds.west, zoom);
            const maxTile = this.latLngToTile(bounds.south, bounds.east, zoom);

            for (let x = minTile.x; x <= maxTile.x; x++) {
                for (let y = minTile.y; y <= maxTile.y; y++) {
                    tiles.push({ z: zoom, x, y });
                }
            }
        }

        return tiles;
    }

    /**
     * Convert lat/lng to tile coordinates
     */
    latLngToTile(lat, lng, zoom) {
        const n = Math.pow(2, zoom);
        const x = Math.floor((lng + 180) / 360 * n);
        const latRad = lat * Math.PI / 180;
        const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
        return { x, y };
    }

    /**
     * Format tile URL with coordinates
     */
    formatTileUrl(template, z, x, y) {
        return template
            .replace('{z}', z)
            .replace('{x}', x)
            .replace('{y}', y)
            .replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)]); // Random subdomain
    }

    /**
     * Calculate current cache size
     */
    async calculateCacheSize() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const tiles = request.result;
                this.currentCacheSize = tiles.reduce((total, tile) => total + tile.size, 0);
                resolve(this.currentCacheSize);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Evict oldest tiles to make space
     */
    async evictOldestTiles(spaceNeeded) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('timestamp');
            const request = index.openCursor();

            let freedSpace = 0;
            const tilesToDelete = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;

                if (cursor && freedSpace < spaceNeeded) {
                    tilesToDelete.push(cursor.value.key);
                    freedSpace += cursor.value.size;
                    cursor.continue();
                } else {
                    // Delete the tiles
                    tilesToDelete.forEach(key => {
                        store.delete(key);
                    });

                    this.currentCacheSize -= freedSpace;
                    console.log(`Evicted ${tilesToDelete.length} tiles to free ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
                    resolve(freedSpace);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Clear all cached tiles
     */
    async clearCache() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                this.currentCacheSize = 0;
                console.log('Cache cleared');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        await this.calculateCacheSize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();

            request.onsuccess = () => {
                resolve({
                    tileCount: request.result,
                    sizeBytes: this.currentCacheSize,
                    sizeMB: (this.currentCacheSize / 1024 / 1024).toFixed(2),
                    maxSizeMB: MAX_CACHE_SIZE_MB,
                    percentFull: ((this.currentCacheSize / MAX_CACHE_SIZE_BYTES) * 100).toFixed(1)
                });
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

// Create singleton instance
const mapTileCache = new MapTileCache();

export default mapTileCache;
