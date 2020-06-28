import Index from './Index.vue'
import Create from './Create.vue'

export default [
    {
      path: '/connector',
      name: 'connector_index',
      component: Index
    },
    {
      path: '/connector/create',
      name: 'connector_create',
      component: Create
    },
    {
      path: '/connector/:id/edit',
      name: 'connector_edit',
      component: Create
    },
]
