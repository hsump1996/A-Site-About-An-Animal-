// webby.js

const net = require('net');

const HTTP_STATUS_CODES = {
    200: 'OK',
    404: 'NOT FOUND',
    500: 'SERVER ERROR'
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
          this.server = net.createServer(this.handleConnect.bind(this)) 
        
        }
    }
}

module.exports = c;