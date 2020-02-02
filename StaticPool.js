const Pool = require("./Pool");
const PoolWorker = require("./PoolWorker");

const fnReg = /^task[^]*([^]*)[^]*{[^]*}$/;

function createScript(fn) {
    const strFn = fn.toString();
    let expression = "";
    if (fnReg.test(strFn)) {
        expression = "function " + strFn;
    } else {
        expression = strFn;
    }
    return `
    const { parentPort, workerData } = require('worker_threads');
    this.workerData = workerData;
    const container = {
      workerData,
      task: (${ expression})
    };
    
    parentPort.on('message', (param) => {
      parentPort.postMessage(container.task(param));
    });
  `;
}

class StaticPool extends Pool {
    constructor({ size, task, workerData }) {
        super(size);
        switch (typeof task) {
            case 'string': {
                this.fill(() => new PoolWorker(task, { workerData }));
                break;
            }

            case 'function': {
                const script = createScript(task);
                this.fill(() => new PoolWorker(script, { eval: true, workerData }));
                break;
            }

            default: throw new Error("Invalid type of 'task'!")
        }
    }

    exec(param) {
        if (typeof param === 'function') {
            throw new Error('"param" can not be a function!');
        }
        return this.runTask(param);
    }
}

module.exports = StaticPool;