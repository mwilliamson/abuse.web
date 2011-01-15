var content = require("abuse-web/content"),
    injectable = require("abuse-web/inject").injectable;

module.exports = injectable(content, "userProvider", function(content, userProvider) {
    userProvider(function(user) {
        if (user) {
            content.redirect("/grammars/" + user.username + "/edit/");
        } else {
            content.redirect("/login/?next=/edit-my-grammar/");
        }
    });
});

