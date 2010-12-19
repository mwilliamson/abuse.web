var injectableKey = "ZWOBBLE.abuse-web.inject.injectable.tokenKey";

// TODO: need to support async providers

exports.injector = function() {
    var bindings = {},
        get = function(key, done) {
            done = done || function(value) {
                return value;
            };
            if (key in bindings) {
                return inject(bindings[key], done);
            }
            if (typeof key === "function") {
                return inject(key, done);
            }            
            require("sys").print(key);
            throw "Key not in bindings: " + key;
        },
        injectInjectable = function(func, done) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i = 0,
                nextArg = function() {
                    if (i < tokens.length) {
                        return get(tokens[i], setNextArg);
                    } else {
                        return done(func.apply(undefined, funcArgs));
                    }
                },
                setNextArg = function(value) {
                    funcArgs[i] = value;
                    i += 1;
                    return nextArg();
                };
            return nextArg();
        },
        inject = function(func, done) {
            if (func[injectableKey] === undefined) {
                return done(func());
            }
            return injectInjectable(func, done);
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
            get: get
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
