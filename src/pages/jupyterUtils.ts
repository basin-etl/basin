var services = require("@jupyterlab/services");
async function getKernel() {
	var settings = services.ServerConnection.makeSettings({ 'baseUrl': '/ijupyter',
	'wsUrl': 'ws://127.0.0.1:9007/',
	'token': 'nstjupyter' });
    let kernelManager = new services.KernelManager({serverSettings: settings})
	let kernel = await kernelManager.startNew({name: 'python'})
    console.log(kernel)
    return kernel
}
export default {
    getKernel: getKernel
}