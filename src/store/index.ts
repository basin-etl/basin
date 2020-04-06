import Vue from 'vue';
import Vuex from 'vuex'

import JobModule from './modules/job';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  modules: {
    job: JobModule,
  }
});