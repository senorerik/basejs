Element = function(type, atts) {
    this.el = document.createElement(type);

    for(attr in atts) {
        this.el.setAttribute(attr, atts[attr]);
    }
    
    return this.el;
};

Function.prototype.bindAsEventListener = function() {
    var __method = this, object = arguments[0];
    return function(event) {
      return __method.apply(object, [event || window.event].concat(arguments));
    }
};

Function.prototype.bind = function() {
    if (arguments.length < 2 && !arguments[0]) return this;
    var __method = this,  object = arguments[0];
    return function() {
      return __method.apply(object, arguments);
    }
}

HTMLElement.prototype.setStyle = function(styles) {
    for(cssStyle in styles) {
        this.style[cssStyle] = styles[cssStyle];
    }
    return this;
};

var $ = function(selector) {
    if(typeof document.querySelector === 'function') {
        var all = document.querySelectorAll(selector);
        if(all != null && all.length > 1) {
            return all;
        } else {
            return document.querySelector(selector);
        }
    } else {
        //var cascade = selector.split(' ');
        //var context;
        //
        //for(var i = 0; i < cascade.length; i++) {
        //    if(cascade[i].indexOf('#') != -1) {
        //        context = document.getElementById(cascade[i].split('#')[1]);
        //    }
        //}
        //
        //if((/^\w/).test(selector)) {
        //    return document.getElementById(selector);
        //} else if((/^\./).test(selector)) {
        //    
        //}
        //if(selector.match(/^[ A-Za-z0-9]+/)) {
        //    if(!document.getElementById(selector)) {
        //        return document.querySelector(selector);
        //    } else {
        //        return document.getElementById(selector);
        //    }
        //} else {
        //    return document.querySelector(selector);
        //}
    }
};

// jacked from prototype
Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};
/*
Function.prototype.curry = function() {
    if (!arguments.length) return this;
    var __method = this;
    return function() {
      return __method.apply(this, arguments);
    }
};
Function.prototype.delay = function() {
    var __method = this, args = arguments, timeout = args[0] * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
};
Function.prototype.defer = Function.prototype.delay.curry(0.01);
*/

var Ajax = function(options) {
    this.options = {
        method: 'post', 
        asynchronous: true,
        contentType:  'application/x-www-form-urlencoded',
        encoding:     'UTF-8',
        parameters:   '',
    };
    
    Object.extend(this.options, options || {});
    this.options.method = this.options.method.toLowerCase();
    
    return this.options;
};

Ajax.Request = function(url, options) {
    this.options = new Ajax(options);

    this.transport = new XMLHttpRequest();
    
    try {
        this.transport.open(this.options.method, url, this.options.asynchronous);
        
        this.transport.onreadystatechange = this.onStateChange.bind(this);
        this.setRequestHeaders();
        
        this.body = this.method == 'post' ? (this.options.postBody || params) : null;
        this.transport.send(this.body);
    } catch(e) {
        console.error('request error', e)
    }
    
};
Ajax.Request.Events = ['Uninitialized', 'Connected', 'Requested', 'Processing', 'Complete', 'Failure', 'Success'];

Ajax.Request.prototype.onStateChange = function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete)) {
        this.respondToReadyState(this.transport.readyState);
    }
};

Ajax.Request.prototype.respondToReadyState = function(state) {
    this._complete = (state === 4) ? true : false;

    if(this._complete) {
        try {
            (this.options['on'+Ajax.Request.Events[this.getSuccessCode()]] || function() {} )(new Ajax.Response(this.transport));
                //this.options['on'+Ajax.Request.Events[state]] || 
        } catch(e) {
            console.error('readystate error', e)
        }
    }
    
console.log(state)
    try {
        (this.options['on'+Ajax.Request.Events[state]] || function() {})(new Ajax.Response(this.transport));
    } catch(e) {
        console.error('readystate error', e)
    }
    
};

Ajax.Request.prototype.getSuccessCode = function() {
    var successCode = (!this.transport.status) ? 5 : (this.transport.status >= 200 && this.transport.status < 300) ? 6 : 5;
    return successCode;
};

Ajax.Request.prototype.setRequestHeaders = function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };
    
    if(this.options.method == 'post') {
        headers['Content-type'] = this.options.contentType+(this.options.encoding ? '; charset='+this.options.encoding : '');
    }
    
    for(var name in headers) {
        this.transport.setRequestHeader(name, headers[name]);
    }
};

Ajax.Response = function(response) {
	this.response = {
		responseText: response.responseText,
		responseXML: response.responseXML,
		responseJSON: eval('('+response.responseText+')')
	};
	
	return this.response;
};

