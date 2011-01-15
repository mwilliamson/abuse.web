var grammarRepository = require("abuse-web/grammarRepository"),
    injectable = require("abuse-web/inject").injectable,
    content = require("abuse-web/content"),
    grammars = require("abuse-web/grammars");

module.exports = injectable(grammarRepository, content, function(grammarRepository, content) {
    grammarRepository.fetchRandom(function(grammar) {
        var message = grammars.generateRandomMessage(grammar.grammar);
        content("index", {
            message: message.str,
            sentenceUrl: grammars.sentenceUrl(grammar, message.sequence),
            title: grammar.title
        });
    }, function() {
        content("index");
    });
});
