var url = require('url');

exports.dispatcher = function() {
    var handlers = [];
        
    return {
        add: function(regex) {
            var handler = arguments[arguments.length - 1];
                pathParamNames = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
            handlers.push({
                regex: regex,
                pathParamNames: pathParamNames,
                handler: handler
            });
        },
        dispatch: function(request, response, injector) {
            var path = url.parse(request.url).pathname,
                handlerIndex,
                i,
                handler,
                regexResult,
                pathParams = {};
            for (handlerIndex = 0; handlerIndex < handlers.length; handlerIndex += 1) {
                handler = handlers[handlerIndex];
                regexResult = handler.regex.exec(path);
                if (regexResult !== null) {
                    for (i = 0; i < handler.pathParamNames.length; i += 1) {
                        pathParams[handler.pathParamNames[i]] = regexResult[i + 1];
                    }
                    injector.bind("pathParameters").toInstance(pathParams);
                    injector.get(handler.handler);
                    return;
                }
            }
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.end("404");
        }
    };
};
