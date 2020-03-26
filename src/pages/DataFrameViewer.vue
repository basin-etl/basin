<template lang="pug">
.flex-grow-1
    div(ref="dataGrid")
    v-text-field(
        v-model="expression",
        @keydown.enter="loadData"
    )
    v-btn(@click="loadData")
    //-
    v-dialog(v-model="showDetails" width="600px")
        v-card
            v-card-title
                | title
            v-card-text
                v-row(v-for="(value,key) in details")
                    v-col.flex-grow-0 {{key}}:
                    v-col {{value}}
            v-card-actions
                v-spacer
                v-btn(color="green darken-1" text @click="showDetails = false") Close

        
</template>

<script>
import HyperGrid from "fin-hypergrid";
import jupyterUtils from './jupyterUtils'
import axios from 'axios'
import { Table, Data } from 'apache-arrow';
// import testLocal from './testlocal'
var DatasaurBase = require('datasaur-base');
const ArrowDataModel = require('./ArrowDataModel.js')
let dataModel = null
export default {
    name: 'App',
    data() {
        return {
            expression: '',
            kernel: null,
            grid: null,
            showDetails: false,
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
            console.log(this.expression)
            jupyterUtils.inspectDataframe(this.kernel,this.expression)
        }
    },
    components: {
    },
    created() {
        // cleanup active kernel
        window.addEventListener('beforeunload', () => {
            console.log("are you sure you want to go away??")
            this.kernel.shutdown()
        }, false)
    },
    async mounted() {
        let arrow = await axios.get("/output2.arrow",{
            responseType: 'arraybuffer'
        })
        let data = Table.from(arrow.data)
        console.log(data)
        //
        // init arrow data model and grid
        //
        dataModel = new ArrowDataModel(new DatasaurBase,{},data)
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
        //
        // register comm target for callback of object inspection
        //
        const $vm = this
        this.kernel = await jupyterUtils.getKernel()
        this.kernel.registerCommTarget('inspect_df', (comm, commMsg) => {
            if (commMsg.content.target_name !== 'inspect_df') {
                return;
            }
            comm.onMsg = msg => {
                console.log("got msg")
                console.log(msg)
                let t = Table.from(msg.buffers[0].buffer)
                dataModel.setData(t)
            };
            comm.onClose = msg => {
                console.log(msg.content.data);
            };
        });
        let code = `
from ipykernel.comm import Comm

import pyarrow as pa
import pandas as pd
df = pd.read_csv("./public/calendar.csv")
`;
      await this.kernel.requestExecute({ code: code }).done;
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

    }

}
</script>
<style>
div.finbar-vertical > .thumb {
    background-color: black;
opacity:0.65

}
</style>