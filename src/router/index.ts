import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/pages/Editor.vue'
import DataFrameViewerDriver from '@/pages/DataFrameViewerDriver.vue'
import CatalogIndex from '@/pages/catalog/Index.vue'
import CatalogCreate from '@/pages/catalog/Create.vue'
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
      path: '/catalog',
      name: 'catalog_index',
      component: CatalogIndex
    },
    {
      path: '/catalog/create',
      name: 'catalog_create',
      component: CatalogCreate
    },
    {
      path: '/df',
      name: 'df',
      component: DataFrameViewerDriver
    },
  ]
})