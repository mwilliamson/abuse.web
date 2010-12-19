var injectable = require("./inject").injectable;

exports.register = injectable("htmlContent", function(content) {
    content("account/register", {
        username: "",
        realname: "",
        email: "",
        usernameMaxLength: "50",
        realnameMaxLength: "50"
    });
});
