var dispatch = require("ZWOBBLE/abuse/web/dispatch");

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
    var response = simpleResponse(),
        request = {},
        dispatcher = dispatch.dispatcher(),
        nonMatchingHandler = function() { return {body: "noMatch"}; },
        firstMatchingHandler = function() { return {body: "firstMatch"}; },
        secondMatchingHandler = function() { return {body: "secondMatch"}; };
        
    dispatcher.add(new RegExp("^/$"), nonMatchingHandler);
    dispatcher.add(new RegExp("^/[a-z]*$"), firstMatchingHandler);
    dispatcher.add(new RegExp("^/.*$"), secondMatchingHandler);
    
    request.url = "/grammars";
    dispatcher.dispatch(request, response);
    
    test.equal("firstMatch", response.body);
    test.done();
};

exports.statusAndHeadersAreWrittenToResponse  = function(test) {
    var response = simpleResponse(),
        request = {},
        dispatcher = dispatch.dispatcher(),
        handler = function() { return {status: 200, "type": "text/plain"}; };
        
    dispatcher.add(new RegExp(""), handler);
    
    request.url = "/grammars";
    dispatcher.dispatch(request, response);
    
    test.equal(200, response.status);
    test.equal("text/plain", response.headers["Content-Type"]);
    test.done();
};

exports.regexResultsArePassedToFunction  = function(test) {
    var response = simpleResponse(),
        request = {},
        dispatcher = dispatch.dispatcher(),
        handler = function(first, second) { return {body: second + first}; };
        
    dispatcher.add(new RegExp("^/([a-z]*)([0-9]*)$"), handler);
    
    request.url = "/bob123";
    dispatcher.dispatch(request, response);
    
    test.equal("123bob", response.body);
    test.done();
};
