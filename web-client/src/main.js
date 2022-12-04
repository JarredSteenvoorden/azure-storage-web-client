import Vue from 'vue'
import VueRouter from "vue-router";
import App from './App.vue'
import vuetify from './plugins/vuetify'

import store from './store'
import OidcCallback from "@/views/OidcCallback";
import {vuexOidcCreateRouterMiddleware} from "vuex-oidc";
import Home from "@/views/Home";

Vue.config.productionTip = false

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
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
      component: () => import(/* webpackChunkName: "protected" */ './views/Protected.vue')
    },
    {
      path: '/explorer*',
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

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
