$(document).ready(function() {
    var timer,
        undefined,
        calculateLineHeight = function() {
            var firstTextArea = 
            $(body).appe
        },
        scrollToLine = function(element, line, pos, text) {
            var dummyTextArea = $(element).clone(),
                initialTextAreaLines = 1000,
                initialScrollHeight,
                targetScrollHeight,
                lineHeight;
            $(element).after(dummyTextArea);
            dummyTextArea.val((new Array(initialTextAreaLines)).join("\n"));
            initialScrollHeight = dummyTextArea.get(0).scrollHeight;
            lineHeight = initialScrollHeight / initialTextAreaLines;
            dummyTextArea.val(dummyTextArea.val() + text.slice(0, pos));
            targetScrollHeight = dummyTextArea.get(0).scrollHeight - initialScrollHeight;
            dummyTextArea.remove();
            
            if (targetScrollHeight <  element.scrollTop ||
                    targetScrollHeight + lineHeight > element.scrollTop + element.clientHeight) {
                element.scrollTop = targetScrollHeight;
            }
        },
        setCursorPosition = function(elements, line, character) {
            elements.each(function(index, element) {
                var range,
                    pos = 0,
                    text = $(element).val(),
                    lines = text.split("\n"),
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
                    range.moveStart('character', pos);
                    range.moveEnd('character', lines[line].length);
                    range.select();
                }
                scrollToLine(element, line, pos, text);
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
