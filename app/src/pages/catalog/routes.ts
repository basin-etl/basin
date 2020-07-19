import Index from './Index.vue'
import Create from './Create.vue'

export default [
    {
      path: '/catalog',
      name: 'catalog_index',
      component: Index
    },
    {
      path: '/catalog/create',
      name: 'catalog_create',
      component: Create
    },
    {
      path: '/catalog/:id/edit',
      name: 'catalog_edit',
      component: Create
    },
]
