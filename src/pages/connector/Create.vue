<template lang="pug">
v-row.mt-5(justify="center",align="start")
  v-row.flex-column.table(align="start",no-gutters)
    v-breadcrumbs.pl-0(:items="breadcrumbs",divider=">")
    v-form(
      v-model="valid"
    )
  
      v-text-field.form-field.flex-grow-0(@keydown.space.prevent,v-model="name",label="connector name",:rules="[rules.required]")
      v-select.flex-grow-0(v-model="properties.type",
              :items="connectorTypes"
              item-text="label"
              item-value="value"
              label="Data source")
        
    div
      v-btn(
        :disabled="!valid || loadingPreview",
        @click="preview",
        :loading="loadingPreview"
      ) Test Connection
      v-btn.ml-3(color="success",:disabled="!valid",@click="save") Save
  v-snackbar(color="success",right,
    v-model="success")
    | Saved successfully
  v-snackbar(color="error",right,
    v-model="showError")
    | {{ error }}

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