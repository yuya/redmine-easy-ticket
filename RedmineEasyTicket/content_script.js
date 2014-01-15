if (/redmine/.test(url) && /\/issues\/\d+$/.test(url)) {
    chrome.extension.sendRequest({}, function(response) {});

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
        origBeforeUnload = global.onbeforeunload,
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

    function visibleElement(element) {
        element.setAttribute("style", "");
    }

    function hiddenElement(element) {
        element.setAttribute("style","overflow: hidden; visibility: hidden; height: 0;");
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

        each(focusbleElements, function (element, i) {
            element.setAttribute("tabindex", ++i + "");
        });

        addPrefixNumber(elements.form.status.options);
        addPrefixNumber(elements.form.priority.options);
    }

    function showAndScroll() {
        visibleElement(elements.update);
        elements.form.status.focus();
        window.scrollTo(0, elements.update.offsetTop);
    }

    function initialize() {
        initElements();

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

                global.onbeforeunload = undefined;
                visibleElement(elements.loader);
                elements.form.instance.submit();
            }
        }, false);
    }

    initialize();
}
