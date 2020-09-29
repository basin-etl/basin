<template lang="pug">
.d-flex.flex-column
  div
    v-autocomplete(:return-object="false",multiple,
      v-model="local.input_columns",small-chips,
      :items="inputSchema.df?inputSchema.df.map( (v) => { return { text: (v.tablealias ? v.tablealias + '.' : '') + v.name }}):[]",
      label="Source Column")
  div
    v-text-field(v-model="local.alias",label="Output column name")
  div.flex-grow-1.d-flex.flex-column
    .function-spec
      | def myudf({{local.parameters.join(",")}}):
    MonacoEditor.flex-grow-1(
      class="editor",
      theme="vs",
      :code="local.code",
      language="python",
      @mounted="editorMount",
      @codeChange="codeChanged"
      :options="{glyphMargin: false, folding: false, minimap: { enabled: false }}")
</template>

<script lang="ts">
import * as monaco from 'monaco-editor';
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'
import MonacoEditor from 'vue-monaco-editor'
import BlockProperties from '@/components/BlockProperties'
@Component({
  components: {
    MonacoEditor
  }
})

export default class PythonUDFBlockProperties extends BlockProperties {
  @Prop({ default: ():string[] => ([]) }) input_columns: string[]
  @Prop(String) alias: string
  @Prop({default: "# your awesome code goes here\nend with a return statement\nreturn myval"}) code: string
  @Prop({ default: ():string[] => ([]) }) parameters: string[]

  codeChanged(editor:monaco.editor.IStandaloneCodeEditor) {
    this.local.code = editor.getValue()
  }
  editorMount(editor:monaco.editor.IStandaloneCodeEditor) {
    // call layout to make editor fill available space
    editor.layout()
    console.log(editor)
    monaco.editor.defineTheme('basintheme', {
        base: 'vs', // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules
        rules: [],
        colors: {
            "editor.background": '#EEEEEE'
            }
    });
    monaco.editor.setTheme("basintheme")
  }
  @Watch('local.input_columns', { immediate: true})
  onInputColumnsChanged(newVal:string,oldVal:string) {
    if (this.local.input_columns) {
      console.log(this.local.input_columns)
      this.local.parameters = this.local.input_columns.map( (col:string) => 'in_'+ col.toLowerCase().split('.').reverse()[0].replace(/[^\w_]/gi,'_') )

    }
  }

}
</script>
<style scoped>
.function-spec {
  font-family: monospace;
  margin-bottom: 5px
}
</style>
<style>
.monaco-editor {
  overflow:hidden;
}
</style>