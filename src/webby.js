// webby.js

const { Socket } = require('dgram');
const net = require('net');

const HTTP_STATUS_CODES = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error',
    308: 'Permanent Redirect'
}

const MIME_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    html: 'text/html',
    css: 'text/css',
    txt: 'text/plain'
}

function getMIMEType(fileName) {

    if (fileName.includes('.')) {
        const splittedStrings = fileName.split('.');
        if (splittedStrings[splittedStrings.length-1] == 'jpg'){

            return MIME_TYPES.jpg;

        } else if (splittedStrings[splittedStrings.length-1] == 'jpeg') {

            return MIME_TYPES.jpeg;

        } else if (splittedStrings[splittedStrings.length-1] == 'png') {

            return MIME_TYPES.png;

        } else if (splittedStrings[splittedStrings.length-1] == 'html') {

            return MIME_TYPES.html;

        } else if (splittedStrings[splittedStrings.length-1] == 'css') {

            return MIME_TYPES.css;
        
        } else if (splittedStrings[splittedStrings.length-1] == 'txt') {

            return MIME_TYPES.txt;
        }
    } else {
        return '';
    }
}

function getExtension(fileName) {

    if (fileName.includes('.')) {
        const splittedStrings = fileName.split('.');
        return splittedStrings[splittedStrings.length-1].toLowerCase();
    } else {
        return '';
    }

}

class Request {
    constructor(s) {
        const [method, path, ...others] = s.split(' ');
        this.method = method;
        this.path = path;
    }
}

class App {
    constructor() {
      this.routes = {}; 
      this.server = net.createServer(this.handleConnection.bind(this)) 
      this.middleware = null;
    
    }

    handleConnection = (sock) => { 
        sock.on('data', (data) => this.handleRequest(sock, data));
    }
    
    normalizePath = (path) => {
        
        let tempResult;
        let result = '';
        let count = 0;

        for (let i = 0; i < path.length; i++) {
            if (path.charAt(i) == '/') {
                tempResult = result;
                if (i == path.length-1) {
                    break;
                } else {
                    result += path.charAt(i);
                    count++;
                }
            } else if (path.charCodeAt(i) >= 65 && path.charCodeAt(i) <= 90) {
                result += path.charAt(i);
            } else if (path.charCodeAt(i) >= 97 && path.charCodeAt(i) <= 122)
                result += path.charAt(i);
            else {
                break;
            }                
        }
        if (count > 1) {
            return tempResult;
        } else {
            return result.toLowerCase();
        }
    }

    createRouteKey = (method, path) => {

        return method.toUpperCase() + " " + this.normalizePath(path)

    }

    get = (path, cb) => {

        this.routes[this.createRouteKey('GET', path)] = cb;

    }

    use = (cb) => {
        
        this.middleware = cb;

    }

    listen = (port, host) => {
        this.server.listen(port, host);
    }

    handleRequest = (sock, binaryData) => {

        let req = new Request(binaryData + '');
        let res = new Response(sock);

        if (this.middleware !== null) {
            this.middleware(req, res, this.processRoutes);
        } else {
            this.processRoutes(req, res);
        }
    }

    processRoutes = (req, res) => {
        
        const normalizedPath = this.normalizePath(req.path);
        const routeKey = this.createRouteKey(req.method, normalizedPath);

        if (this.routes.hasOwnProperty(routeKey)) {
            const functionToCall = this.routes[routeKey];
            functionToCall(req, res);
        } else {
            res.status = 404;
            res.send('<em>Page not found.</em>');
        }
    }
}

class Response {
    constructor(sock, statusCode = 200, version = 'HTTP/1.1') {
        this.statusCode = statusCode;
        this.version = version;
        this.sock = sock;
        this.headers = {};
        this.body = {};
    }

    set(name, value) {
        this.headers[name] = value;
    }
    
    end(){
        
        this.sock.end();

    }

    statusLineToString() {

        return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[this.statusCode] + "\r\n"

    }

    headersToString() {

        let result = '';
        
        for (const [key, value] of Object.entries(this.headers)) {
            result += `${key}: ${value}\r\n`;
        }

        return result;

    }

    send(body) {

        if (this.headers == null) {
            this.headers['Content-Type'] = 'text/html'
        }
        this.sock.write(this.statusLineToString());
        this.sock.write(this.headersToString());

        this.sock.write("\r\n");
        this.sock.write(body);

        this.sock.end();
    
    }

    status(statusCode){

        this.statusCode = statusCode;
        return this;

    }

}


function serveStatic(basePath) {

    return function (req, res, next) {
        
        const path = require('path');
        const fs = require('fs');
        const fullPath = path.join(basePath, req.path);
        function handleRead(err, data) {
            if (err) {
                next(req, res);
            } else {
                res.status(200);
                res.set('Content-Type', getMIMEType(fullPath));
                res.send(data)
            }
        }
        fs.readFile(fullPath, handleRead); 
    }
}

module.exports = {
    HTTP_STATUS_CODES,
    MIME_TYPES,
    Response,
    Request,
    App,
    getExtension,
    getMIMEType,
    static: serveStatic
};