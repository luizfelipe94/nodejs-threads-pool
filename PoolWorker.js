const { Worker } = require('worker_threads');

class PoolWorker extends Worker {

    constructor(...args) {
        super(...args);
        this.isReady = false;
        this.once("online", () => {
            this.ready();
        });
    }

    work(param) {
        this.isReady = false;
        return new Promise((resolve, reject) => {
            const self = this;

            function message(res) {
                self.removeListener("error", error);
                self.ready();
                resolve(res);
            }

            function error(err) {
                self.removeListener("message", message);
                reject(err);
            }

            this.once("message", message);
            this.once("error", error);
            this.postMessage(param);
        });
    }

    ready() {
        this.isReady = true;
        this.emit("ready", this);
    }
}

module.exports = PoolWorker;