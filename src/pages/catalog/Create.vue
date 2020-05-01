<template lang="pug">
v-row.mt-5(justify="center",align="start")
  v-row.flex-column.table(align="start",no-gutters)
    v-breadcrumbs.pl-0(:items="breadcrumbs",divider=">")
    v-form(
      v-model="valid"
    )
  
      v-text-field.form-field.flex-grow-0(@keydown.space.prevent,v-model="name",label="source name",:rules="[rules.required]")
      v-text-field.form-field.flex-grow-0(v-model="properties.location",label="file name regexp",:rules="[rules.required]")
      v-select.flex-grow-0(v-model="properties.type",
              :items="fileTypes"
              item-text="label"
              item-value="value"
              label="Type of file")
        
      template(v-if="properties.type=='delimited'")
        v-text-field.form-field.flex-grow-0(v-model="properties.Delimiter",label="Delimiter")
        v-text-field.form-field.flex-grow-0(v-model="properties.SkipHeader",label="# of header rows to skip")
        v-text-field.form-field.flex-grow-0(v-model="properties.SkipFooter",label="# of footer rows to ignore")
        v-switch(v-model="properties.header",label="File has a header")
    div
      v-btn(:disabled="!valid",@click="test") Test
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
  v-bottom-sheet(v-model="showDataframePanel",height="500px",transition="")
    v-sheet(height="500px",:style="{'border-radius':'0'}")
      DataFrameViewer(:kernel="kernel",dataframe="df",v-if="showDataframePanel && kernel")

</template>

<script lang="ts" src="./Create.ts">
</script>

<style scoped>
.table {
  max-width: 1150px
}
.form-field {
  max-width: 300px
}
</style>