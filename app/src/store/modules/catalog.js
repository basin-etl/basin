import createCrudModule from 'vuex-crud';
let catalogEntries = [
  {
      "id":"person",
      "type":"csv",
      "properties": {
          "delimiter": ","
      }
  },
  {
      "id":"company",
      "type":"csv",
      "properties": {
          "delimiter": ","
      }
  },
  {
      "id":"industry",
      "type":"fixed width",
      "properties": {
          "delimiter": ","
      }
  },
  {
      "id":"country",
      "type":"VSAM",
      "properties": {
          "delimiter": ","
      }
  },
]

function localStorageFetch() {
    this.commit('catalog/fetchListSuccess',{data:catalogEntries});
}
export default createCrudModule({
  resource: 'catalog',
  actions: {
      fetchList: localStorageFetch
  }
});