const events = require("events");
const fs = require("fs");
const myfile = "sample.log";
const bf = require('buffer');
const NUM_LINES = 10;
// const buffer = new Buffer.alloc(bf.constants.MAX_STRING_LENGTH);

class LogWatcher extends events.EventEmitter {
    constructor(myfile) {
        super();
        this.myfile = myfile;
        this.store = [];
    }

    getLogs() {

        return this.store;
    }

    watch(curr, prev) {

        const watcher = this;
        const fileSizeDiff = curr.size - prev.size;
        if (fileSizeDiff > 0) {
            const buffer = Buffer.alloc(fileSizeDiff);

            fs.open(this.myfile, (err, fd) => {
                if (err) throw err;
                let data = '';
                let logs = [];

                fs.read(fd, buffer, 0, buffer.length, prev.size, (err, bytesRead) => {
                    if (err) throw err;
                    if (bytesRead > 0) {
                        data = buffer.slice(0, bytesRead).toString();
                        logs = data.split("\n").slice(1);
                        console.log("New Log Read:" + logs);


                        if (logs.length >= NUM_LINES) {
                            logs.slice(-10).forEach((elem) => this.store.push(elem));
                        } else {
                            logs.forEach((elem) => {
                                if (this.store.length == NUM_LINES) {
                                    console.log("log added to queue");
                                    this.store.shift();
                                }
                                this.store.push(elem);
                            });
                        }
                        watcher.emit("myevent", logs);
                    }
                });
            });
        }
    }
    start() {

        var watcher = this;
        fs.open(this.myfile, (err, fd) => {
            if (err) throw err;
            let data = '';
            let logs = [];
            fs.fstat(fd, (err, stats) => {
                if (err)
                    throw err;
                const buffer = Buffer.alloc(stats.size);

                fs.read(fd, buffer, 0, buffer.length, 0, (err, bytesRead) => {
                    if (err) throw err;
                    if (bytesRead > 0) {
                        data = buffer.slice(0, bytesRead).toString();
                        logs = data.split("\n");
                        this.store = [];
                        logs.slice(-10).forEach((elem) => this.store.push(elem));
                    }
                    fs.close(fd);
                });


                fs.watchFile(this.myfile, { "interval": 1000 }, function (curr, prev) {
                    watcher.watch(curr, prev);
                });
            });
        });
    }
}

module.exports = LogWatcher; 
