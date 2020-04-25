import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/pages/Editor.vue'
import DataFrameViewerDriver from '@/pages/DataFrameViewerDriver.vue'
import CatalogIndex from '@/pages/catalog/Index.vue'
import CatalogCreate from '@/pages/catalog/Create.vue'
import FlowIndex from '@/pages/flow/Index.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: FlowIndex
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
      path: '/catalog/:id/edit',
      name: 'catalog_edit',
      component: CatalogCreate
    },
    {
      path: '/flow/:id',
      name: 'flow_edit',
      component: Editor
    },
    {
      path: '/flow/create',
      name: 'flow_create',
      component: Editor
    },
    {
      path: '/flow',
      name: 'flow_index',
      component: FlowIndex
    },
    {
      path: '/df',
      name: 'df',
      component: DataFrameViewerDriver
    },
  ]
})