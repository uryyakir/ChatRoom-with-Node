const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
let http = require('http').createServer(app);
const io = require('socket.io').listen(http);


class ExpressSetup {
    constructor(variablesObj) {
        ExpressSetup.runSetup(variablesObj);
    }

    static runSetup(variablesObj) {
        app.use(express.static(__dirname + '/public'));
        app.set('views', __dirname + '/public/views');
        ExpressSetup.setupEngines();
        ExpressSetup.setupURLs(variablesObj);
    }

    static setupEngines() {
        // setting cookie-parser as our cookie parser
        app.use(cookieParser());
        // setting ejs as our html rendering engine
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');
        // setting body-parser as our request-body engine
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
    }

    static setupURLs(variablesObj) {
        // logging page config
        app.get('/', (req, res) => Variables.loginGetHandler(req, res));
        app.post('/', (req, res) => Variables.loginPostHandler(req, res));

        // chat page config
        app.get('/chat', (req, res) => Variables.chatGetHandler(req, res));
        variablesObj.chatHandler();
    }
}


class Variables {
    constructor() {
        this.color_lst = ['#ff070a', '#1b25ff', '#24ff0f', '#ff7700', '#ff00d6'];
        this.Users = {};
    }

    static loginGetHandler(req, res) {
        res.render('login.html');
    }

    static loginPostHandler(req, res) {
        const username = req.body.username;
        res.cookie('client_id', username);  // setting cookie to the user's name
        let message =  {message: username, type: "user"};
        io.emit('user message', message);
        res.redirect('/chat') // redirecting to chat-page
    }

    static chatGetHandler(req, res) {
        res.render('index.html');
    }

    chatHandler() {
        io.on('connection', (socket) => {
            socket.on('chat message', (msg) => {
                let username = msg["username"].split("=")[1];
                if (username in this.Users) {
                    this.Users[username]["message"]["message"] = msg["text"];
                }
                else {
                    this.Users[username] = {message: {color: this.color_lst[Object.keys(this.Users).length % this.color_lst.length], message: msg["text"], sender: username}, type: "message"};
                }
                io.emit('user message', this.Users[username])
            })
        });
    }
}

module.exports = {
    http: http,
    Variables: Variables,
    ExpressSetup: ExpressSetup
};
