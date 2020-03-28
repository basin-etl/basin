<template lang="pug">
DataFrameViewer(:kernel="kernel",dataframe="df")
  
</template>

<script>
import DataFrameViewer from '@/components/dataFrameViewer/DataFrameViewer'
import jupyterUtils from '@/core/jupyterUtils'
export default {
    name: "DataFrameViewerDriver",
    components: {
        DataFrameViewer
    },
    data() {
        return {
            kernel: null
        }
    },
    async created() {
        // cleanup active kernel
        window.addEventListener('beforeunload', () => {
            console.log("shutting down kernel")
            this.kernel.shutdown()
        }, false)
        this.kernel = await jupyterUtils.getKernel()
        let code = `
from ipykernel.comm import Comm

import pyarrow as pa
import pandas as pd
df = pd.read_csv("./public/calendar.csv")
`;
      await this.kernel.requestExecute({ code: code }).done;

    }

}
</script>

<style>

</style>