const Events = require("events");

class WaitingQueue extends Events {
    constructor() {
        super();
        this._queue = [];
        this.on("worker-ready", (worker) => {
            const taskFn = this._queue.shift();
            if (taskFn) {
                taskFn(worker);
            }
        });
    }

    runTask(param) {
        return new Promise((resolve, reject) => {
            this._queue.push((worker) => {
                worker.work(param)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
}

module.exports = WaitingQueue;