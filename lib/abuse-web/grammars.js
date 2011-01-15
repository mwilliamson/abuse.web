var abuse = require("abuse"),
    maxDepth = 100

exports.generateMessage = function(grammar, selector) {
    return abuse.generate(abuse.parse(grammar).rules, selector, maxDepth);
};

exports.generateRandomMessage = function(grammar) {
    return exports.generateMessage(grammar, abuse.randomSelector);
};

exports.validate = function(body) {
    var parsedGrammar = abuse.parse(body),
        sentences = abuse.generateAll(parsedGrammar.rules, maxDepth);
    return {
        isValid: sentences.length > 0,
        warnings: parsedGrammar.errors.map(function(error) {
            return error.str;
        })
    };
};

exports.grammarUrl = function(grammar, includeRevision) {
    var url = "/grammars/" + grammar.name + "/";
    if (includeRevision) {
        url += "revision/" + grammar.revision + "/";
    }
    return url;
};

exports.sentenceUrl = function(grammar, sequence) {
    return exports.grammarUrl(grammar, true) + "sentence/" + sequence.join("-") + "/";
};
