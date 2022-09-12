const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const fetch = require('node-fetch');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'));
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

var sockets = [];

io.on('connection', (socket) => {
    let socketId = socket.id;
    console.log(`${socket.id} connected`);
    // console.log('socket data:', socket.handshake.query.data);
    if (socket.handshake.query.data == 'listen') {
        console.log(`${socket.id} listening...`);
        sockets.push(socketId);
    }

    socket.on("disconnect", (reason) => {
        var index = sockets.indexOf(socketId);
        if (index != -1)
            sockets.splice(index, 1);
        console.log(`${socketId} disconnected (${reason})`);
    });

    socket.on("progress", (main) => {
        io.to(main).emit('progress', sockets.length + 1);
    });

    socket.on("results", (args) => {
        console.log(`Thread ${sockets.indexOf(socketId)} completed.`);
        io.to(args.main).emit('results', args);
    });

    socket.on("get", (args) => {
        console.log(sockets);
        const url = args.url;
        const start = +args.start;
        const end = +args.end + 1;
        const minDelay = +args.minDelay;
        const maxDelay = +args.maxDelay;
        const suffix = args.suffix;
        var items = [];
        var total = +end - +start;
        var chunk = total / (sockets.length + 1);
        sockets.forEach((el, i) => {
            io.to(el).emit('work', { 
                main: socketId, 
                start: start + Math.floor(chunk * i), 
                end: start + Math.floor(chunk * (i+1)),
                url: url,
                minDelay: minDelay,
                maxDelay: maxDelay,
                suffix: suffix,
                threads: sockets.length + 1
            });
        });
        var current = { start: start + Math.floor(chunk * sockets.length), end: start + Math.floor(chunk * (sockets.length+1)) };
        var i = current.start;
        const ids = [];
        while (i < current.end) {
            ids.push(i++);
        }
        var index = 0;
        var delay = 0;
        function getJson(id) {
            delay += Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            return new Promise(resolve => setTimeout(() => {
                resolve(
                    fetch(`${url}/${id}${suffix}`, { mode: 'no-cors' })
                        .then(res => res.json())
                        .then((json) => {
                            index++;
                            console.log('Processing:', id);
                            json['id'] = id;
                            items.push(json);
                            io.to(socketId).emit('progress', sockets.length + 1);
                        }))}, delay));
        }
        const promises = ids.map(id => getJson(id));
        console.log(promises.length, 'promises...');
        //var response = "";
        Promise.allSettled(promises)
            .then(r => {
                console.log("allSettled:", r.length);
                for (var settle of r) {
                    if (settle.status == 'rejected')
                        console.log(settle.reason);
                }
                console.log(`Server thread completed.`);
                io.to(socketId).emit('results', { items: items });
            });
    });
});

app.get('/get', function(req, res) {
    const file = req.query.file;
    const path = `${__dirname}/${file}`;
    res.download(path, 'items.csv', function() {
        fs.unlinkSync(path);
    }); // Set disposition and send it.
})