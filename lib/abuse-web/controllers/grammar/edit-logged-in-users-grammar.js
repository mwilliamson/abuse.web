var content = require("../../content"),
    injectable = require("../../inject").injectable;

module.exports = injectable(
    module, "edit-logged-in-users-grammar",
    [content, "user"],
    function(content, user) {
        if (user) {
            content.redirect("/grammars/" + user.username + "/edit/");
        } else {
            content.redirect("/login/?next=/edit-my-grammar/");
        }
    }
);

