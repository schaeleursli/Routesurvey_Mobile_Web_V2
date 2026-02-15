/**
 * Vue Router Configuration
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory('/'),
    routes: [
        {
            path: '/projects/:projectId/engineering',
            name: 'engineering',
            component: () => import('@/views/EngineeringWorkspace.vue'),
            children: [
                {
                    path: '',
                    name: 'engineering-home',
                    component: () => import('@/views/EngineeringHome.vue')
                },
                {
                    path: 'library',
                    name: 'equipment-library',
                    component: () => import('@/views/EquipmentLibrary.vue')
                },
                {
                    path: 'equipment',
                    name: 'project-equipment',
                    component: () => import('@/views/ProjectEquipment.vue')
                },
                {
                    path: 'configs/:configId',
                    name: 'transport-config-editor',
                    component: () => import('@/views/TransportConfigEditor.vue')
                }
            ]
        }
    ]
})

export default router
