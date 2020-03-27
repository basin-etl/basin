import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/pages/Editor.vue'
import DataFrameViewerDriver from '@/pages/DataFrameViewerDriver.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Editor
    },
    {
      path: '/df',
      name: 'home',
      component: DataFrameViewerDriver
    },
  ]
})