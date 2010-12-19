var injectableKey = "ZWOBBLE.abuse-web.inject.injectable.tokenKey";

exports.injector = function() {
    var bindings = {},
        get = function(key) {
            if (key in bindings) {
                return inject(bindings[key]);
            }
            if (typeof key === "function") {
                return inject(key);
            }            
            require("sys").print(key);
            throw "Key not in bindings: " + key;
        },
        injectInjectable = function(func) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i;
            for (i = 0; i < tokens.length; i += 1) {
                funcArgs[i] = get(tokens[i]);
            }
            return func.apply(undefined, funcArgs);
        },
        inject = function(func) {
            if (func[injectableKey] === undefined) {
                return func();
            }
            return injectInjectable(func);
        },
        bind = function(key) {
            return {
                toInstance: function(value) {
                    bindings[key] = function() { return value; };
                },
                toProvider: function(func) {
                    bindings[key] = func;
                },
                toFunction: function(func) {
                    bindings[key] = exports.injectable("injector", function(injector) {
                        return function() {
                            return injector.get(func);
                        };
                    });
                }
            };
        },
        injector = {
            bind: bind,
            get: get,
            inject: inject
        };
    
    injector.bind("injector").toInstance(injector);
    
    return injector;
};

exports.injectable = function() {
    var tokens = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        func = arguments[arguments.length - 1];
    func[injectableKey] = tokens;
    return func;
};
