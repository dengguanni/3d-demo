import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/index',
            component: () => import("@/views/Index.vue")
        },
        {
            path: '/modelviewing',
            name: 'modelviewing',
            component: () => import("../views/modelViewing.vue")
        },
        {
            path: '/wisdompark',
            name: 'wisdompark',
            component: () => import("../views/wisdomPark.vue")
        },
        {
            path: '/stackedbuilding',
            name: 'stackedbuilding',
            component: () => import("@/components/StackedBuildings.vue")
        },
        {
            path: '/draging',
            name: 'draging',
            component: () => import("@/views/draging/Draging.vue")
        },
        {
            path: '/factoryindex',
            name: 'factoryindex',
            component: () => import("@/views/tobaccoFactory/factoryIndex.vue")
        },
        {
            path: '/innerWalLuminescence',
            name: 'innerWalLuminescence',
            component: () => import("@/views/innerWalLuminescence.vue")
        },
    ]
})

export default router