var grammarRepository = require("../grammarRepository"),
    injectable = require("../inject").injectable,
    content = require("../content"),
    grammars = require("../grammars");

module.exports = injectable(
    [content],
    function(content) {
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
    }
);
