var handler = require("ZWOBBLE/abuse/web/handler").handle;

exports.handlerWritesHtmlContentType = function(test) {
    var response = {},
        request = {};
    handler(request, response);
    test.equal("text/html", response);
    test.done();
};
