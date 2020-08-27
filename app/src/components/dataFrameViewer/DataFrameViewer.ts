// TODO: history of commands 
import jupyterUtils from '@/core/jupyterUtils'
import axios from 'axios'
import { Table, Data } from 'apache-arrow';
import RowDetails from './RowDetails.vue'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import { Kernel } from "@jupyterlab/services"
import perspective from "@finos/perspective";
import "@finos/perspective-viewer";
import {HTMLPerspectiveViewerElement} from "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import "@finos/perspective-viewer/themes/material.css";

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
    errorMessage:string = null
    showErrorSnackbar = false
    initialized = false
    recordCount:number = null
    columnCount:number = null
    expanded = false
    
    @Watch('dataframe', { immediate: true})
    onDataframeChanged(newVal:string, oldVal:string) {
        this.expression = this.dataframe
        if (this.initialized) this.loadData()
    }
    expand() {
        this.expanded = true
        this.$emit("expand")
    }
    contract() {
        this.expanded = false
        this.$emit("contract")
    }
    async mounted() {
        this.expression = this.dataframe
        console.log("kernel initializing")

        //
        // register comm target for callback of object inspection
        //
        const vm = this
        this.kernel.registerCommTarget('inspect_df', (comm, commMsg) => {
            if (commMsg.content.target_name !== 'inspect_df') {
                return;
            }
            comm.onMsg = async msg => {
                console.log("got msg callback")
                let t = Table.from((<DataView>msg.buffers[0]).buffer)
                console.log(t.count())
                console.log(t)
                vm.data = msg
                vm.recordCount = t.count()
                vm.columnCount = t.numCols
                if (t.count()>0) {
                    vm.data = t
                    var viewer = <HTMLPerspectiveViewerElement>document.getElementById("view1");
                    
                    let worker = perspective.worker();
                    viewer.addEventListener('perspective-view-update', () => { console.log('updated')})
                    viewer.load(worker.table(<any>(<DataView>msg.buffers[0]).buffer))
                    await viewer.toggleConfig();
                    //TODO find a better place for this
                    (<any>window).getPlugin("d3_treemap").max_cells=200;
                    // viewer.on_up viewer.notifyResize()
                    await vm.$nextTick()
                    vm.loading = false
                }
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
        this.initialized = true
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
        this.errorMessage = null
        console.log(`loading ${this.expression}`)
        try {
            await jupyterUtils.inspectDataframe(this.kernel,vm.expression,this.dataframeType)
        }
        catch (e) {
            this.errorMessage = `${e.ename}: ${e.evalue}`
            this.showErrorSnackbar = true
        }
    }
}
