var grammars = require("../../grammarRepository"),
    injectable = require("../../inject").injectable,
    content = require("../../content");

module.exports = injectable(
    [content, "pathParameters"],
    function(content, pathParameters) {
        grammars.fetchAllNamesAndTitles(function (grammars) {
            content("grammars/index", {grammars: grammars});
        });
    }
);
