<template lang="pug">
v-row.ma-0.fill-height.flex-column.flex-nowrap
    v-row.flex-grow-0
        v-col.flex-grow-0
            | Filter expression:
        v-col
            v-text-field(
                v-model="expression",
                @keydown.enter="loadData"
            )
    v-row(no-gutters).flex-column
        div.flex-grow-1.grid(v-show="kernel && data",ref="dataGrid")
        v-row.overlay(no-gutters,justify="center",align="center",v-if="!kernel || !data || loading")
            v-progress-circular(indeterminate)
    //-
    //- row detail popup
    //-
    v-dialog(v-model="showDetails" width="80%")
        v-card
            v-card-title
                | title
            v-card-text
                v-row(v-for="(value,key) in details" :key="key")
                    v-col.flex-grow-0 {{key}}:
                    v-col {{value}}
            v-card-actions
                v-spacer
                v-btn(color="green darken-1" text @click="showDetails = false") Close

        
</template>

<script>
import HyperGrid from "fin-hypergrid";
import jupyterUtils from '@/core/jupyterUtils'
import axios from 'axios'
import { Table, Data } from 'apache-arrow';

var DatasaurBase = require('datasaur-base');
const ArrowDataModel = require('./ArrowDataModel.js')
let dataModel = null
export default {
    name: 'DataFrameViewer',
    props: {
        kernel: Object,
        dataframe: null
    },
    watch: { 
      	kernel: function(newVal, oldVal) {
            console.log("kernel initialized")
            //
            // init arrow data model and grid
            //
            dataModel = new ArrowDataModel(new DatasaurBase,{},null)
            this.grid = new HyperGrid(this.$refs["dataGrid"],
                {
                    dataModel : dataModel,
                }
            );
            this.grid.properties.rowHeaderCheckboxes = false
            this.grid.addEventListener('fin-click', (event) => {
                console.log(event)
                this.openRow(event.detail.row.toJSON())
            });
            // override default stylesheet for grid
            var defaultStylesheet = document.getElementById("injected-stylesheet-finbar-base");
            var myStylesheet = document.createElement('style');
            myStylesheet.innerText = `
                div.finbar-vertical > .thumb {
                    background-color: black;
                    opacity:0.65
                }
                div.finbar-horizontal > .thumb {
                    background-color: black;
                    opacity:0.65
                }
                `
            defaultStylesheet.parentElement.insertBefore(myStylesheet, defaultStylesheet.nextElementSibling);

            //
            // register comm target for callback of object inspection
            //
            const $vm = this
            this.kernel.registerCommTarget('inspect_df', (comm, commMsg) => {
                if (commMsg.content.target_name !== 'inspect_df') {
                    return;
                }
                comm.onMsg = msg => {
                    console.log("got msg")
                    console.log(msg)
                    let t = Table.from(msg.buffers[0].buffer)
                    this.data = t
                    dataModel.setData(t)
                    this.loading = false
                };
                comm.onClose = msg => {
                    console.log(msg.content.data);
                };
            });
            // load the dataframe unfiltered
            this.loadData(this.dataframe)
        }
    },
    data() {
        return {
            expression: this.dataframe,
            grid: null,
            data: null,
            showDetails: false,
            loading: false,
            details: {} // details of the selected row
        }
    },
    methods: {
        openRow(row) {
            this.details = row
            this.showDetails = true
            // console.log(ArrowDataModel.)
        },
        async loadData() {
            this.loading=true
            console.log(`loading ${this.expression}`)
            jupyterUtils.inspectDataframe(this.kernel,this.expression)
        }
    },
    components: {
    },
    async mounted() {
    }

}
</script>
<style scoped>
.grid {
    background-color: lightgray
}
.overlay {
    position:absolute;
    width:100%;
    height:100%;
    background-color:gray;
    opacity:0.5;
}
</style>