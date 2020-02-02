const WaitingQueue = require("./WaitingQueue");

class Pool {

    constructor(size) {
        this.workers = new Array(size).fill();
        this._createWorker = null;
        this.queue = new WaitingQueue();
    }

    _addWorkerHooks(worker) {
        worker.on("ready", (worker) => {
            this.queue.emit("worker-ready", worker);
        });

        worker.once("exit", (code) => {
            if (code == 0) {
                return;
            }
            this.replace(worker);
            worker.terminate();
            worker.removeAllListeners();
        });
    }

    _setWorkerGen(fn) {
        this._createWorker = () => {
            const worker = fn();
            this._addWorkerHooks(worker);
            return worker;
        }
    }

    fill(workerGen) {
        this._setWorkerGen(workerGen);
        this.workers = this.workers.map(() => this._createWorker());
    }

    async runTask(task) {
        const worker = this.workers.find((worker) => worker.isReady);
        if (!worker) {
            const result = await this.queue.runTask(task);
            return result;
        }

        const result = await worker.work(task);
        return result;
    }

    replace(worker) {
        const i = this.workers.indexOf(worker);
        if (i > 0) {
            this.workers[i] = this._createWorker();
        }
    }

    destroy() {
        this.workers.forEach((worker) => worker.terminate());
        this.workers = null;
    }
}

module.exports = Pool;