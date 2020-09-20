import { Kernel, KernelManager, ServerConnection } from "@jupyterlab/services"
import { IExecuteReplyMsg, IIOPubMessage, IReplyErrorContent, IStatusMsg, IStreamMsg } from '@jupyterlab/services/lib/kernel/messages';
async function getKernel() {
	var settings = ServerConnection.makeSettings({ 'baseUrl': '/ijupyter',
	// 'wsUrl': `ws://${process.env.VUE_APP_JUPYTER_SERVER_HOST}:${process.env.VUE_APP_JUPYTER_SERVER_PORT}/`,
	'token': 'superglue' });
    let kernelManager = new KernelManager({serverSettings: settings})
	let kernel = await kernelManager.startNew()
    console.log(kernel)
    return kernel
}

function readMsg(future:any): Promise<IIOPubMessage>{
    return new Promise(resolve => {
        future.onIOPub= resolve;
    });
}
async function dataframeInfo(kernel:Kernel.IKernelConnection,df:string) {
	let cmd = `
print(${df}.dtypes.to_frame('dtype').reset_index().rename(columns={"index":"column"}).astype('str').to_json(orient='records'))
	`
	let response = await sendToPython(kernel,cmd)
	let columns = JSON.parse(response)

    let datacmd = `
print(${df}.to_json(orient='records'))
	`
	response = await sendToPython(kernel,datacmd)
	let data = JSON.parse(response)
	return {
        columns: columns,
        data: data
    }
}
async function sendToPython(kernel:Kernel.IKernelConnection,cmd:string) {
	let future = await kernel.requestExecute({ code: cmd });
	let result = ''
	while (true) {
		let msg:IIOPubMessage = await readMsg(future)
		if (
			msg.header.msg_type=='status' &&
			(<IStatusMsg>msg).content.execution_state=='idle') {
			// request ended
			return result
		}
		if (msg.header.msg_type=='error') {
            throw({
                "ename":(<IReplyErrorContent>msg.content).ename,
				"evalue":(<IReplyErrorContent>msg.content).evalue});
		}
		if (msg.header.msg_type=='stream' &&
			(<IStreamMsg>msg).content.name=='stdout') {
			result += (<IStreamMsg>msg).content.text
		}
	}
}
async function setPythonVariable(kernel:Kernel.IKernelConnection,name:string,value:any): Promise<boolean> {
	await kernel.requestExecute({code:
`import json
${name} = json.loads('${JSON.stringify(value)}')`
})
	return true
}
async function getSchema(kernel:Kernel.IKernelConnection,dataframe:string): Promise<Array<JSON>> {
	// return JSON.parse(await sendToPython(kernel,`print(${dataframe}.schema.json())`))["fields"]
	return JSON.parse(await sendToPython(kernel,`print(common.utils.get_schema_with_aliases(${dataframe},format="json"))`))["fields"]
}
async function getDataframeCount(kernel:Kernel.IKernelConnection,expression:string,type='pyspark'): Promise<number> {
	let code = ""
	if (type=='pandas') {
		code += `
print(len(${expression}))
`
	}
	else {
		code += `
print(${expression}.count())
		`
	}
	let count = await sendToPython(kernel,code)
	return parseInt(count)
}
function inspectDataframe(kernel:Kernel.IKernelConnection,expression:string,type:string,limit=50000) {
	let code = ""
	if (type=='pandas') {
		code += `
batch = pa.RecordBatch.from_pandas(${expression})
batches = [batch]
`
	}
	else {
		code = `common.utils.stream_df_as_arrow(${expression},spark,${limit})`
	}

    return sendToPython(kernel,code)
}

export default {
    getKernel: getKernel,
    sendToPython: sendToPython,
	dataframeInfo: dataframeInfo,
	getDataframeCount: getDataframeCount,
	inspectDataframe: inspectDataframe,
	setPythonVariable: setPythonVariable,
	getSchema: getSchema
}