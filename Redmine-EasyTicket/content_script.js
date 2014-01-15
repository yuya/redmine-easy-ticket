var url = location.href;

if (/redmine/.test(url) && /\/issues\/\d+$/.test(url)) {
    chrome.extension.sendRequest({}, function () {});

    var KEY_CODE = {
            ENTER : 13,
            SHIFT : 16,
            SPACE : 32
        },
        AryProto = Array.prototype,
        ObjProto = Object.prototype,
        elements = {
            form   : null,
            loader : document.getElementById("ajax-indicator"),
            update : document.getElementById("update"),
            button : {
                edit   : document.getElementsByClassName("icon-edit")[0],
                commit : AryProto.slice.call(document.getElementsByName("commit")).pop()
            }
        },
        focusbleElements;

    function isNodeList(obj) {
        var type = ObjProto.toString.call(obj);

        return type === "[object NodeList]" || type === "[object HTMLCollection]";
    }

    function each(collection, iterator) {
        var i = 0,
            len, ary, key;

        if (Array.isArray(collection) || isNodeList(collection)) {
            len = collection.length;

            for (; len; ++i, --len) {
                iterator(collection[i], i);
            }
        }
        else {
            ary = Object.keys(collection);
            len = ary.length;

            for (; len; ++i, --len) {
                key = ary[i];
                iterator(key, collection[key]);
            }
        }
    }

    function disableConfirm() {
        chrome.extension.sendMessage({}, function(response) {
            var readyStateCheckInterval = setInterval(function () {
                var script;

                if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);

                    script           = document.createElement("script");
                    script.type      = "text/javascript";
                    script.innerHTML = "onbeforeunload = function () {};";

                    document.body.appendChild(script);
                }
            }, 10);
        });
    }

    function visibleElement(element) {
        element.setAttribute("style", "");
    }

    function hiddenElement(element) {
        element.setAttribute("style","overflow: hidden; visibility: hidden; height: 0;");
    }

    function showAndScroll() {
        visibleElement(elements.update);
        elements.form.status.focus();
        scrollTo(0, elements.update.offsetTop);
    }

    function addPrefixNumber(options) {
        var i = 0, len = options.length,
            option, number;

        for (; len; ++i, --len) {
            option = options[i];
            number = option.firstChild.nodeValue;

            if (i < 9) {
                option.innerHTML = (i + 1) + ": " + number;
            }
        }
    }

    function initElements() {
        hiddenElement(elements.update);

        elements.form = {
            status   : document.getElementById("issue_status_id"),
            priority : document.getElementById("issue_priority_id"),
            assigned : document.getElementById("issue_assigned_to_id"),
            ratio    : document.getElementById("issue_done_ratio"),
            notes    : document.getElementById("notes"),
            instance : document.getElementById("issue-form")
        };
        focusbleElements = [
            elements.button.edit,
            elements.form.status,
            elements.form.priority,
            elements.form.assigned,
            elements.form.ratio,
            elements.form.notes,
            elements.button.commit
        ];

        if (elements.form.status) {
            each(focusbleElements, function (element, i) {
                console.log(element);
                element.setAttribute("tabindex", ++i + "");
            });

            addPrefixNumber(elements.form.status.options);
            addPrefixNumber(elements.form.priority.options);
        }
    }

    function initialize() {
        initElements();

        if (!elements.form.status) {
            elements.update.setAttribute("style", "display: none;");
            return;
        }

        elements.button.edit.addEventListener("keydown", function (event) {
            if (event.keyCode === KEY_CODE.SPACE) {
                event.preventDefault();
                event.stopPropagation();

                showAndScroll();
            }
        }, false);

        elements.button.edit.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            showAndScroll();
            return false;
        }, false);

        elements.form.notes.addEventListener("keypress", function (event) {
            if (event.keyCode === KEY_CODE.ENTER && event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                disableConfirm();
                visibleElement(elements.loader);
                elements.form.instance.submit();
            }
        }, false);
    }

    initialize();
}
