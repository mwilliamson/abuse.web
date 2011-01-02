var http = require('http'),
    dispatch = require("./dispatch"),
    inject = require("./inject"),
    content = require("./content"),
    grammarHandlers = require("./grammarHandlers"),
    accountHandlers = require("./accountHandlers"),
    requests = require("./requests"),
    userProvider = require("./userProvider"),
    injectable = inject.injectable,
    sessions = require('cookie-sessions')({secret: "1431f5ca5e81056a5196c2aacb0fb7237056f3b8"}),
    clientKey = require("./redis").client,
    client = require("redis-client").createClient(),
    http404Handler,
    aboutHandler;

http404Handler = injectable(content.content, function(content) {
    content("404", {}, 404);
});

aboutHandler = injectable(content.content, function(content) {
    content("about");
});

http.createServer(function(request, response) {
    
    sessions(request, response, function() {
        var dispatcher = dispatch.dispatcher(),
            injector = inject.injector();
        injector.bind("request").toInstance(request);
        injector.bind("response").toInstance(response);
        injector.bind("http404").toFunction(http404Handler);
        injector.bind("postParameters").toProvider(requests.postParameters);
        injector.bind("query").toProvider(requests.query);
        injector.bind("userParameters").toProvider(requests.userParameters);
        injector.bind("userProvider").toFunction(userProvider);
        injector.bind(clientKey).toInstance(client);
        
        dispatcher.add(/^\/$/, grammarHandlers.front);
        dispatcher.add(/^\/grammars\/$/, grammarHandlers.index);
        dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/$/, "name", grammarHandlers.show);
        dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/revision\/([0-9]+)\/$/,
            "name", "revision", grammarHandlers.show);
        dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/source\/$/, "name", grammarHandlers.source);
        dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/revision\/([0-9]+)\/source\/$/,
            "name", "revision", grammarHandlers.source);
        dispatcher.add(/^\/grammars\/([A-Za-z0-9\-]+)\/edit\/$/, "name", grammarHandlers.edit);
        dispatcher.add(/^\/edit-my-grammar\//, grammarHandlers.editLoggedInUsersGrammar);
        
        dispatcher.add(/^\/register\/$/, accountHandlers.register);
        dispatcher.add(/^\/login\/$/, accountHandlers.login);
        dispatcher.add(/^\/logout\/$/, accountHandlers.logout);
        
        dispatcher.add(/^\/what-is-this-crap\/$/, aboutHandler);
        
        // dispatcher.delegate(/^\/blogs\//, blogDispatcher); // Should chop off /blogs/?
        // dispatcher.delegate(/^\/([A-Za-z]+)\//, blogDispatcher); // Should pass group to sub-dispatcher
        dispatcher.add(new RegExp(""), http404Handler);
        
        dispatcher.dispatch(request, response, injector);
    });
}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
