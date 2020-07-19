<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
    v-row(no-gutters,align="center").flex-grow-0.px-3
        v-text-field(
            :style="{'max-width':'500px'}",
            label="Filter expression",
            :hint="`use ${this.dataframe} to refer to current dataframe`",
            v-model="expression",
            @keydown.enter="loadData"
        )
        v-spacer
        v-btn(icon,v-if="!expanded",@click="expand")
            v-icon() expand_less
        v-btn(icon,v-if="expanded",@click="contract")
            v-icon() expand_more
    v-row(no-gutters).flex-column
        div.flex-grow-1.grid(v-show="kernel && data && !loading && recordCount>0",ref="dataGrid")
        v-row.overlay(no-gutters,justify="center",align="center",v-show="!kernel || !data || loading")
            v-progress-circular(v-if="!errorMessage",indeterminate)
            v-icon(v-if="errorMessage") error_outline
        v-row.overlay(no-gutters,justify="center",align="center",v-show="!loading && recordCount==0")
            | no results
    div.status-bar.px-3
        div(v-if="!loading")
            | loaded {{recordCount | numFormat}} records, {{columnCount | numFormat}} columns
        div(v-if="loading && !errorMessage")
            | loading...
        div(v-if="errorMessage")
            | {{errorMessage}}
    //-
    //- row detail popup
    //-
    v-dialog(v-model="showDetails",width="80%",transition="",content-class="row-detail-dialog")
        RowDetails(:row="details",v-on:close="showDetails=false")
    //-
    //- error snackbar
    //-
    v-snackbar(
        v-model="showErrorSnackbar",
        color="error"
    )
        | {{errorMessage}}
        v-btn(
            dark
            text
            @click="showErrorSnackbar = false"
        ) Close

</template>

<script lang="ts" src="./DataFrameViewer.ts">
</script>
<style scoped>
.status-bar {
    background-color: gray;
    height: 20px;
    color:white;
    font-size: 11px;
    display:flex;
    flex-direction:column;
    justify-content: center;
}
.grid {
    background-color: lightgray;
    height: 100%
}
.overlay {
    background-color:gray;
    opacity:0.5;
}
</style>
<style>
.row-detail-dialog {
    height: 90%
}
</style>
