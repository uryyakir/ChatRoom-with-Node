const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();


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
        app.post('/', (req, res) => variablesObj.loginPostHandler(req, res));

        // chat page config
        app.get('/chat', (req, res) => Variables.chatGetHandler(req, res));
        app.post('/chat', (req, res) => variablesObj.chatPostHandler(req, res));

        // chatData API config
        app.get('/chatData', (req, res) => variablesObj.chatDataGetHandler(req, res));
    }
}


class Variables {
    constructor() {
        this.color_lst = ['#ff070a', '#1b25ff', '#24ff0f', '#ff7700', '#ff00d6'];
        this.lastMessage = {};
        this.newUser = undefined;
        this.Users = {};
    }

    static loginGetHandler(req, res) {
        res.render('login.html');
    }

    loginPostHandler(req, res) {
        const username = req.body.username;
        res.cookie('client_id', username);  // setting cookie to the user's name
        this.Users[username] = {knowsMessage: true, knowsUser: false, color: this.color_lst[Object.keys(this.Users).length % this.color_lst.length]}; // appending user to Users object
        for (let key in this.Users) {
            this.Users[key]["knowsUser"] = false;
        }
        this.newUser = username;
        res.redirect('/chat') // redirecting to chat-page
    }

    static chatGetHandler(req, res) {
        res.render('index.html');
    }

    chatPostHandler(req, res) {
        const username = req.cookies['client_id'];
        this.lastMessage = {message: req.body.messageText, sender: username, color: this.Users[username]['color']};
        for (let key in this.Users) {
            this.Users[key]["knowsMessage"] = false;
        }
        res.json({status_code: 200});
    }

    chatDataGetHandler(req, res) {
        const username = req.cookies['client_id'];
        if (this.newUser && !this.Users[username]["knowsUser"]) {
            this.Users[username]["knowsUser"] = true;
            res.json({updated: false, type: "user", message: this.newUser});
        }

        else if (this.Users[username]["knowsMessage"]) {
            res.json({updated: true});
        }

        else { // if current client didn't receive last message, we will get here
            this.Users[username]["knowsMessage"] = true;
            res.json({updated: false, type: "message", message: this.lastMessage});
        }
    }
}

module.exports = {
    app: app,
    Variables: Variables,
    ExpressSetup: ExpressSetup
};
