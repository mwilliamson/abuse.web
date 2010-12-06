var http = require('http'),
    dispatch = require("ZWOBBLE/abuse/web/dispatch"),
    htmlContent,
    defaultHandler,
    grammarHandler;

htmlContent = function(text, status) {
    return {
        type: "text/html",
        status: status || 200,
        body: text
    };
};

defaultHandler = function() {
    return htmlContent("Default handler\n");
};

grammarHandler = function(name) {
    return htmlContent(name);
};

http.createServer(function(request, response) {
    var dispatcher = dispatch.dispatcher();
    dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/$/, grammarHandler);
    // dispatcher.delegate(/^\/blogs\//, blogDispatcher); // Should chop off /blogs/?
    // dispatcher.delegate(/^\/([A-Za-z]+)\//, blogDispatcher); // Should pass group to sub-dispatcher
    dispatcher.add(new RegExp(""), defaultHandler);
    dispatcher.dispatch(request, response);
    
    //~ var parsedUrl = url.parse(request.url),
        //~ path = parsedUrl.pathname,
        //~ grammarsPathResult;
    //~ 
    //~ response.writeHead(200, {'Content-Type': 'text/html'});
    //~ 
    //~ grammarsPathResult = /^\/grammars\/([A-Za-z0-9\-]+)\/$/.exec(path);
    //~ if (grammarsPathResult === null) {
        //~ response.end(path + "\n");
    //~ } else {
        //~ response.end(grammarsPathResult[1]);
    //~ }
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
