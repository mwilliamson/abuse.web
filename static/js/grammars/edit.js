$(document).ready(function() {
    var timer,
        undefined,
        setCursorPosition = function(elements, line, character) {
            elements.each(function(index, element) {
                // Need to calculate pos by reading out the textarea
                var range,
                    pos = 0,
                    lines = $(element).val().split("\n"),
                    i = 0;
                if (line >= lines.length) {
                    return;
                }
                while (i < line) {
                    pos += lines[i].length + 1;
                    i += 1;
                }
                //pos += character;
                if (element.setSelectionRange) {
                    element.setSelectionRange(pos, pos + lines[line].length);
                } else if (element.createTextRange) {
                    range = element.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos + lines[line].length);
                    range.select();
                }
                $(element).focus();
            });
        },
        createWarningLink = function(warning) {
            var linkElement = $(document.createElement("span")).css({
                    cursor: "pointer",
                    color: "#003399",
                    "text-decoration": "underline"
                }).html(warning.str).click(function() {
                    if (warning.lineNumber !== undefined) {
                        setCursorPosition($("#grammarBody"), warning.lineNumber - 1, 0);
                    }
                }),
                liElement = $(document.createElement("li")).html(linkElement);
            return liElement;
        };
        updateWarnings = function() {
            var body = $("#grammarBody").val(),
                grammar = ZWOBBLE.abuse.parse(body),
                warnings = grammar.errors,
                //allSentences = ZWOBBLE.abuse.generateAll(grammar.rules, 100),
                warningsListElement = $("#warningsList"),
                i;
            if (warnings.length > 0) {
                $("#warnings").show();
                warningsListElement.html("");
                for (i = 0; i < warnings.length; i += 1) {
                    warningsListElement.append(createWarningLink(warnings[i]));
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
