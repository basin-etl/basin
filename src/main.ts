import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router/index'
import '@/blocks/blockTypes'
import VueWorker from 'vue-worker'
import store from './store'
Vue.use(VueWorker)

Vue.config.productionTip = false
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
