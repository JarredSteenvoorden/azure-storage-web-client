import Vue from "vue/types/index";
import VueRouter from "vue-router";

import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc'

import OidcCallback from "@/views/OidcCallback";
import store from '@/store'
import Home from "@/views/Home";

Vue.use(VueRouter)

const router = new VueRouter({
    /*mode: 'history',
    base: process.env.BASE_URL,*/
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                isPublic: true
            }
        },
        {
            path: '/protected',
            name: 'protected',
            component: () => import('./views/Protected.vue')
        },
        {
            path: '/explorer',
            name: 'explorer',
            component: () => import('./views/Explorer.vue')
        },
        {
            path: '/oidc-callback', // Needs to match redirectUri (redirect_uri if you use snake case) in you oidcSettings
            name: 'oidcCallback',
            component: OidcCallback
        }
    ]
})

router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'oidcStore'))

export default router