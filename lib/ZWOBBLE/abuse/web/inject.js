var injectableKey = "ZWOBBLE.abuse.web.inject.injectable.tokenKey";

exports.injector = function() {
    var bindings = {},
        get = function(key) {
            return call(bindings[key]);
        },
        inject = function(func) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i;
            for (i = 0; i < tokens.length; i += 1) {
                funcArgs[i] = get(tokens[i]);
            }
            return func.apply(undefined, funcArgs);
        },
        call = function(func) {
            if (func[injectableKey] === undefined) {
                return func();
            }
            return inject(func);
        };
        
    return {
        bind: function(key) {
            return {
                toInstance: function(value) {
                    bindings[key] = function() { return value; };
                },
                toFunction: function(func) {
                    bindings[key] = func;
                },
            };
        },
        get: get,
        call: call
    };
};

exports.injectable = function() {
    var tokens = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        func = arguments[arguments.length - 1];
    func[injectableKey] = tokens;
    return func;
};
