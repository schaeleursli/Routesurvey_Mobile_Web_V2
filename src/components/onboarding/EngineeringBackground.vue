<template>
  <div class="engineering-background" ref="container">
    <!-- Base Grid -->
    <div class="grid-pattern"></div>
    
    <!-- SVG Layer for Nodes and Connections -->
    <svg class="network-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid slice">
      <!-- Connections -->
      <line 
        v-for="(link, index) in links" 
        :key="`link-${index}`"
        :x1="link.source.x" 
        :y1="link.source.y"
        :x2="link.target.x" 
        :y2="link.target.y"
        class="connection-line"
        :style="{ opacity: link.opacity }"
      />
      
      <!-- Nodes -->
      <circle 
        v-for="(node, index) in nodes" 
        :key="`node-${index}`"
        :cx="node.x" 
        :cy="node.y" 
        :r="node.radius"
        class="node-circle"
        :class="{ 'node-active': node.isActive }"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';

const container = ref(null);
const width = ref(1000);
const height = ref(800);
const nodes = reactive([]);
const links = reactive([]);

// Configuration
const NODE_COUNT = 30; // Number of floating points
const CONNECTION_DISTANCE = 250; // Max distance to draw line
const MOUSE_INFLUENCE_RADIUS = 300;
const NODE_SPEED_BASE = 0.3;

let animationFrameId = null;
let mouseX = 0;
let mouseY = 0;

// Initialize Nodes
const initNodes = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: Math.random() * width.value,
            y: Math.random() * height.value,
            vx: (Math.random() - 0.5) * NODE_SPEED_BASE,
            vy: (Math.random() - 0.5) * NODE_SPEED_BASE,
            radius: Math.random() * 2 + 1.5, // 1.5 to 3.5px
            baseX: Math.random() * width.value, // Anchor point for organic drifting if we wanted that, but free float is fine
            baseY: Math.random() * height.value,
            isActive: false
        });
    }
};

const updatePhysics = () => {
    // 1. Move Nodes
    nodes.forEach(node => {
        // Apply Velocity
        node.x += node.vx;
        node.y += node.vy;

        // Wall Bounce
        if (node.x < 0 || node.x > width.value) node.vx *= -1;
        if (node.y < 0 || node.y > height.value) node.vy *= -1;

        // Mouse Influence (Repel/Attract)
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_INFLUENCE_RADIUS) {
            const force = (MOUSE_INFLUENCE_RADIUS - distance) / MOUSE_INFLUENCE_RADIUS;
            // Gentle repel
            node.x -= dx * force * 0.02;
            node.y -= dy * force * 0.02;
            node.isActive = true;
        } else {
            node.isActive = false;
        }
    });

    // 2. Calculate Links
    links.length = 0;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DISTANCE) {
                links.push({
                    source: nodeA,
                    target: nodeB,
                    opacity: 1 - (dist / CONNECTION_DISTANCE) // Fade out as they get further
                });
            }
        }
    }

    animationFrameId = requestAnimationFrame(updatePhysics);
};

const handleMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    // Optional: Re-init nodes if drastic resize, or just let them float back from off-screen
};

onMounted(() => {
    initNodes();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    updatePhysics();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.engineering-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0; /* Behind everything */
    overflow: hidden;
    background-color: var(--bg-base); /* Adapts to theme */
    pointer-events: none; /* Let clicks pass through */
}

/* Engineering Grid Pattern */
.grid-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    background-size: 40px 40px;
    background-image:
        linear-gradient(to right, var(--border) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border) 1px, transparent 1px);
    opacity: 0.3; /* Very subtle */
    /* animation: driftGrid 60s linear infinite; */
}

.network-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.node-circle {
    fill: var(--text-secondary);
    transition: fill 0.3s, r 0.3s;
    opacity: 0.6;
}

.node-active {
    fill: var(--accent);
    r: 4; /* Grow when near mouse */
    opacity: 1;
}

.connection-line {
    stroke: var(--text-secondary);
    stroke-width: 1;
    vector-effect: non-scaling-stroke; /* Keep line thin on zoom */
}

/* Animations */
@keyframes driftGrid {
    0% { transform: translate(0, 0); }
    100% { transform: translate(-40px, -40px); }
}

/* Dark Mode Adjustments via CSS Vars */
/* We rely on var(--text-secondary) and var(--border) which flip correctly in dark mode */
</style>
