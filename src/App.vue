<template lang="pug">
v-app
  //-
  //- global components
  //-
  //- confirm(ref="confirm")
  //- prompt(ref="prompt")
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
    v-toolbar-side-icon(@click.stop='drawer = !drawer')
    v-toolbar-title.mr-2(style="height:100%")
      a(href="/")
        img(src="@/assets/images/logo.png",style="height:100%")
    v-spacer
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
  //- data loading spinner
    v-layout(column,align-center,justify-center)
      div(v-show="$root.$data.$loading || !$auth.ready()")
        v-progress-circular(indeterminate,color="primary")
  v-content
    v-container(fluid,fill-height)
      router-view
  v-footer
    v-spacer
    div.text-xs-left &copy; 2020
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>
