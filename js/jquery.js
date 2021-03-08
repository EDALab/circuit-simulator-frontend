//Similar to jQuery library, all DOM operations in the project are here
//It's just that the API is similar, and the implementation details 
// are very different from the original version.

const w = window,
    u = undefined,
    obj = 'object',
    str = 'string',
    fun = 'function',
    num = 'number',
    doc = w.document,
    rnotwhite = /\S+/g,
    rkeyEvent = /^key/,
    rselect = /[^.# ]+/g,
    rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
    ran = 'event' + (1 + Math.random()).toFixed(10).toString().replace(/\D/g, '');

//Valid and invalid functions
function returnTrue() {
    return true;
}
function returnFalse() {
    return false;
}
//Check whether the type of element is acceptable
function acceptData(owner) {
    // Acceptable node types:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    return owner.nodeType === 1 || owner.nodeType === 9;
}
//Is it an array-like element
function isArrayLike(obj) {
    const length = !!obj && 'length' in obj && obj.length,
        type = typeof obj;

    if (type === 'function') {
        return false;
    }

    return type === 'array' || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}
//Is it a function
function isFunction(obj) {
    return (typeof obj === 'function');
}
//Element iteration
function each(obj, callback) {
    let length;

    if (isArrayLike(obj)) {
        length = obj.length;
        for (let i = 0; i < length; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    } else {
        for (const i in obj) if (obj.hasOwnProperty(i)) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    }
    return obj;
}
//Is it an empty object
function isEmptyObject(obj) {
    for (const name in obj) if (obj.hasOwnProperty(name)) {
        return false;
    }
    return true;
}
//Is it a webpage element
function isElement(elem) {
    return elem.setAttribute && elem.classList && elem.hasAttribute;
}
//Element matching
//The selector has no spaces, that is, there is no hierarchical relationship; 
// the corresponding element is selected in the elements according to the class, 
// id and tag of the selector
function mathchDom(elements, selector) {
    const ans = $();
    //Remove all spaces in the selector
    selector = selector.replace(/ /g, '');
    //No input selector, then return $(elements)
    if (!selector) {
        for (let i = 0; i < elements.length; i++) {
            ans.push(elements[i]);
        }
        return (ans);
    }
    const selectors = selector.split(',').map((n) => {
        const ans = {
            'tag': '',
            'id': '',
            'class': []
        },
            matchs = (n || '').match(rselect) || [''];

        for (let i = 0; i < matchs.length; i++) {
            const index = n.indexOf(matchs[i]);
            if (index) {
                //id、class
                if (n[index - 1] === '#') {
                    ans.id = matchs[i];
                } else if (n[index - 1] === '.') {
                    ans.class.push(matchs[i]);
                }
            } else {
                //tag
                ans.tag = matchs[i].toLowerCase();
            }
        }
        return (ans);
    });
    for (let i = 0; i < selectors.length; i++) {
        let elem = [];
        const idCheck = selectors[i].id,
            tagCheck = selectors[i].tag,
            classCheck = selectors[i].class;
        //id and tag check
        for (let j = 0; j < elements.length; j++) {
            if ((!idCheck && !tagCheck) ||
                (!idCheck && tagCheck && elements[j].tagName.toLowerCase() === tagCheck) ||
                (!tagCheck && idCheck && elements[j].getAttribute('id') === idCheck) ||
                (idCheck && tagCheck && elements[j].getAttribute('id') === idCheck && elements[j].tagName.toLowerCase() === tagCheck)) {
                elem.push(elements[j]);
            }
        }
        //class check
        if (classCheck.length) {
            //Check for each element whether it contains all classes
            elem = elem.filter((element) => {
                return classCheck.every((clas) => {
                    return $(element).hasClass(clas);
                });
            });
        }
        for (let j = 0; j < elem.length; j++) {
            ans.push(elem[j]);
        }
    }
    return ans;
}

//Event class for the task Commission
function $Event(src, props) {
    if (src && src.type) {
        // Input is an object
        this.originalEvent = src;
        this.type = src.type;

        // Events bubbling up the document may have been marked as prevented
        // by a handler lower down the tree; reflect the correct value.
        this.isDefaultPrevented = src.defaultPrevented ||
            src.defaultPrevented === u &&

            // Support: Android <=2.3 only
            src.returnValue === false ?
            returnTrue :
            returnFalse;

        // Create target properties
        // Support: Safari <= 6 - 7 only
        // Target should not be a text node (#504, #13143)
        this.target = (src.target && src.target.nodeType === 3) ?
            src.target.parentNode :
            src.target;

        this.currentTarget = src.currentTarget;
        this.relatedTarget = src.relatedTarget;
    } else {
        // Input is type string
        this.type = src;
    }

    //Special attribute assignment
    if (props) {
        this.extend(props);
    }
    // Create timeStamp
    this.timeStamp = src && src.timeStamp || Date.now();
}
$Event.prototype = {
    constructor: $Event,
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,
    isSimulated: false,

    preventDefault() {
        const e = this.originalEvent;
        this.isDefaultPrevented = returnTrue;
        if (e && !this.isSimulated) {
            e.preventDefault();
        }
    },
    stopPropagation() {
        const e = this.originalEvent;
        this.isPropagationStopped = returnTrue;
        if (e && !this.isSimulated) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation() {
        const e = this.originalEvent;
        this.isImmediatePropagationStopped = returnTrue;
        if (e && !this.isSimulated) {
            e.stopImmediatePropagation();
        }
        this.stopPropagation();
    }
};
//Event class extends from the mouseEvent class
each(
    {
        altKey: true,
        bubbles: true,
        cancelable: true,
        changedTouches: true,
        ctrlKey: true,
        detail: true,
        eventPhase: true,
        metaKey: true,
        pageX: true,
        pageY: true,
        shiftKey: true,
        view: true,
        char: true,
        charCode: true,
        key: true,
        keyCode: true,
        button: true,
        buttons: true,
        clientX: true,
        clientY: true,
        offsetX: true,
        offsetY: true,
        pointerId: true,
        pointerType: true,
        screenX: true,
        screenY: true,
        targetTouches: true,
        toElement: true,
        touches: true,
        deltaY: true,

        which(event) {
            const button = event.button;

            // Add which for key events
            if (event.which == null && rkeyEvent.test(event.type)) {
                return event.charCode != null ? event.charCode : event.keyCode;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if (!event.which && button !== undefined && rmouseEvent.test(event.type)) {
                return ((button & 1) ? 1 : ((button & 2) ? 3 : ((button & 4) ? 2 : 0)));
            }

            return event.which;
        }
    },
    function (name, hook) {
        Object.defineProperty($Event.prototype, name, {
            enumerable: true,
            configurable: true,

            get: isFunction(hook) ?
                function () {
                    if (this.originalEvent) {
                        return hook(this.originalEvent);
                    }
                } :
                function () {
                    if (this.originalEvent) {
                        return this.originalEvent[name];
                    }
                },

            set(value) {
                Object.defineProperty(this, name, {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value
                });
            }
        });
    }
);

//Data class for recording commissioned data
function Data() {
    this.expando = ran;
}
Data.prototype = {
    //Create data collection
    cache(owner) {
        //Fetch data
        let value = owner[this.expando];
        //If not, then create a new
        if (!value) {
            value = {};
            if (acceptData(owner)) {
                owner[this.expando] = value;
            }
        }
        return value;
    },
    get(owner, key) {
        return key === u ? this.cache(owner) :
            owner[this.expando] && owner[this.expando][key];
    },
    remove(owner, key) {
        const cache = owner[this.expando];

        //Invalid data, return directly
        if (cache === u) {
            return;
        }

        //Delete data according to key
        key = (key || '').match(rnotwhite) || [''];
        for (let i = 0; i < key.length; i++) {
            delete cache[key[i]];
        }

        //The data is empty, then delete the data in the page element
        if (key === u || isEmptyObject(cache)) {
            if (owner.nodeType) {
                owner[this.expando] = u;
            } else {
                delete owner[this.expando];
            }
        }
    },
    hasData(owner) {
        const cache = owner[this.expando];
        return (cache !== u && !isEmptyObject(cache));
    }
};

//Functions related to event delegation
const delegate = {
    //Global variables for storing events
    global: new Data(),
    //Add event
    add(elem, types, handler, data, selector) {
        let eventHandle, events, handleObj, handlers, type, bindType;
        const elemData = delegate.global.get(elem);

        //Invalid operation, exit
        if (!elemData) {
            return;
        }
        // First binding event of current Dom
        if (!(events = elemData.events)) {
            events = elemData.events = {};
        }
        if (!(eventHandle = elemData.handle)) {
            eventHandle = elemData.handle = function (e) {
                //Returns the distribution function
                return delegate.dispatch.apply(elem, arguments);
            };
        }
        // Split event name
        types = (types || '').match(rnotwhite) || [''];
        for (let i = 0; i < types.length; i++) {
            type = types[i];
            //Invalid name, skip
            if (!type) {
                continue;
            }
            //Special event binding
            bindType = (delegate.special[type] && delegate.special[type].bindType) || type;
            //Handle object
            handleObj = {
                type: bindType,
                origType: type,
                data,
                handler,
                selector,
                matches: $(selector, $(elem))
            };
            //This event is the first definition
            if (!(handlers = events[bindType])) {
                handlers = events[bindType] = [];
                //Binding monitoring event
                if (elem.addEventListener) {
                    elem.addEventListener(bindType, eventHandle);
                }
            }
            /*
             In terms of applicability, it is mainly the problem of selector
             The current strategy is that when the selector is the same as the existing one, 
             the latter will overwrite the former
             But there is actually another situation, that is, the selector string is different, 
             but the selected elements are the same.
             The original version of jq has its own selector module to prevent this from happening, 
             but now this module does not, so this problem can only be avoided when using it.
             */
            //If the selector has duplicates, then it will be overwritten. If there are no duplicates, it will be added to the end
            if (!(events[bindType].some((n, i, arr) => (selector === n.selector) && (arr[i] = handleObj)))) {
                handlers.push(handleObj);
            }
        }
    },
    //Distribute the callback function when the event is triggered
    dispatch(nativeEvent) {
        //Create a new event object
        const event = delegate.fix(nativeEvent),
            args = new Array(arguments.length),
            handlers = (delegate.global.get(this, 'events') || {})[nativeEvent.type] || [];

        //Parameter assignment of callback function
        args[0] = event;
        for (let i = 1; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        //Delegate element assignment
        event.delegateTarget = this;
        //Compute handle queue
        const handlerQueue = delegate.handlers.call(this, event, handlers);
        //Run the callback function in the order of the queue
        for (let i = 0; i < handlerQueue.length; i++) if (!event.isPropagationStopped()) {
            let ret;
            const handleObj = handlerQueue[i],
                fn = handleObj.handlers.handler;
            console.log("in dispatch method def of jquery.js");
            
            event.currentTarget = handleObj.elem;

            console.log("printing event.currentTarget");
            console.log(event.currentTarget);
            event.handleObj = handleObj;
            event.data = handleObj.handlers.data;
            event.type = handleObj.handlers.origType;

            if (delegate.special[event.type] && delegate.special[event.type].noBubble) {
                //Special Event
                //If the element that actually triggered the event is a child element of the current element,
                // then the callback is forbidden to run
                const related = event.relatedTarget;
                if (!related || (related !== handleObj.elem && !handleObj.elem.contains(related))) {
                    event.type = handleObj.origType;
                    ret = fn.apply(handleObj.elem, args);
                }
            } else {
                //Ordinary event, run callback directly
                ret = fn.apply(handleObj.elem, args);
            }

            event.type = handleObj.type;
            //If the callback completes and returns false, the event is prevented from continuing to bubble
            if (ret !== undefined) {
                if ((event.result = ret) === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }
        return event.result;
    },
    //Follow the trigger object up to the delegate object, and pack all triggered events into a queue
    handlers(event, handlers) {
        let i, cur = event.target;
        const handlerQueue = [],
            delegateCount = handlers.length;

        //There is a handle, the node type is correct, 
        // and the element currently triggering the event is not the element that delegates the event.
        // There is a handle, the node type is correct, and the element currently triggering the event 
        // is not the element that delegates the event
        if (delegateCount && event.target.nodeType && cur !== this) {
            //Up along the trigger node
            for (; cur !== this; cur = cur.parentNode || this) {
                //node is Node.ELEMENT_NODE
                if (cur.nodeType === 1) {
                    for (i = 0; i < delegateCount; i++) {
                        const handleObj = handlers[i],
                            sel = handleObj.selector;
                        let matches = handleObj.matches;

                        //The selector exists, then match
                        //During the bubbling process, an element can only be triggered once, 
                        // so after finding the right element, you can jump out of the loop directly
                        if (sel && sel.length) {
                            if (!matches.hasElem(cur)) {
                                matches = $(sel, $(this));
                                if (matches.hasElem(cur)) {
                                    handlerQueue.push({ elem: cur, handlers: handleObj });
                                    break;
                                }
                            } else {
                                handlerQueue.push({ elem: cur, handlers: handleObj });
                                break;
                            }
                        }
                    }
                }
            }
        }

        //Finally cur is equal to this itself
        for (i = 0; i < delegateCount; i++) {
            const handleObj = handlers[i];
            //Look for delegated events without selectors from the collection, 
            // because that event represents the ontology
            if (!handleObj.selector) {
                handlerQueue.push({ elem: cur, handlers: handleObj });
                break;
            }
        }

        return handlerQueue;
    },
    //Unified format
    fix(originalEvent) {
        if (originalEvent instanceof $Event) {
            return (originalEvent);
        } else if (originalEvent instanceof Event) {
            return (new $Event(originalEvent));
        } else {
            return (new $Event(originalEvent.type, originalEvent));
        }
    },
    //Remove event delegation
    remove(elem, types, handler, selector) {
        const elemData = delegate.global.hasData(elem) && delegate.global.get(elem),
            events = elemData.events;

        //No commissioned event data found, exit directly
        if (!elemData || !events) {
            return;
        }

        //Split event type
        types = (types || '').match(rnotwhite) || [''];
        //Empty type, indicating that the input is empty data, 
        // all events of the current element must be deleted
        //Add all event types to the list to be deleted
        if (!types[0]) {
            types.length = 0;
            for (const i in events) if (events.hasOwnProperty(i)) {
                types.push(i);
            }
        }
        //Delete events according to the list
        for (let i = 0; i < types.length; i++) {
            const type = types[i],
                handlers = events[type] || [],
                deletehandler = [];

            //If the selector is "arbitrary", or there is no input in the selector and callback function, 
            // it means removing all delegates of the current event
            if (selector === '**' || (selector === u && handler === u)) {
                deletehandler.push(type);
            } else {
                for (let j = 0; j < handlers.length; j++) {
                    const handlerObj = handlers[j];
                    if ((selector !== u && handler === u && selector === handlerObj.selector) ||
                        (selector === u && handler !== u && handler === handlerObj.handler) ||
                        (selector === handlerObj.selector && handler === handlerObj.handler)) {
                        handlers.splice(j, 1);
                        break;
                    }
                }
                //The delegate array is empty
                if (!handlers.length) {
                    deletehandler.push(type);
                }
            }
            //If the delegate of a certain event is empty, 
            // then the trigger event of the delegated element is removed and the data is deleted
            for (let j = 0; j < deletehandler.length; j++) {
                elem.removeEventListener(type, elemData.handle);
                delete events[type];
            }
        }
        // If the delegate event is empty, delete the entire record
        if (isEmptyObject(events)) {
            delegate.global.remove(elem, 'handle events');
        }
    },
    //trigger event
    trigger(elem, event, data) {
        // Text and comment nodes do not trigger events
        if (elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        }

        const type = event.type,
            ontype = type.indexOf(':') < 0 && 'on' + type,
            eventPath = [elem || document],
            special = delegate.special[type] || {},
            delegateType = special && special.delegateType || type;

        // Fix event format
        event = delegate.fix(event);
        event.result = u;
        event.type = delegateType;
        event.target = event.target || elem;

        // Events allow bubbling
        if (!special.noBubble) {
            let temp;
            for (let i = elem.parentNode; i; i = i.parentNode) {
                eventPath.push(i);
                temp = i;
            }
            if (temp === (elem.ownerDocument || document)) {
                eventPath.push(temp.defaultView || temp.parentWindow || window);
            }
        }

        //Events allow bubbling
        for (let i = 0; i < eventPath.length && !event.isPropagationStopped(); i++) {
            const cur = eventPath[i],
                handle = (delegate.global.get(cur, 'events') || {})[delegateType] &&
                    delegate.global.get(cur, 'handle'),
                onHandle = ontype && cur[ontype];

            // on bound event
            if (handle) {
                handle.apply(cur, [event], data);
            }

            // Primitive case
            if (onHandle && onHandle.apply && acceptData(cur)) {
                event.result = onHandle.apply(cur, [event], data);
                if (event.result === false) {
                    event.preventDefault();
                }
            }
        }
        return event.result;
    },
    //Special Event
    special: {
        mouseenter: {
            delegateType: 'mouseover',
            bindType: 'mouseover',
            noBubble: true
        },
        mouseleave: {
            delegateType: 'mouseout',
            bindType: 'mouseout',
            noBubble: true
        },
    }
};

//$Class definition
function $(selector, context, namespace) {
    return new $.fn.init(selector, context, namespace);
}
$.fn = $.prototype = {
    constructor: $,
    length: 0,
    push(elem) {
        this[this.length] = elem;
        this.length++;
    },
    pop() {
        const ans = this[this.length - 1];
        delete this[this.length - 1];
        this.length--;
        return ($(ans));
    },
    each(callback) {
        for (let i = 0; i < this.length; i++) {
            callback(this[i], i);
        }
    },
    map(callback) {
        const ans = [];
        for (let i = 0; i < this.length; i++) {
            ans.push(callback(this[i], i));
        }
        return (ans);
    },
    // Real constructor
    init(selector, context, namespace) {
        //If the input is already a jq element, then return the jq element directly
        if (selector instanceof $.fn.init) {
            return (selector);
        }

        //Create html element part
        if (typeof selector === str && selector[0] === '<' && selector[selector.length - 1] === '>') {
            //$('<html>')
            if (typeof context === str && namespace === u) {
                //$('<html>', namespace)
                namespace = context;
                context = {};
            } else if (typeof context === str && typeof namespace === obj) {
                //$('<html>', namespace, attr)
                const temp = namespace;
                namespace = context;
                context = temp;
            }
            selector = selector.substring(1, selector.length - 1);
            //There is no namespace, then create the label in the normal way
            if (!namespace) {
                this.push(doc.createElement(selector));
            } else {
                this.push(doc.createElementNS(namespace, selector));
            }
            this.attr(context);
            return this;
        }

        //Select html element part
        const root = context ? $(context) : root$;

        if (!selector) {
            //null or invalid inputs：$(''), $(null), $(undefined), $(false)
            return this;
        } else if (typeof selector === str) {
            //$(HTML strings)
            root.each((n) => {
                const all = n.querySelectorAll(selector);
                for (let i = 0; i < all.length; i++) {
                    this.push(all[i]);
                }
            });
        } else if (selector.nodeType || selector === w) {
            //$(DOMElement)
            this[0] = selector;
            this.length = 1;
            return (this);
        }
        //this.selector = selector;
        //this.preObject = root;
    },
    // Change the inline style, flag is whether to delete the original attribute, 
    // the default is not to delete
    css(name, value, flag = false) {
        if (!name) {
            return (this);
        }
        if (typeof name === obj) {
            //Set multiple values
            if (flag) {
                let str = '';
                for (const i in name) if (name.hasOwnProperty(i)) {
                    str += i + '=' + name[i] + ';';
                }
                this.each((n) => n.style = str);
            } else {
                for (const i in name) if (name.hasOwnProperty(i)) {
                    this.each((n) => n.style[i] = name[i]);
                }
            }
        } else if (typeof name === str && value !== u) {
            //Set a single value
            if (flag) {
                this.each((n) => n.style = name + '=' + String(value) + ';');
            } else {
                this.each((n) => n.style[name] = String(value));
            }
        } else if (typeof name === str && value === u) {
            //Get the inline style value of the subscript 0 element, if there is no such style, then output an empty string (''）
            return (this[0].style[name] || '');
        }
        return (this);
    },
    // Read or set the DOM attribute
    attr(name, value) {
        if (name instanceof Array) {
            //Get many attributes and return an array
            const ans = [];
            for (let i = 0; i < name.length; i++) {
                ans.push(this.attr(name[i]));
            }
            return (ans);
        } else if (typeof name === obj) {
            //Set multiple values
            for (const i in name) if (name.hasOwnProperty(i)) {
                this.each((n) => n.setAttribute(i, name[i]));
            }
        } else if (typeof name === str && value !== u) {
            //Set a single value
            this.each((n) => n.setAttribute(name, value.toString()));
        } else if (typeof name === str && value === u) {
            //Get a single attribute value
            return this[0].getAttribute(name);
        }
        return this;
    },
    prop(name, value) {
        if (typeof name === obj) {
            //Set multiple values
            for (const i in name) if (name.hasOwnProperty(i)) {
                this.each((n) => n[i] = name[i]);
            }
            return this;
        } else if (typeof name === str && value !== u) {
            //Set a single value
            this.each((n) => n[name] = value);
        } else if (typeof name === str && value === u) {
            //Get attribute value
            return this[0][name];
        }
        return this;
    },
    // delete attribute
    removeAttr(name) {
        if (typeof name === str) {
            this.each((n) => n.removeAttribute(name));
        }
    },
    // delete prop
    removeProp(name) {
        if (typeof name === str) {
            this.each((n) => delete n[name]);
        }
    },
    // add class
    addClass(name) {
        name = (name || '').match(rnotwhite) || [''];
        this.each((elem) => {
            for (let i = 0; i < name.length; i++) {
                elem.classList.add(name[i]);
            }
        });
    },
    // delete class
    removeClass(name) {
        name = (name || '').match(rnotwhite) || [''];
        this.each((elem) => {
            for (let i = 0; i < name.length; i++) {
                elem.classList.remove(name[i]);
            }
        });
    },
    // Does the first element contain a certain class
    hasClass(name) {
        return this[0].classList.contains(name);
    },
    // Does it contain an element
    hasElem(elem) {
        let ans = false;
        for (let i = 0; i < this.length; i++) {
            ans |= this[i] === elem;
            if (ans) return (ans);
        }
        return (false);
    },
    // Event delegation
    on(type, selector, data, fn) {
        let types = {};

        if (typeof type === 'object') {
            //Bind multiple events at once
            types = type;
        } else {
            //Only one event is bound at a time
            if (data == null && fn == null) {
                // ( types, fn )
                //Bind events to the current element itself
                types[type] = selector;
                data = selector = u;
            } else if (fn == null) {
                if (typeof selector === str) {
                    // ( types, selector, fn )
                    types[type] = data;
                    data = u;
                } else {
                    // ( types, data, fn )
                    types[type] = data;
                    data = selector;
                    selector = u;
                }
            }
        }
        return this.each((n) => {
            for (const i in types) {
                if (types.hasOwnProperty(i)) {
                    delegate.add(n, i, types[i], data, selector);
                }
            }
        });
    },
    // Event decommission
    off(type, selector, fn) {
        let types = {};

        if (typeof type === obj) {
            // ( types-object [, selector] )
            types = type;
        } else if (typeof selector === fun) {
            // ( types [, fn] )
            types[type] = selector;
            selector = undefined;
        } else if (typeof selector === str && fn === u) {
            // ( types [, selector] )
            types[type] = u;
        } else if (typeof selector === str && typeof fn === fun) {
            // ( types [, selector ] [, handler ]
            types[type] = fn;
        } else if (typeof type === str && selector === u && fn === u) {
            // ( types )
            types[type] = u;
        } else if (type === u) {
            // ()
            // Enter empty data, and the type assignment is an empty string
            return this.each((n) => delegate.remove(n, '', u, selector));
        }
        return this.each((n) => {
            for (const i in types) {
                if (types.hasOwnProperty(i)) {
                    delegate.remove(n, i, types[i], selector);
                }
            }
        });
    },
    // Append all elements matching content to the end of the element whose this subscript is 0
    append(content) {
        if (isElement(content)) {
            this[0].appendChild(content);
        } else if (content instanceof $.fn.init) {
            content.each((n) => this[0].appendChild(n));
        }
        return ($(content));
    },
    // Append all elements matching content to the front of an element in this subscript of 0
    preappend(content, before) {
        const temp = before ? before : this[0].childNodes[0],
            topElement = (temp instanceof $.fn.init) ? temp[0] : temp;

        if (isElement(content)) {
            this[0].insertBefore(content, topElement);
        } else if (content instanceof $.fn.init) {
            content.each((n) => this[0].insertBefore(n, topElement));
        }
    },
    // Append all elements in this. to the end of content
    appendTo(content) {
        if (isElement(content)) {
            this.each((n) => content.appendChild(n));
        } else if (content instanceof $.fn.init) {
            this.each((n) => content[0].appendChild(n));
        }
    },
    // Append all elements that match content to the front of this. which has a subscript 0
    preappendTo(content) {
        if (isElement(content)) {
            const topElement = content.childNodes[0];
            this.each((n) => content.insertBefore(n, topElement));
        } else if (content instanceof $.fn.init) {
            const topElement = content[0].childNodes[0];
            this.each((n) => content[0].insertBefore(n, topElement));
        }
    },
    // Change element content
    text(string) {
        //Regarding the compatibility between textContent and innerText, 
        // it has not been verified yet, so now use textContent which seems to be compatible
        if (string === u) {
            return (this[0].textContent);
        } else if (typeof string === str) {
            this.each((n) => n.textContent = string);
            return (this);
        }
    },
    // Get the width of the first element
    // Returns the largest of all effective widths
    width() {
        let textWidth;
        if (this[0].getClientRects) {
            const temp = this[0].getClientRects()[0];
            textWidth = temp ? temp.width : 0;
        }
        return Math.max(
            textWidth || 0,
            this[0].clientWidth || 0,
            this[0].offsetWidth || 0,
            this[0].innerWidth || 0
        );
    },
    // Get the height of the first element
    height() {
        let textHeight;
        if (this[0].getClientRects) {
            const temp = this[0].getClientRects()[0];
            textHeight = temp ? temp.height : 0;
        }
        return Math.max(
            textHeight || 0,
            this[0].clientHeight || 0,
            this[0].offsetHeight || 0,
            this[0].innerHeight || 0
        );
    },
    // The width and length of the inner border of the element
    // The value of non-block-level elements is 0
    innerWidth() {
        return (this[0].clientWidth);
    },
    innerHeight() {
        return (this[0].clientHeight);
    },
    // Calculated length of SVG text (not actual length)
    STWidth() {
        return (this[0].textLength.baseVal.value);
    },
    // Remove all the current DOM from the HTML document stream
    remove(index) {
        if (index === u) {
            this.each((n) => n.parentNode && n.parentNode.removeChild(n));
        } else {
            const sub = (index >= 0) ?
                index : (this.length + index);

            if (index >= 0 || index < this.length) {
                this[sub].parentNode.removeChild(this[sub]);
                delete this[sub];
                for (let i = sub; i < this.length - 1; i++) {
                    this[i + 1] = this[i];
                }
                delete this[this.length - 1];
                this.length--;
            }
        }
    },
    // Returns a single-level child element of the element with subscript 0
    childrens(filter) {
        if (typeof filter === str) {
            let elements = [];
            this.each((n) => elements = elements.concat(Array.prototype.slice.call(n.childNodes)));
            return mathchDom(elements, filter);
        } else if (typeof filter === num) {
            const ans = $();
            this.each((n) => ans.push(n.childNodes[filter]));
            return (ans);
        } else if (filter === u) {
            const ans = $();
            this.each((n) => {
                for (let i = 0; i < n.childNodes.length; i++) {
                    ans.push(n.childNodes[i]);
                }
            });
            return (ans);
        }
    },
    // Restricted search in the child elements of the element with subscript 0
    childSelect(select, max, opt) {
        const selectors = $(select, this),
            tag = '<' + select.split(/[.#]/)[0] + '>';

        opt = opt || {};
        opt.class = select.split('.').splice(1).join(' ');

        while (selectors.length > max) {
            selectors.pop().remove();
        }
        while (selectors.length < max) {
            selectors.push(this.append($(tag, opt))[0]);
        }
        return (selectors);
    },
    // Returns the element under the label of the matched element
    get(index) {
        const sub = (index >= 0) ?
            index : (this.length + index);

        if (index >= 0 || index < this.length) {
            return ($(this[sub]));
        } else {
            return (false);
        }
    },
    // Find the relative position of the current element in current
    //  current must be an ancestor element of this., and it must be a positioning element
    //  If current is not entered, the nearest relative position is returned
    offset(current) {
        if (!current[0].contains(this[0])) {
            throw 'current must be an ancestor of this.';
        }
        let dom = this[0], offsetX = 0, offsetY = 0;

        while (dom !== current[0]) {
            offsetX += dom.offsetLeft;
            offsetY += dom.offsetTop;
            dom = dom.offsetParent;
            if (dom !== current[0] && dom.contains(current[0])) {
                throw 'current is not a positioning element';
            }
        }
        return ([offsetX, offsetY]);
    },
    // Trigger events, which can trigger events bound by on and native events
    trigger(event, data) {
        event = (typeof event === str) ? { type: event } : event;
        //Trigger events element by element
        this.each((n) => {
            delegate.trigger(n, event, data);
        });
        return this;
    },
    // whether elem is a child element of this[0]
    contains(elem) {
        const e = elem instanceof $
            ? elem[0] : elem;

        return (this[0].contains(e));
    }
};
//Change the prototype chain of the init constructor
$.prototype.init.prototype = $.prototype;
//Initialized document
const root$ = $(doc);

export { $ };
