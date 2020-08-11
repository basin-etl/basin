<template lang="pug">
div
    v-bottom-sheet(v-model="show",height="300")
        v-sheet(height="500px")
            DataFrameViewer(:kernel="kernel",dataframeType="pandas",dataframe="df",v-if="kernel && show")
    v-btn(@click.stop="show=!show") Show
</template>

<script>
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer.vue'
import jupyterUtils from '@/core/jupyterUtils'
export default {
    name: "DataFrameViewerDriver",
    components: {
        DataFrameViewer
    },
    beforeDestroy() {
      console.log("shutting down kernel")
      this.kernel.shutdown()
    },
    data() {
        return {
            show:true,
            kernel: null
        }
    },
    async created() {
        // cleanup active kernel
        window.addEventListener('beforeunload', () => {
            console.log("shutting down kernel")
            this.kernel.shutdown()
        }, false)
        console.log("created")
        let kernel = await jupyterUtils.getKernel()
        let code = `
import pandas as pd
df = pd.read_csv("/opt/basin/data/calendar.csv")
`;
        await kernel.requestExecute({ code: code }).done;
        this.kernel = kernel
    }

}
</script>

<style>

</style>