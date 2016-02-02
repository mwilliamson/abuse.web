var connect = require("connect"),
    http = require('http'),
    dispatch = require("./dispatch"),
    inject = require("./inject"),
    content = require("./content"),
    requests = require("./requests"),
    injectable = inject.injectable,
    sessions = require('cookie-sessions')({secret: "1431f5ca5e81056a5196c2aacb0fb7237056f3b8"}),
    clientKey = require("./redis").client,
    client = require("redis-client").createClient(),
    http404Handler,
    aboutHandler;

http404Handler = injectable(
    [content],
    function(content) {
        content.http404();
    }
);

aboutHandler = injectable(
    [content],
    function(content) {
        content("about");
    }
);

var app = connect();

app.use(require("serve-static")(__dirname + "/../../static", {
    index: false
}));

app.use(function(request, response) {
    
    sessions(request, response, function() {
        var dispatcher = dispatch.dispatcher(),
            injector = inject.injector();
        injector.bind("request").toInstance(request);
        injector.bind("response").toInstance(response);
        injector.bind("postParameters").toProvider(requests.postParameters);
        injector.bind("query").toProvider(requests.query);
        injector.bind("userParameters").toProvider(requests.userParameters);
        injector.bind(clientKey).toInstance(client);
        
        dispatcher.add(/^\/$/, require("./controllers/front"));
        dispatcher.add(/^\/to-json\/$/, require("./controllers/to-json"));
        dispatcher.add(/^\/grammars\/$/, require("./controllers/grammar/index"));
        dispatcher.add(/^\/grammars\/([a-z0-9\-_]+)\/$/, "name", require("./controllers/grammar/show"));
        dispatcher.add(/^\/grammars\/([a-z0-9\-_]+)\/revision\/([0-9]+)\/$/,
            "name", "revision", require("./controllers/grammar/show"));
        dispatcher.add(/^\/grammars\/([a-z0-9\-_]+)\/revision\/([0-9]+)\/sentence\/([0-9\-]+)\/$/,
            "name", "revision", "sequence", require("./controllers/grammar/show"));
        dispatcher.add(/^\/grammars\/([a-z0-9\-_]+)\/source\/$/, "name", require("./controllers/grammar/source"));
        dispatcher.add(/^\/grammars\/([a-z0-9\-_]+)\/revision\/([0-9]+)\/source\/$/,
            "name", "revision", require("./controllers/grammar/source"));
        
        dispatcher.add(/^\/what-is-this-crap\/$/, aboutHandler);
        
        dispatcher.add(new RegExp(""), http404Handler);
        
        // FIXME: hack to make sure POST parameters work
        injector.get("postParameters");
        
        dispatcher.dispatch(request, response, injector);
    });
});

http.createServer(app).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
