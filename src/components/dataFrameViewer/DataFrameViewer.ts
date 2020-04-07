// TODO: history of commands 
import HyperGrid from "fin-hypergrid";
import jupyterUtils from '@/core/jupyterUtils'
import axios from 'axios'
import { Table, Data } from 'apache-arrow';
import RowDetails from './RowDetails.vue'
var DatasaurBase = require('datasaur-base');
const ArrowDataModel = require('./ArrowDataModel.js')
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Kernel } from "@jupyterlab/services"
@Component({
    name: 'DataFrameViewer',
    components: {
        RowDetails
    },
})
export default class DataFrameViewer extends Vue {
    @Prop(String) readonly dataframe: string
    @Prop({default:'pyspark'}) readonly dataframeType: string
    @Prop(Object) readonly kernel: Kernel.IKernelConnection
    //
    // data
    //
    expression:string = this.dataframe
    grid:any = null
    data:any = null
    showDetails = false
    loading = false
    details = {} // details of the selected row
    dataModel:any = null

    @Watch('dataframe', { immediate: true})
    onDataframeChanged(newVal:string, oldVal:string) {
        this.expression = this.dataframe
        if (this.kernel) this.loadData()
    }
    async mounted() {
        this.expression = this.dataframe
        console.log("kernel initializing")
        //
        // init arrow data model and grid
        //
        this.dataModel = new ArrowDataModel(new DatasaurBase,{},null)
        this.grid = new HyperGrid(this.$refs["dataGrid"],
            {
                boundingRect: {
                    height: "100%"
                },
                dataModel : this.dataModel,
            }
        );
        this.grid.properties.rowHeaderCheckboxes = false
        this.grid.addEventListener('fin-double-click', (event:CustomEvent) => {
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
        const vm = this
        this.kernel.registerCommTarget('inspect_df', (comm, commMsg) => {
            if (commMsg.content.target_name !== 'inspect_df') {
                return;
            }
            comm.onMsg = msg => {
                console.log("got msg")
                console.log(msg)
                let t = Table.from((<DataView>msg.buffers[0]).buffer)
                vm.data = t
                vm.dataModel.setData(t)
                vm.loading = false
            };
            comm.onClose = msg => {
                console.log(msg.content.data);
            };
        });
        let code = `
from ipykernel.comm import Comm

import pyarrow as pa
import pandas as pd
`;
        await this.kernel.requestExecute({ code: code }).done;
        console.log("kernel callbacks initialized")
        // load the dataframe unfiltered
        this.loadData()
    }
    openRow(row:object) {
        this.details = row
        this.showDetails = true
        // console.log(ArrowDataModel.)
    }
    async loadData() {
        let vm = this
        this.loading=true
        console.log(`loading ${this.expression}`)
        jupyterUtils.inspectDataframe(this.kernel,vm.expression,this.dataframeType)
    }
}
