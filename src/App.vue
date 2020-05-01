<template lang="pug">
v-app
  //-
  //- global components
  //-
  confirm(ref="confirm")
  prompt(ref="prompt")
  //-
  //- navigation drawer
  //-
  //- v-navigation-drawer(left,floating,v-model="drawer",persistent="false",clipped,temporary,app)
  //-   v-list
  //-     v-list-tile(:to="{name: 'admin-loans-list'}",@click="drawer=false")
  //-       v-list-tile-content
  //-         v-list-tile-title Option 1
  //-     v-list-tile(:to="{name: 'admin-loans-list'}",@click="drawer=false")
  //-       v-list-tile-content
  //-         v-list-tile-title Option 2
  //-     v-list-tile(:to="{name: 'admin-loans-list'}",@click="drawer=false")
  //-       v-list-tile-content
  //-         v-list-tile-title Option 3
  //-     v-list-tile(:to="{name: 'admin-loans-list'}",@click="drawer=false")
  //-       v-list-tile-content
  //-         v-list-tile-title Option 4
  //-
  //- main layout
  //-
  v-app-bar(app,dense,color="white",:clipped-left="drawer")
    v-toolbar-title.mr-2.pa-2(style="height:100%")
      router-link(to="/")
        img(src="@/assets/images/logo.png",style="height:100%")
    span(:style="{'font-weight':'bold'}") SuperGlue Studio
    v-spacer
    router-link(to="/catalog")
      | Catalog
    router-link.ml-3(to="/flow")
      | Flows
    v-btn.ml-3(icon)
      v-icon settings
    //- authentication
    //- template(v-if='$auth.check()')
    //-   v-menu(offset-y='')
    //-       v-btn(color='primary', flat, icon, slot='activator')
    //-           v-avatar.teal(size="32px",:title="`${this.$auth.user().firstname}`")
    //-               span.white--text.headline {{this.$auth.user().firstname | substr(0,1)}}
    //-       v-list
    //-           v-list-tile(@click='$auth.logout({redirect:{name:"login"}})')
    //-               v-list-tile-title logout
    //- template(v-else)
    //-   v-btn(flat,:to="{name:'register'}") sign up
    //-   v-btn(flat,:to="{name:'login'}") login
  v-content
    v-container.ma-0.pa-0(fluid,fill-height,:style="{'align-items':$root.$data.$loading?'center':'start','justify-content':'center'}")
      //- data loading spinner
      v-progress-circular(indeterminate,color="primary",v-show="$root.$data.$loading")
      router-view(v-show="!$root.$data.$loading")
  v-footer
    v-spacer
    div.text-xs-left &copy; 2020
</template>

<script>
import Confirm from '@/components/confirm/Confirm.vue'
import Prompt from '@/components/prompt.vue'
export default {
  name: 'App',
  data: () => ({
    //
    drawer: false
  }),
  components: {
    Confirm,
    Prompt,
  },
  mounted() {
    this.$root.$confirm = this.$refs.confirm;
    this.$root.$prompt = this.$refs.prompt;

    // cleanup active kernel
    window.addEventListener('beforeunload', () => {
      this.$store.dispatch('job/destroy')
    }, false)
  },
  beforeDestroy() {
    // cleanup active kernel
    this.$store.dispatch('job/destroy')
  },
  async created() {
    // initialize kernel
    this.$store.dispatch('job/initialize')
  }

};
</script>
<style>
.height-100 {
  height: 100%
}
</style>