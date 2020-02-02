const StaticPool = require("./StaticPool");

const filePath = `${__dirname}/worker.js`;

const pool = new StaticPool({
    size: 20,
    task: filePath,
    workerData: "workerData!"
});

for (let i = 0; i < 20; i++) {
    (async () => {
        const res = await pool.exec("https://www.google.com.br");
        console.log(res);
    })();
}