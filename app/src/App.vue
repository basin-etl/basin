<template lang="pug">
v-app
  //-
  //- global components
  //-
  confirm(ref="confirm")
  prompt(ref="prompt")
  //-
  //- main layout
  //-
  v-app-bar(app,dense,color="white",:clipped-left="drawer")
    v-toolbar-title.mr-2.pa-2(style="height:100%")
      router-link(to="/")
        div(:style="{'position':'relative','height':'100%'}")
          inline-svg.logo(
            :src="require('@/assets/images/yoga.svg')",height="100%",
            :fill="connectionStatus=='connected'?'#4654A3':'grey'"
            v-bind:class="{ 'logo-busy': kernelStatus=='busy' }"
          )
          inline-svg(
            :src="require('@/assets/images/yoga.svg')",
            fill="#4654A3",
            height="100%",
          )
    span(:style="{'font-weight':'bold'}",:title="`kernel: ${kernelStatus} ${connectionStatus}`") DataYoga 
    v-spacer
    router-link(to="/catalog")
      | Catalog
    router-link.ml-3(to="/connector")
      | Connectors
    router-link.ml-3(to="/flow")
      | Flows
    router-link.ml-3(to="/")
      | Lineage
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

<script lang="ts" src="./App.ts">
</script>
<style>
.table-content {
  max-width: 1150px;
  margin-right: 20px;
  margin-left: 20px;
}
.height-100 {
  height: 100%
}
.logo {
  position: absolute
}
.logo-busy {
    animation: logo-blur 1s linear infinite;
    animation-direction: alternate-reverse;
}
@keyframes logo-blur {
  0% { -webkit-filter: blur(0px);}
  50% { -webkit-filter: blur(5px);}
  100% { -webkit-filter: blur(0px);}
}
</style>