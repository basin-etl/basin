import Vue from 'vue';
import Vuex from 'vuex'

import JobModule from './modules/job';
import CatalogModule from './modules/catalog.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  modules: {
    job: JobModule,
    catalog: CatalogModule
  }
});