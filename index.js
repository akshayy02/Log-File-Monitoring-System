const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const Watcher = require('./monitor');

const PORT = 3000 || 4000;

app.use(express.static(__dirname));

const watcher = new Watcher("sample.log");
watcher.start();

app.get('/log', (req, res, next) => {
    console.log("Request received for /log");
    const options = { root: __dirname };

    res.sendFile('index.html', options, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            next(err);
        } else {
            console.log('Sent: index.html');
        }
    });
});


io.on('connection', (socket) => {
    console.log("New connection established with id:", socket.id);

    watcher.on("myevent", (data) => {
        socket.emit("live-log-update", data);
    });

    
    const data = watcher.getLogs();
    socket.emit("initial-log", data);
});



http.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
