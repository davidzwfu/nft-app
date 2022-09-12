const fetch = require('node-fetch');
const io = require("socket.io-client");
var socket;

if (process.env.NODE_ENV == 'production')
    socket = io('https://nft-nodejs.herokuapp.com' + '?data=listen');
else
    socket = io('http://localhost:5000' + '?data=listen');

socket.on('work', (args) => {
    console.log(args);
    get(args);
});

function get(args) {
    const url = args.url;
    const start = +args.start;
    const end = +args.end;
    const minDelay = +args.minDelay;
    const maxDelay = +args.maxDelay;
    const suffix = args.suffix;
    var i = start;
    var items = [];
    const ids = [];
    while (i < end) {
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
                        console.log('Worker processing:', id);
                        json['id'] = id;
                        items.push(json);
                        socket.emit('progress', args.main);
                    }))}, delay));
    }
    const promises = ids.map(id => getJson(id));
    console.log(promises.length, 'promises...');
    Promise.allSettled(promises)
        .then(r => {
            console.log("allSettled:", r.length);
            for (var settle of r) {
                if (settle.status == 'rejected')
                    console.log(settle.reason);
            }
            console.log(`Worker succesfully parsed ${index} items.`);
            socket.emit('results', { main: args.main, items: items });
        });
};