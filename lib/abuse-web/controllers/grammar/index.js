var grammarRepository = require("../../grammarRepository"),
    injectable = require("../../inject").injectable,
    content = require("../../content");

module.exports = injectable(
    [grammarRepository, content, "pathParameters"],
    function(grammars, content, pathParameters) {
        grammars.fetchAllNamesAndTitles(function (grammars) {
            content("grammars/index", {grammars: grammars});
        });
    }
);
