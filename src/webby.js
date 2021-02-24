// webby.js

const { Socket } = require('dgram');
const net = require('net');

const HTTP_STATUS_CODES = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error'
};

const MIME_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    html: 'text/html',
    css: 'text/css',
    txt: 'text/plain'
};

const c = {


    HTTP_STATUS_CODES: {
        200: 'OK',
        404: 'NOT FOUND',
        500: 'SERVER ERROR'
    },
    
    MIME_TYPES: {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        html: 'text/html',
        css: 'text/css',
        txt: 'text/plain'
    },


    getExtension: function(fileName) {

        if (fileName.includes('.')) {
            const splittedStrings = fileName.split('.');
            return splittedStrings[splittedStrings.length-1].toLowerCase();
        } else {
            return '';
        }

    }

    ,getMIMEType: function(fileName) {

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

    ,Request: class{
        constructor(s) {
            const [method, path, ...others] = s.split(' ');
            this.method = method;
            this.path = path;
        }
    }


    ,App: class{
        constructor() {
          this.routes = {}; 
          this.server = net.createServer(this.handleConnection.bind(this)) 
          this.middleware = null;
        
        }

        handleConnection(sock) { 
            console.log(sock.remoteAddress);
            sock.on('data', (data) => this.handleRequest(sock, data));
        }
        
        normalizePath(path) {
            
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

        createRouteKey(method, path) {

            return method.toUpperCase() + " " + this.normalizePath(path)

        }

        get(path, cb) {

            this.routes[this.createRouteKey('GET', path)] = cb;

        }

        use(cb) {

            this.middleware.call(cb.req, cb.res, cb.next);

        }

        listen(port, host) {
            this.server.listen(port, host);
        }

        handleRequest(sock, binaryData) {

            const req = new Request(binaryData + '');
            let res = new Response(sock);

            if (this.middleware !== null) {

                this.middleware.call(req, res, next)
                
            } else {

                this.processRoutes(req, res);
                
            }
        }


        processRoutes(req, res) {

            if (this.routes.hasOwnProperty(req.path)) {
                const routeHandler = this.routes[req.path];
                routeHandler(req, res);
            } else {
                res.status = 404;
                res.send('<em>Page not found.</em>');
            }
            sock.end();
        }
    }

    ,Response: class{
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

            if (this.statusCode == 200) {
                return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[200] + "\r\n"
            } else if (this.statusCode == 404) {
                return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[404] + "\r\n"
            } else if (this.statusCode == 500) {
                return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[500] + "\r\n"
            }

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
            this.sock.write(this.headers);

            this.sock.write("\r\n");
            this.sock.write(body);
        
        
        }

        status(statusCode){

            this.statusCode = statusCode;
            return this;

        }
    }

}

module.exports = c;