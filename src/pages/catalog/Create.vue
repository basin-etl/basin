
<template lang="pug">
v-row.mt-5(justify="center",align="start")
  v-row.flex-column.table(align="start",no-gutters)
    v-breadcrumbs.pl-0(:items="breadcrumbs",divider=">")
    v-form(
      v-model="valid"
    )
  
      v-text-field.form-field.flex-grow-0(@keydown.space.prevent,v-model="name",label="source name",:rules="[rules.required]")
      //- v-text-field.form-field.flex-grow-0(v-model="properties.location",label="file name regexp",:rules="[rules.required]")
      v-autocomplete.form-field.flex-grow-0(v-model="properties.location",:items="files",label="file name regexp",:rules="[rules.required]")
        template(
          v-slot:item="{ item }"
        )
          | {{item.text}} ({{(item.size/1024/1024).toFixed(2)}})
      v-select.flex-grow-0(v-model="properties.type",
              :items="fileTypes"
              item-text="label"
              item-value="value"
              label="Type of file")
        
      template(v-if="properties.type=='delimited'")
        v-switch(v-model="properties.header",label="File has a header")
        v-text-field.form-field.flex-grow-0(v-model="properties.delimiter",label="Delimiter")
        v-text-field.form-field.flex-grow-0(v-model="properties.skipHeaderLines",label="# of header rows to skip")
        v-text-field.form-field.flex-grow-0(v-model="properties.skipFooterLines",label="# of footer rows to ignore")
    div
      v-btn(
        :disabled="!valid || loadingPreview",
        @click="preview",
        :loading="loadingPreview"
      ) Preview
      v-btn.ml-3(color="success",:disabled="!valid",@click="save") Save
  v-snackbar(color="success",right,
    v-model="success")
    | Saved successfully
  v-snackbar(color="error",right,
    v-model="showError")
    | {{ error }}
  //-
  //- bottom sheet
  //-
  v-bottom-sheet.d-flex.flex-column(
    v-model="showDataframePanel",:content-class="showDataframePanelExpanded?'expanded-dataviewer':'dataviewer'",transition="")
    v-sheet(height="100%",:style="{'border-radius':'0'}")
      DataFrameViewer(
        :kernel="kernel",
        dataframe="df",
        v-if="showDataframePanel && kernel"
        @expand="expandViewer()",
        @contract="contractViewer()",
      )

</template>

<script lang="ts" src="./Create.ts">
</script>
<style>
.expanded-dataviewer {
  height: 80%
}
.dataviewer {
  height: 500px
}
</style>
<style scoped>
.table {
  max-width: 1150px
}
.form-field {
  max-width: 300px
}
</style>