exports.userList = "users";

exports.forUser = function(username) {
    var key = function(subKey) {
        return "users:" + username + ":" + subKey;
    };
    return {
        realName: key("realname"),
        email: key("email"),
        salt: key("salt"),
        password: key("password"),
        authToken: key("authToken")
    };
};

exports.grammarList = "grammars";

exports.forGrammar = function(name) {
    var key = function(subKey) {
        return "grammars:" + name + ":" + subKey;
    };
    return {
        revision: key("revision"),
        forRevision: function(revision) {
            return {
                body: key(revision + ":body")
            };
        },
        title: exports.forUser(name).realName
    };
};
