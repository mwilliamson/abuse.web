var url = require('url');

exports.dispatcher = function() {
    var handlers = [],
        runHandler;
        
    runHandler = function(handler, regexResult, response) {
        var params = regexResult.slice(1),
            content = handler.apply(undefined, params);
        
        response.writeHead(content.status, {'Content-Type': content.type});
        response.end(content.body);
    };
        
    return {
        add: function(regex, handler) {
            handlers.push({regex: regex, handler: handler});
        },
        dispatch: function(request, response) {
            var path = url.parse(request.url).pathname,
                i,
                handler,
                regexResult;
            for (i = 0; i < handlers.length; i += 1) {
                handler = handlers[i];
                regexResult = handler.regex.exec(path);
                if (regexResult !== null) {
                    runHandler(handler.handler, regexResult, response);
                    return;
                }
            }
            // FIXME: should return 404
        }
    };
};
