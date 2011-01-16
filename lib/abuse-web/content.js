var injectable = require("./inject").injectable,
    dust = require("dust"),
    fs = require('fs'),
    sys = require("sys");

module.exports = injectable("response", "user", function(response, user, done) {
    var content = function(templateName, json, status) {
        json = json || {};
        // TODO: implement readfiles that reads multiple files with utf8 charset
        fs.readFile("templates/html/" + templateName + ".html", "utf-8", function(error, templateText) {
            fs.readFile("templates/html/base.html", "utf-8", function(error, baseTemplateText) {
                var baseContext = dust.makeBase({
                    navigation: function(chunk, context, bodies) {
                        chunk.write('<ul class="links">');
                        chunk.render(bodies.block, context.push({
                            a: function(chunk, context, bodies, params) {
                                chunk.write('<li><a href="');
                                if (typeof params.url === "function") {
                                    chunk.render(params.url, context);
                                } else {
                                    chunk.write(params.url);
                                }
                                chunk.write('"><span class="linkArrow">&gt;</span>');
                                chunk.render(bodies.block, context);
                                chunk.write('</a></li>');
                            }
                        }));
                        chunk.write('</ul>');
                    }
                }),
                context = baseContext.push({
                    page: json,
                    user: user
                });
                // Disable whitespace optimisation since it removes new lines
                dust.optimizers.format = function(ctx, node) { return node };
                dust.compileFn(baseTemplateText, "base");
                response.writeHead(status || 200, {"Content-Type": "text/html"});
                dust.compileFn(templateText)(context, function(error, output) {
                    response.end(output);
                });
            });
        });
    };
    content.http404 = function() {
        content("404", {}, 404);
    };
    content.http403 = function() {
        content("403", {}, 403);
    };
    content.redirect = function(target) {
        response.writeHead(302, {"Location": target});
        response.end();
    };
    done(content);
});
