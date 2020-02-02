const { parentPort, workerData } = require("worker_threads");
const axios = require("axios").default;

function doRequest(url){
    return axios.get(url);
}

parentPort.on("message", async (param) => {
    const result = await doRequest(param);
    parentPort.postMessage(JSON.stringify(result.status));
});