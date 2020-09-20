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
import {HTMLPerspectiveViewerElement, PerspectiveElement} from "@finos/perspective-viewer";
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
    destroyed() {
        console.log("destroying")
        this.kernel.removeCommTarget('inspect_df',() => { console.log('removed')})
        this.kernel.interrupt()

    }
    async mounted() {
        this.expression = this.dataframe
        const vm = this
        console.log("kernel initializing")
        let viewer = <HTMLPerspectiveViewerElement>document.getElementById("view1");
        viewer.addEventListener("dblclick", async (event:any) => {
            console.log(event)
            let table = viewer.getElementsByTagName("regular-table")[0]
            // fetch metadata containing the selected column and row
            // TODO: handle click of headers
            let metaData = (<any>table).get_meta(event.target)
            let rows = await (<any>viewer).table.view().to_json({start_row:metaData.ridx,end_row:metaData.ridx+1})
            vm.details = rows[0]
            vm.showDetails = true
        })
        //
        // register comm target for callback of object inspection
        //
        this.kernel.registerCommTarget('inspect_df', (comm, commMsg) => {
            if (commMsg.content.target_name !== 'inspect_df') {
                return;
            }
            comm.onMsg = async msg => {
                console.log("got msg callback")
                var viewer = <HTMLPerspectiveViewerElement>document.getElementById("view1");
                    
                // let worker = perspective.worker();
                // viewer.addEventListener('perspective-view-update', () => { console.log('updated')})
                if (!viewer) return
                await viewer.update(<any>(<DataView>msg.buffers[0]).buffer)
                // viewer.update(<any>worker.table(<any>(<DataView>msg.buffers[0]).buffer))
                if (!(<any>viewer)._show_config) await viewer.toggleConfig();
                //TODO find a better place for this. limit treemap to less cells otherwise chokes on large datasets
                (<any>window).getPlugin("d3_treemap").max_cells=200;
                // viewer.on_up viewer.notifyResize()
                // await vm.$nextTick()
                vm.loading = false
                let recordCount = await viewer.table.size()
                let columnCount = (await viewer.table.columns()).length
                console.log(recordCount)
                vm.recordCount = recordCount
                vm.columnCount = columnCount
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
