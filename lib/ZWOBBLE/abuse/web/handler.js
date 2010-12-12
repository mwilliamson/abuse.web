var http = require('http'),
    dispatch = require("ZWOBBLE/abuse/web/dispatch"),
    inject = require("ZWOBBLE/abuse/web/inject"),
    htmlContent = require("ZWOBBLE/abuse/web/content").htmlContent,
    abuse = require("abuse"),
    injectable = inject.injectable,
    defaultHandler,
    grammarHandler,
    randomSelector;

defaultHandler = injectable("htmlContent", function(htmlContent) {
    htmlContent("404", {}, 404);
});

randomSelector = {
    select: function(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    }
};

grammarHandler = injectable("grammarRepository", "htmlContent", "pathParameters", function(grammars, htmlContent, pathParameters) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        if (grammar === null) {
            return defaultHandler(htmlContent);
        }
        htmlContent("grammars/grammar", {
            title: grammar.title,
            grammar: grammar.grammar,
            message: abuse.generate(abuse.parse(grammar.grammar), randomSelector)
        });
    });
});

grammarIndexHandler = injectable("grammarRepository", "htmlContent", "pathParameters", function(grammars, htmlContent, pathParameters) {
    grammars.fetchAllNamesAndTitles(function (err, grammars) {
        htmlContent("grammars/index", {grammars: grammars});
    });
});

http.createServer(function(request, response) {
    var dispatcher = dispatch.dispatcher(),
        injector = inject.injector();
    injector.bind("htmlContent").toFunction(htmlContent);
    injector.bind("response").toInstance(response);
    injector.bind("grammarRepository").toFunction(require("./grammarRepository").grammarRepository);
    dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/$/, "name", grammarHandler);
    dispatcher.add(/^\/grammars\/$/, grammarIndexHandler);
    // dispatcher.delegate(/^\/blogs\//, blogDispatcher); // Should chop off /blogs/?
    // dispatcher.delegate(/^\/([A-Za-z]+)\//, blogDispatcher); // Should pass group to sub-dispatcher
    dispatcher.add(new RegExp(""), defaultHandler);
    dispatcher.dispatch(request, response, injector);
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
