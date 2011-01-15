var content = require("abuse-web/content"),
    injectable = require("abuse-web/inject").injectable;

module.exports = injectable(content, "user", function(content, user) {
    if (user) {
        content.redirect("/grammars/" + user.username + "/edit/");
    } else {
        content.redirect("/login/?next=/edit-my-grammar/");
    }
});

