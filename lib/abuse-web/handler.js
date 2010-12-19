var http = require('http'),
    dispatch = require("./dispatch"),
    inject = require("./inject"),
    htmlContent = require("./content").htmlContent,
    abuse = require("abuse"),
    injectable = inject.injectable,
    defaultHandler,
    http404Handler,
    grammarHandler,
    grammarIndexHandler,
    generateMessage;

generateMessage = function(grammar) {
    var randomSelector = {
        select: function(lower, upper) {
            return Math.floor(Math.random() * (upper - lower)) + lower;
        }
    };
    return abuse.generate(abuse.parse(grammar), randomSelector)
};

indexHandler = injectable("grammarRepository", "htmlContent", function(grammars, htmlContent) {
    grammars.fetchRandom(function(error, grammar) {
        htmlContent("index", {
            message: generateMessage(grammar.grammar),
            title: grammar.title
        });
    });
});

http404Handler = injectable("htmlContent", function(htmlContent) {
    htmlContent("404", {}, 404);
});

grammarHandler = injectable("grammarRepository", "htmlContent", "pathParameters", "http404",
                            function(grammars, htmlContent, pathParameters, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        htmlContent("grammars/grammar", {
            name: grammar.name,
            title: grammar.title,
            message: generateMessage(grammar.grammar)
        });
    }, http404);
});

grammarSourceHandler = injectable("grammarRepository", "htmlContent", "pathParameters", "http404",
                                  function(grammars, htmlContent, pathParameters, http404) {
    var name = pathParameters.name;
    grammars.fetchByName(name, function(error, grammar) {
        htmlContent("grammars/source", {
            name: grammar.name,
            title: grammar.title,
            grammar: grammar.grammar
        });
    }, http404);
});

grammarIndexHandler = injectable("grammarRepository", "htmlContent", "pathParameters", function(grammars, htmlContent, pathParameters) {
    grammars.fetchAllNamesAndTitles(function (err, grammars) {
        htmlContent("grammars/index", {grammars: grammars});
    });
});

http.createServer(function(request, response) {
    var dispatcher = dispatch.dispatcher(),
        injector = inject.injector();
    injector.bind("htmlContent").toProvider(htmlContent);
    injector.bind("response").toInstance(response);
    injector.bind("grammarRepository").toProvider(require("./grammarRepository").grammarRepository);
    injector.bind("http404").toFunction(http404Handler);
    
    dispatcher.add(/^\/$/, indexHandler);
    dispatcher.add(/^\/grammars\/$/, grammarIndexHandler);
    dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/$/, "name", grammarHandler);
    dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/source\/$/, "name", grammarSourceHandler);
    
    // dispatcher.delegate(/^\/blogs\//, blogDispatcher); // Should chop off /blogs/?
    // dispatcher.delegate(/^\/([A-Za-z]+)\//, blogDispatcher); // Should pass group to sub-dispatcher
    dispatcher.add(new RegExp(""), http404Handler);
    dispatcher.dispatch(request, response, injector);
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
