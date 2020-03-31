// define a mixin object
export default {
  data: function() {
    return {
      local: {...this.$props}
    }
  },
  methods: {
    getProperties: function () {
      return this.local
    },
    reset: function() {
      this.local = {...this.$props}  
    }
  }
}