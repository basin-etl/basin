<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
    v-row(no-gutters).flex-grow-0.px-3
        v-text-field(
            :style="{'max-width':'500px'}",
            label="Filter expression",
            :hint="`use ${this.dataframe} to refer to current dataframe`",
            v-model="expression",
            @keydown.enter="loadData"
        )
    v-row(no-gutters).flex-column
        div.flex-grow-1.grid(v-show="kernel && data && !loading",ref="dataGrid")
        v-row.overlay(no-gutters,justify="center",align="center",v-if="!kernel || !data || loading")
            v-progress-circular(indeterminate)
    //-
    //- row detail popup
    //-
    v-dialog(v-model="showDetails",width="80%",transition="",content-class="row-detail-dialog")
        RowDetails(:row="details",v-on:close="showDetails=false")
        
</template>

<script lang="ts" src="./DataFrameViewer.ts">
</script>
<style scoped>
.grid {
    background-color: lightgray;
    height: 100%
}
.overlay {
    position:absolute;
    width:100%;
    height:100%;
    background-color:gray;
    opacity:0.5;
}
</style>
<style>
.row-detail-dialog {
    height: 90%
}
</style>
