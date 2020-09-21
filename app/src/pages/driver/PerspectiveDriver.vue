<template lang="pug">
v-row.fill-height(no-gutters)
  | hello
  perspective-viewer.flex-grow-1(id="view1")
</template>

<script lang="ts">
import "@finos/perspective-viewer";
import {HTMLPerspectiveViewerElement} from "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import { Prop, Component, Watch } from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  components: {
    // 'perspective-viewer':HTMLPerspectiveViewerElement
  }
})
export default class PerspectiveDriver extends Vue {
  async mounted() {

 var data = [
    { x: 1, y: "a", z: true },
    { x: 2, y: "b", z: false },
    { x: 3, y: "c", z: true },
    { x: 4, y: "d", z: false }
  ];

    var viewer = <HTMLPerspectiveViewerElement>document.getElementById("view1");
    await viewer.load(data);
    await viewer.toggleConfig()
  }

}
</script>

