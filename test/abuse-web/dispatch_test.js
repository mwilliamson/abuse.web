var dispatch = require("abuse-web/dispatch"),
    inject = require("abuse-web/inject");

var simpleResponse = function() {
    return {
        writeHead: function(status, headers) {
            this.status = status;
            this.headers = headers;
        },
        end: function(body) {
            this.body = body;
        }
    };
};

exports.dispatcherUsesFirstMatchingHandlerToDispatchRequest  = function(test) {
    var response = {},
        request = {},
        dispatcher = dispatch.dispatcher(),
        usedHandlers = [],
        nonMatchingHandler = function() { usedHandlers.push("noMatch"); },
        firstMatchingHandler = function() { usedHandlers.push("firstMatch"); },
        secondMatchingHandler = function() { usedHandlers.push("secondMatch"); };
        
    dispatcher.add(new RegExp("^/$"), nonMatchingHandler);
    dispatcher.add(new RegExp("^/[a-z]*$"), firstMatchingHandler);
    dispatcher.add(new RegExp("^/.*$"), secondMatchingHandler);
    
    request.url = "/grammars";
    dispatcher.dispatch(request, response, inject.injector());
    
    test.equal(1, usedHandlers.length);
    test.equal("firstMatch", usedHandlers[0]);
    test.done();
};

exports.dispatcherUsesInjectorToCallFunctions  = function(test) {
    var response = simpleResponse(),
        request = {},
        dispatcher = dispatch.dispatcher(),
        injector = inject.injector(),
        user = {name: "Bob"},
        args,
        handler = inject.injectable("user", function(user) {
            args = arguments;
        });
    
    injector.bind("user").toInstance(user);
        
    dispatcher.add(new RegExp(""), handler);
    
    request.url = "/grammars";
    dispatcher.dispatch(request, response, injector);
    
    test.equal(user, args[0]);
    test.done();
};

exports.regexResultsAreBoundToPathParameters = function(test) {
    var response = simpleResponse(),
        request = {},
        dispatcher = dispatch.dispatcher(),
        injector = inject.injector(),
        args,
        handler = inject.injectable("pathParameters", function(pathParams) {
            args = arguments;
        });
        
    dispatcher.add(new RegExp("^/([a-z]*)$"), "name", handler);
    
    request.url = "/grammars";
    dispatcher.dispatch(request, response, injector);
    
    test.deepEqual({name: "grammars"}, args[0]);
    test.done();
};

exports.default404HandlerIsUsedIfNoHandlersMatch  = function(test) {
    var response = simpleResponse(),
        request = {url: "/"},
        dispatcher = dispatch.dispatcher();
        
    dispatcher.dispatch(request, response);
    
    test.equal("404", response.body);
    test.equal(404, response.status);
    test.equal("text/plain", response.headers["Content-Type"]);
    test.done();
};
