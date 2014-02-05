var url = location.href;

if (/redmine/.test(url) && /\/issues\/.+\d$/.test(url)) {
    chrome.extension.sendRequest({}, function () {});

    var KEY_CODE = {
            ENTER : 13,
            SHIFT : 16,
            CTRL  : 17,
            SPACE : 32
        },
        toArray  = function (obj) {
            return [].slice.call(obj);
        },
        elements = {
            form   : null,
            loader : document.getElementById("ajax-indicator"),
            update : document.getElementById("update"),
            button : {
                edit   : toArray(document.getElementsByClassName("icon-edit")),
                commit : toArray(document.getElementsByName("commit")).pop()
            }
        },
        focusbleElements;

    function isNodeList(obj) {
        var type = {}.toString.call(obj);

        return type === "[object NodeList]" || type === "[object HTMLCollection]";
    }

    function each(collection, iterator) {
        var i = 0,
            len, ary, key;

        if (Array.isArray(collection)) {
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
        chrome.extension.sendMessage({}, function (response) {
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
        if (!element) {
            return;
        }

        element.setAttribute("style", "");
    }

    function hiddenElement(element) {
        if (!element) {
            return;
        }

        element.setAttribute("style", "overflow: hidden; visibility: hidden; height: 0;");
    }

    function showAndScroll() {
        visibleElement(elements.update);
        elements.form.status.focus();
        scrollTo(0, elements.update.offsetTop);
    }

    function addPrefixNumber(options, idx, max) {
        idx = idx || 0;
        max = max || 9;

        if (!options) {
            return;
        }

        var i     = 0,
            len   = options.length - idx,
            start = idx,
            option, value;

        for (; len; ++i, ++idx, --len) {
            option = options[idx];

            if (!option) {
                return;
            }

            value = option.firstChild.nodeValue;

            if (i < max) {
                option.innerHTML = (start === 0 ? idx + 1 : idx) + ": " + value;
            }
        }
    }

    function initElements() {
        var ratio100;

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
            elements.button.edit[0],
            elements.form.status,
            elements.form.priority,
            elements.form.assigned,
            elements.form.ratio,
            elements.form.notes,
            elements.button.commit
        ];

        if (elements.form.status) {
            each(focusbleElements, function (element, i) {
                if (element) {
                    element.setAttribute("tabindex", ++i + "");
                }
            });

            addPrefixNumber(elements.form.status.options);
        }

        if (elements.form.priority) {
            addPrefixNumber(elements.form.priority.options);
        }

        if (elements.form.ratio) {
            addPrefixNumber(elements.form.ratio.options, 1);

            ratio100           = toArray(elements.form.ratio.options).pop();
            ratio100.innerHTML = "!: " + ratio100.firstChild.nodeValue;
        }
    }

    function initialize() {
        initElements();

        if (!elements.form.status) {
            elements.update.setAttribute("style", "display: none;");
            return;
        }

        each(elements.button.edit, function (element) {
            element.addEventListener("keydown", function (event) {
                if (event.keyCode === KEY_CODE.SPACE) {
                    event.preventDefault();
                    event.stopPropagation();

                    showAndScroll();
                }
            }, false);

            element.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                showAndScroll();
                return false;
            }, false);
        });

        elements.form.notes.addEventListener("keypress", function (event) {
            if (event.keyCode === KEY_CODE.ENTER && event.ctrlKey) {
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
