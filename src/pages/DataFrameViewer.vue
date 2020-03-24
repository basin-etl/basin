<template>
<div  class="flex-grow-1">
    <div ref="bla"></div>
    <v-btn @click="loadData"></v-btn>
</div>
</template>

<script>
    import HyperGrid from "fin-hypergrid";
    import jupyterUtils from '@/pages/jupyterUtils.ts'
    let grid = null
    export default {
        name: 'App',
        data() {
            return {
                columnDefs: null,
                rowData: null,
                kernel: null,
            }
        },
        methods: {
            loadData() {
                let data = []
                for (var i=0; i<1000; i++) {
                    data.push({ symbol: 'APPL', name: 'Apple Inc.', prevclose: 93.13 })
                }
                grid.setData(data)
            }
        },
        components: {
        },
        async mounted() {
            this.kernel = await jupyterUtils.getKernel()
            let response = await jupyterUtils.sendToPython(this.kernel,`
import numpy as np
import pandas as pd
df = pd.DataFrame(np.random.rand(1000,3),columns=["a","b","c"])
`)
            console.log(response)
            let df = await jupyterUtils.dataframeInfo(this.kernel,"df")
            console.log(df)
            grid = new HyperGrid(this.$refs["bla"],
                { data: df.data });
        }
    }
</script>