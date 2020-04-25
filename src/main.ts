import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router/index'
import '@/core/blockTypes'
import VueWorker from 'vue-worker'
import store from './store'
import numeral from 'numeral';
import numFormat from 'vue-filter-number-format';
import Dexie from 'dexie';

const db = new Dexie('superglue');
db.version(2).stores({
  catalog: `name`,
  flows: `name`
});

Vue.filter('numFormat', numFormat(numeral));
Vue.use(VueWorker)
Vue.prototype.$idb = db
Vue.config.productionTip = false
new Vue({
  vuetify,
  router,
  store,
  data: {
    $loading: false
  },
  render: h => h(App)
}).$mount('#app')
