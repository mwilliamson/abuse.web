var http = require('http'),
    dispatch = require("ZWOBBLE/abuse/web/dispatch"),
    inject = require("ZWOBBLE/abuse/web/inject"),
    htmlContent = require("ZWOBBLE/abuse/web/content").htmlContent,
    injectable = inject.injectable,
    defaultHandler,
    grammarHandler;

defaultHandler = injectable("htmlContent", function(htmlContent) {
    htmlContent("404", {}, 404);
});

grammarHandler = injectable("htmlContent", "pathParameters", function(htmlContent, pathParameters) {
    htmlContent("grammars/grammar", {name: pathParameters.name});
});

grammarIndexHandler = injectable("htmlContent", "pathParameters", function(htmlContent, pathParameters) {
    htmlContent("grammars/index", {grammars: []});
});

http.createServer(function(request, response) {
    var dispatcher = dispatch.dispatcher(),
        injector = inject.injector();
    injector.bind("htmlContent").toFunction(htmlContent);
    injector.bind("response").toInstance(response);
    dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/$/, "name", grammarHandler);
    dispatcher.add(/^\/grammars\/$/, grammarIndexHandler);
    // dispatcher.delegate(/^\/blogs\//, blogDispatcher); // Should chop off /blogs/?
    // dispatcher.delegate(/^\/([A-Za-z]+)\//, blogDispatcher); // Should pass group to sub-dispatcher
    dispatcher.add(new RegExp(""), defaultHandler);
    dispatcher.dispatch(request, response, injector);
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
