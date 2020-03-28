import { KernelManager, ServerConnection } from "@jupyterlab/services";
async function getKernel() {
    var settings = ServerConnection.makeSettings({ 'baseUrl': '/ijupyter',
        'wsUrl': 'ws://127.0.0.1:9007/',
        'token': 'nstjupyter' });
    let kernelManager = new KernelManager({ serverSettings: settings });
    let kernel = await kernelManager.startNew();
    console.log(kernel);
    return kernel;
}
function readMsg(future) {
    return new Promise(resolve => {
        future.onIOPub = resolve;
    });
}
async function dataframeInfo(kernel, df) {
    let cmd = `
print(${df}.dtypes.to_frame('dtype').reset_index().rename(columns={"index":"column"}).astype('str').to_json(orient='records'))
	`;
    let response = await sendToPython(kernel, cmd);
    let columns = JSON.parse(response);
    let datacmd = `
print(${df}.to_json(orient='records'))
	`;
    response = await sendToPython(kernel, datacmd);
    let data = JSON.parse(response);
    return {
        columns: columns,
        data: data
    };
}
async function sendToPython(kernel, cmd) {
    let future = await kernel.requestExecute({ code: cmd });
    let result = '';
    while (true) {
        let msg = await readMsg(future);
        if (msg.header.msg_type == 'status' &&
            msg.content.execution_state == 'idle') {
            // request ended
            return result;
        }
        if (msg.header.msg_type == 'error') {
            throw ({
                "ename": msg.content.ename,
                "evalue": msg.content.evalue
            });
        }
        if (msg.header.msg_type == 'stream' &&
            msg.content.name == 'stdout') {
            result += msg.content.text;
        }
    }
}
function inspectDataframe(kernel, expression) {
    let code = `
	batch = pa.RecordBatch.from_pandas(${expression})
	sink = pa.BufferOutputStream()
	writer = pa.RecordBatchStreamWriter(sink, batch.schema)
	writer.write_batch(batch)
	comm = Comm(target_name="inspect_df")
	comm.send(data="test",buffers=[sink.getvalue()])
	comm.close(data="closing comm")
	`;
    kernel.requestExecute({ code: code });
}
export default {
    getKernel: getKernel,
    sendToPython: sendToPython,
    dataframeInfo: dataframeInfo,
    inspectDataframe: inspectDataframe
};
//# sourceMappingURL=jupyterUtils.js.map