$(document).ready(function() {
    var timer,
        undefined,
        updateWarnings = function() {
            var body = $("#grammarBody").val(),
                grammar = ZWOBBLE.abuse.parse(body),
                warnings = $.map(grammar.errors, function(error) {
                    return error.str;
                }),
                //allSentences = ZWOBBLE.abuse.generateAll(grammar.rules, 100),
                warningsListElement = $("#warningsList"),
                i;
            if (warnings.length > 0) {
                $("#warnings").show();
                warningsListElement.html("");
                for (i = 0; i < warnings.length; i += 1) {
                    warningsListElement.append($(document.createElement("li")).html(warnings[i]))
                }
            } else {
                $("#warnings").hide();
            }
        };
    $("#grammarBody").keydown(function() {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        setTimeout(updateWarnings, 1000);
    });
    updateWarnings();
});
