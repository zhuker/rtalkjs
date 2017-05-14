#!/usr/bin/env node
var Rx = require('rx');
var NodeRedis = require('redis');
var bluebird = require('bluebird');
var Moment = require('moment-timezone');
var PrintJ = require('printj');

bluebird.promisifyAll(NodeRedis.RedisClient.prototype);
bluebird.promisifyAll(NodeRedis.Multi.prototype);

/*
 *  Copyright 2011 Alexandru Craciun, Eyal Kaspi
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**** Functionality in Java, but not in JS ********
 * methods added to JS prototypes
 */

var NOT_IMPLEMENTED = function(){
	throw "This method is not implemented in Javascript.";
};

JavalikeEquals = function(value){
	if (value == null)
		return false;
	if (value.valueOf)
		return this.valueOf() === value.valueOf();
	return this === value;
};

JavalikeGetClass = function(){
	return this.constructor;
};

/* String */
if (!String.prototype.equals) {
	String.prototype.equals=JavalikeEquals;
}
if (!String.prototype.getBytes) {
	String.prototype.getBytes=NOT_IMPLEMENTED;
}
if (!String.prototype.getChars) {
	String.prototype.getChars=NOT_IMPLEMENTED;
}
if (!String.prototype.contentEquals){
	String.prototype.contentEquals=NOT_IMPLEMENTED;
}
if (!String.prototype.startsWith) {
	String.prototype.startsWith=function(start, from){
		var f = from != null ? from : 0;
		return this.substring(f, f + start.length) == start;
	}
}
if (!String.prototype.endsWith) {
	String.prototype.endsWith=function(end){
		if (end == null)
			return false;
		if (this.length < end.length)
			return false;
		return this.substring(this.length - end.length, this.length) == end;
	}
}
if (!String.prototype.trim) {
	var trimLeft = /^\s+/;
	var trimRight = /\s+$/;
	String.prototype.trim = function(  ) {
		return this.replace( trimLeft, "" ).replace( trimRight, "" );
	}
}
if (!String.prototype.matches){
	String.prototype.matches=function(regexp){
		return this.match("^" + regexp + "$") != null;
	}
}
if (!String.prototype.compareTo){
	String.prototype.compareTo=function(other){
		if (other == null)
			return 1;
		if (this < other)
			return -1;
		if (this == other)
			return 0;
		return 1;
	}
}

if (!String.prototype.compareToIgnoreCase){
	String.prototype.compareToIgnoreCase=function(other){
		if (other == null)
			return 1;
		return this.toLowerCase().compareTo(other.toLowerCase());
	}
}

if (!String.prototype.equalsIgnoreCase){
	String.prototype.equalsIgnoreCase=function(other){
		if (other == null)
			return false;
		return this.toLowerCase() === other.toLowerCase();
	}
}

if (!String.prototype.codePointAt){
	String.prototype.codePointAt=String.prototype.charCodeAt;
}

if (!String.prototype.codePointBefore){
	String.prototype.codePointBefore=NOT_IMPLEMENTED;
}
if (!String.prototype.codePointCount){
	String.prototype.codePointCount=NOT_IMPLEMENTED;
}

if (!String.prototype.replaceAll){
	String.prototype.replaceAll=function(regexp, replace){
		return this.replace(new RegExp(regexp, "g"), replace);
	}
}

if (!String.prototype.replaceFirst){
	String.prototype.replaceFirst=function(regexp, replace){
		return this.replace(new RegExp(regexp), replace);
	}
}

if (!String.prototype.regionMatches){
	String.prototype.regionMatches=function(ignoreCase, toffset, other, ooffset, len){
		if (arguments.length == 4){
			len=arguments[3];
			ooffset=arguments[2];
			other=arguments[1];
			toffset=arguments[0];
			ignoreCase=false;
		}
		if (toffset < 0 || ooffset < 0 || other == null || toffset + len > this.length || ooffset + len > other.length)
			return false;
		var s1 = this.substring(toffset, toffset + len);
		var s2 = other.substring(ooffset, ooffset + len);
		return ignoreCase ? s1.equalsIgnoreCase(s2) : s1 === s2;
	}
}

if(!String.prototype.contains){
	String.prototype.contains=function(it){
		return this.indexOf(it)>=0;
	};
}

if(!String.prototype.getClass){
	String.prototype.getClass=JavalikeGetClass;
}


//force valueof to match the Java's behavior
String.valueOf=function(value){
	return new String(value);
};

/* Number */
var Byte=Number;
var Double=Number;
var Float=Number;
var Integer=Number;
var Long=Number;
var Short=Number;

/* type conversion - approximative as Javascript only has integers and doubles */
if (!Number.prototype.intValue) {
	Number.prototype.intValue=function(){
		return parseInt(this);
	}
}
if (!Number.prototype.shortValue) {
	Number.prototype.shortValue=function(){
		return parseInt(this);
	}
}
if (!Number.prototype.longValue) {
	Number.prototype.longValue=function(){
		return parseInt(this);
	}
}
if (!Number.prototype.byteValue) {
	Number.prototype.byteValue=function(){
		return parseInt(this);
	}
}

if (!Number.prototype.floatValue) {
	Number.prototype.floatValue=function(){
		return parseFloat(this);
	}
}

if (!Number.prototype.doubleValue) {
	Number.prototype.doubleValue=function(){
		return parseFloat(this);
	}
}

if (!Number.parseInt) {
	Number.parseInt = parseInt;
}
if (!Number.parseShort) {
	Number.parseShort = parseInt;
}
if (!Number.parseLong) {
	Number.parseLong = parseInt;
}
if (!Number.parseByte) {
	Number.parseByte = parseInt;
}

if (!Number.parseDouble) {
	Number.parseDouble = parseFloat;
}

if (!Number.parseFloat) {
	Number.parseFloat = parseFloat;
}

if (!Number.isNaN) {
	Number.isNaN = isNaN;
}

if (!Number.prototype.isNaN) {
	Number.prototype.isNaN = isNaN;
}
if (!Number.prototype.equals) {
	Number.prototype.equals=JavalikeEquals;
}
if(!Number.prototype.getClass){
	Number.prototype.getClass=JavalikeGetClass;
}

//force valueof to match approximately the Java's behavior (for Integer.valueOf it returns in fact a double)
Number.valueOf=function(value){
	return new Number(value).valueOf();
}

/* Boolean */
if (!Boolean.prototype.equals) {
	Boolean.prototype.equals=JavalikeEquals;
}
if(!Boolean.prototype.getClass){
	Boolean.prototype.getClass=JavalikeGetClass;
}

//force valueof to match the Java's behavior
Boolean.valueOf=function(value){
	return new Boolean(value).valueOf();
}



/************* STJS helper functions ***************/
var stjs={};

stjs.global=this;
stjs.skipCopy = {"prototype":true, "constructor": true, "$typeDescription":true, "$inherit" : true};

stjs.ns=function(path){
	var p = path.split(".");
	var obj = stjs.global;
	for(var i = 0; i < p.length; ++i){
		var part = p[i];
		obj = obj[part] = obj[part] || {};
	}
	return obj;
};

stjs.copyProps=function(from, to){
	for(key in from){
		if (!stjs.skipCopy[key])
			to[key]	= from[key];
	}
	return to;
};

stjs.copyInexistentProps=function(from, to){
	for(key in from){
		if (!stjs.skipCopy[key] && !to[key])
			to[key]	= from[key];
	}
	return to;
};

stjs.extend=function(_constructor, _super, _implements, _initializer, _typeDescription, _annotations){
	if(typeof(_typeDescription) !== "object"){
		// stjs 1.3+ always passes an non-null object to _typeDescription => The code calling stjs.extend
		// was generated with version 1.2 or earlier, so let's call the 1.2 version of stjs.extend
		return stjs.extend12.apply(this, arguments);
	}

	_constructor.$inherit=[];
	var key, a;
	if(_super != null){
		// I is used as a no-op constructor that has the same prototype as _super
		// we do this because we cannot predict the result of calling new _super()
		// without parameters (it might throw an exception).
		// Basically, the following 3 lines are a safe equivalent for
		// _constructor.prototype = new _super();
		var I = function(){};
		I.prototype	= _super.prototype;
		_constructor.prototype	= new I();

		// copy static properties for super
		// assign every method from proto instance
		stjs.copyProps(_super, _constructor);
		stjs.copyProps(_super.$typeDescription, _typeDescription);
		stjs.copyProps(_super.$annotations, _annotations);

		//add the super class to inherit array
		_constructor.$inherit.push(_super);
	}

	// copy static properties and default methods from interfaces
	for(a = 0; a < _implements.length; ++a){
		if (!_implements[a]) continue;
		stjs.copyProps(_implements[a], _constructor);
		stjs.copyInexistentProps(_implements[a].prototype, _constructor.prototype);
		_constructor.$inherit.push(_implements[a]);
	}

	// remember the correct constructor
	_constructor.prototype.constructor	= _constructor;

	// run the initializer to assign all static and instance variables/functions
	if(_initializer != null){
		_initializer(_constructor, _constructor.prototype);
	}

	_constructor.$typeDescription = _typeDescription;
	_constructor.$annotations = _annotations;

	// add the default equals method if it is not present yet, and we don't have a superclass
	if(_super == null){
		if(!_constructor.prototype.equals) {
			_constructor.prototype.equals = JavalikeEquals;
		}
		if(!_constructor.prototype.getClass) {
			_constructor.prototype.getClass = JavalikeGetClass;
		}
	}

	// build package and assign
	return	_constructor;
};

/**
 * 1.2 and earlier version of stjs.extend. Included for backwards compatibility
 */
stjs.extend12=function( _constructor,  _super, _implements){
	var key, a;
	var I = function(){};
	I.prototype	= _super.prototype;
	_constructor.prototype	= new I();

	//copy static properties for super and interfaces
	// assign every method from proto instance
	for(a = 1; a < arguments.length; ++a){
		stjs.copyProps(arguments[a], _constructor);
	}
	// remember the correct constructor
	_constructor.prototype.constructor	= _constructor;

	// add the default equals method if we don't have a superclass. Code generated with version 1.2 will
	// override this method is equals() is present in the original java code.
	// this was not part of the original 1.2 version of extends, however forward compatibility
	// with 1.3 requires it
	if(_super == null){
		_constructor.prototype.equals = JavalikeEquals;
		_constructor.prototype.getClass = JavalikeGetClass;
	}

	// build package and assign
	return	_constructor;
};

/**
 * return type's annotations
 */
stjs.getAnnotations = function(clz) {
	return clz.$annotations;
};

stjs.getTypeAnnotation = function(clz, annType) {
	var ann = clz.$annotations._;
	return ann ? ann[annType]: null;
};

stjs.getMemberAnnotation = function(clz, memberName, annType) {
	var ann = clz.$annotations.memberName;
	return ann ? ann[annType]: null;
};

stjs.getParameterAnnotation = function(clz, methodName, idx, annType) {
	var ann = clz.$annotations[methodName + "$" + idx];
	return ann ? ann[annType]: null;
};

/**
 * checks if the child is an instanceof parent. it checks recursively if "parent" is the child itself or it's found somewhere in the $inherit array
 */
stjs.isInstanceOf=function(child, parent){
	if (child == null)
		return false;
	if (child === parent)
		return true;
	if (!child.$inherit)
		return false;
	for(var i = 0; i < child.$inherit.length; ++i){
		if (stjs.isInstanceOf(child.$inherit[i], parent)) {
			return true;
		}
	}
	return false;
}

stjs.enumEntry=function(idx, name){
	this._name = name;
	this._ordinal = idx;
};

stjs.enumEntry.prototype.name=function(){
	return this._name;
};
stjs.enumEntry.prototype.ordinal=function(){
	return this._ordinal;
};
stjs.enumEntry.prototype.toString=function(){
	return this._name;
};
stjs.enumEntry.prototype.equals=JavalikeEquals;

stjs.enumeration=function(){
	var i;
	var e = {};
	e._values = [];
	for(i = 0; i < arguments.length; ++i){
		e[arguments[i]] = new stjs.enumEntry(i, arguments[i]);
		e._values[i] = e[arguments[i]];
	}
	e.values = function(){return this._values;};
	e.valueOf=function(label){
		return this[label];
	}
	return e;
};


/**
 * if true the execution of generated main methods is disabled.
 * this is useful when executing unit tests, to no have the main methods executing before the tests
 */
stjs.mainCallDisabled = false;

stjs.exception=function(err){
	return err;
};

stjs.isEnum=function(obj){
	return obj != null && obj.constructor == stjs.enumEntry;
};

if (typeof Math.trunc === "function") {
	stjs.trunc = Math.trunc;
} else {
	stjs.trunc=function(n) {
		if (n == null)
			return null;
		return n >= 0 ? Math.floor(n) : Math.ceil(n);
	}
}

stjs.converters = {
	Date : function(s, type) {
		var a = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)$/
				.exec(s);
		if (a) {
			return new Date(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
		}
		return null;
	},

	Enum : function(s, type){
		return eval(type.arguments[0])[s];
	}
};


stjs.serializers = {
	Date : function(d, type) {
		function pad(n){
			return n < 10 ? "0" + n : "" + n;
		}
		if (d) {
			return "" + d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
		}
		return null;
	},

	Enum : function(e, type){
		return e != null ? e.toString() : null;
	}
};

/**
 * this functions is used to be able to send method references as callbacks
 */
stjs.bind=function(obj, method, thisParamPos) {
	var f = function(){
		var args = arguments;
		if (thisParamPos != null)
			Array.prototype.splice.call(args, thisParamPos, 0, this);
		if (typeof method === "string")
			return obj[method].apply(obj, args);
		else
			return method.apply(obj, args);
	};
	return f;
};


/** *********** global ************** */
function exception(err){
	return err;
}

function isEnum(obj){
	return obj != null && obj.constructor == stjs.enumEntry;
}

/******* parsing *************/

/**
 * parse a json string using the type definition to build a typed object hierarchy
 */
stjs.parseJSON = (function () {
	  var number
	      = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
	  var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]'
	      + '|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
	  var string = '(?:\"' + oneChar + '*\")';

	  // Will match a value in a well-formed JSON file.
	  // If the input is not well-formed, may match strangely, but not in an unsafe
	  // way.
	  // Since this only matches value tokens, it does not match whitespace, colons,
	  // or commas.
	  var jsonToken = new RegExp(
	      '(?:false|true|null|[\\{\\}\\[\\]]'
	      + '|' + number
	      + '|' + string
	      + ')', 'g');

	  // Matches escape sequences in a string literal
	  var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');

	  // Decodes escape sequences in object literals
	  var escapes = {
	    '"': '"',
	    '/': '/',
	    '\\': '\\',
	    'b': '\b',
	    'f': '\f',
	    'n': '\n',
	    'r': '\r',
	    't': '\t'
	  };
	  function unescapeOne(_, ch, hex) {
	    return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
	  }

	  var constructors = {};

	  function constr(name, param){
		  var c = constructors[name];
		  if (!c)
			  constructors[name] = c = eval(name);
		  return new c(param);
	  }

	  function convert(type, json){
		  if (!type)
			  return json;
		  var cv = stjs.converters[type.name || type];
		  if (cv)
			  return cv(json, type);
		  //hopefully the type has a string constructor
		 return constr(type, json);
	  }

	  function builder(type){
		  if (!type)
			  return {};
			if (typeof type == "function")
				return new type();
			if (type.name) {
				if (type.name == "Map")
					return {};
				if (type.name == "Array")
					return [];
				return constr(type.name);
			}
			return constr(type);
	  }

	  // A non-falsy value that coerces to the empty string when used as a key.
	  var EMPTY_STRING = new String('');
	  var SLASH = '\\';

	  // Constructor to use based on an open token.
	  var firstTokenCtors = { '{': Object, '[': Array };

	  var hop = Object.hasOwnProperty;

	  function nextMatch(str){
		  var m = jsonToken.exec(str);
		  return m != null ? m[0] : null;
	  }
	  return function (json, type) {
	    // Split into tokens
	    // Construct the object to return
	    var result;
	    var tok = nextMatch(json);
	    var topLevelPrimitive = false;
	    if ('{' === tok) {
	      result = builder(type, null);
	    } else if ('[' === tok) {
	      result = [];
	    } else {
	      // The RFC only allows arrays or objects at the top level, but the JSON.parse
	      // defined by the EcmaScript 5 draft does allow strings, booleans, numbers, and null
	      // at the top level.
	      result = [];
	      topLevelPrimitive = true;
	    }

	    // If undefined, the key in an object key/value record to use for the next
	    // value parsed.
	    var key;
	    // Loop over remaining tokens maintaining a stack of uncompleted objects and
	    // arrays.
	    var stack = [result];
	    var stack2 = [type];
	    for (tok = nextMatch(json); tok != null; tok = nextMatch(json)) {

	      var cont;
	      switch (tok.charCodeAt(0)) {
	        default:  // sign or digit
	          cont = stack[0];
	          cont[key || cont.length] = +(tok);
	          key = void 0;
	          break;
	        case 0x22:  // '"'
	          tok = tok.substring(1, tok.length - 1);
	          if (tok.indexOf(SLASH) !== -1) {
	            tok = tok.replace(escapeSequence, unescapeOne);
	          }
	          cont = stack[0];
	          if (!key) {
	            if (cont instanceof Array) {
	              key = cont.length;
	            } else {
	              key = tok || EMPTY_STRING;  // Use as key for next value seen.
	              stack2[0] = cont.constructor.$typeDescription ? cont.constructor.$typeDescription[key] : stack2[1].arguments[1];
	              break;
	            }
	          }
	          cont[key] = convert(stack2[0],tok);
	          key = void 0;
	          break;
	        case 0x5b:  // '['
	          cont = stack[0];
	          stack.unshift(cont[key || cont.length] = []);
	          stack2.unshift(stack2[0].arguments[0]);
	          //put the element type desc
	          key = void 0;
	          break;
	        case 0x5d:  // ']'
	          stack.shift();
	          stack2.shift();
	          break;
	        case 0x66:  // 'f'
	          cont = stack[0];
	          cont[key || cont.length] = false;
	          key = void 0;
	          break;
	        case 0x6e:  // 'n'
	          cont = stack[0];
	          cont[key || cont.length] = null;
	          key = void 0;
	          break;
	        case 0x74:  // 't'
	          cont = stack[0];
	          cont[key || cont.length] = true;
	          key = void 0;
	          break;
	        case 0x7b:  // '{'
	          cont = stack[0];
	          stack.unshift(cont[key || cont.length] = builder(stack2[0]));
	          stack2.unshift(null);
	          key = void 0;
	          break;
	        case 0x7d:  // '}'
	          stack.shift();
	          stack2.shift();
	          break;
	      }
	    }
	    // Fail if we've got an uncompleted object.
	    if (topLevelPrimitive) {
	      if (stack.length !== 1) { throw new Error(); }
	      result = result[0];
	    } else {
	      if (stack.length) { throw new Error(); }
	    }

	    return result;
	  };
})();




stjs.isArray=function( obj ) {
    return stjs.toString.call(obj) === "[object Array]";
};

/**
 * cls can by the type of the return.
 * If it's an array it can be either the type of an element or the type definition of the field.
 * TODO - for other collections and classes is not done yet
 */
stjs.typefy=function(obj, cls){
	if (stjs.isArray(obj)){
		var result = [];
		for(var idx = 0; idx < obj.length; idx++){
			result.push(stjs.typefy(obj[idx], elementType(cls)));
		}
		return result;
	}
	 var constructors = {};
	 function constr(name, param){
		  var c = constructors[name];
		  if (!c)
			  constructors[name] = c = eval(name);
		  return new c(param);
	  }

	 function elementType(type){
		 if (typeof type == "function")
			 return type;
		 if (type.arguments) {
			 return eval(type.arguments[0]);
		 }
		 if (typeof type == "string")
			 return eval(type);
		 return Object;
	  }


	function convert(type, json){
		  if (!type)
			  return json;
		  var cv = stjs.converters[type.name || type];
		  if (cv)
			  return cv(json, type);
		  //hopefully the type has a string constructor
		 return constr(type, json);
	  }

	 function builder(type){
		  if (!type)
			  return {};
			if (typeof type == "function")
				return new type();
			if (type.name) {
				if (type.name == "Map")
					return {};
				if (type.name == "Array")
					return [];
				return constr(type.name);
			}
			return constr(type);
	  }

	  if (obj == null)
		  return null;

	  var ret = new cls();
	  for(var key in obj){
		  var prop = obj[key];
		  if (prop == null)
			  continue;
		  var td = cls.$typeDescription[key];
		  if (!td) {
			  ret[key] = prop;
			  continue;
		  }
		  if (typeof prop == "string")
			  ret[key] = convert(td, prop);
		  else if (typeof prop == "object")
			  ret[key] = stjs.typefy(prop, td);
	  }
	  return ret;
};
stjs.hydrate=stjs.typefy

stjs.stringify=function(obj, cls){
	 if (obj == null)
		  return null;

	 var ret = {};
	  for(var key in obj){
		  var td = cls.$typeDescription[key];
		  var prop = obj[key];
		  var ser = td != null ? stjs.serializers[td.name || td] : null;

		  if (typeof prop == "function")
			  continue;

		  if (!td || !ser) {
			  ret[key] = prop;
			  continue;
		  }
		  if (typeof prop != "string")
			  if (ser)
				  ret[key] = ser(prop, td);
			  else
				  ret[key] = stjs.typefy(prop, td);
	  }
	  return ret;
};
/************* STJS asserts ***************/
var stjsAssertHandler = function(position, code, msg) {
	throw msg + " at " + position;
};
function setAssertHandler(a) {
	stjsAssertHandler = a;
}

function assertArgEquals(position, code, expectedValue, testValue) {
	if (expectedValue != testValue && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong argument. Expected: " + expectedValue + ", got:" + testValue);
}

function assertArgNotNull(position, code, testValue) {
	if (testValue == null && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong argument. Null value");
}

function assertArgTrue(position, code, condition) {
	if (!condition && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong argument. Condition is false");
}

function assertStateEquals(position, code, expectedValue, testValue) {
	if (expectedValue != testValue && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong state. Expected: " + expectedValue + ", got:" + testValue);
}

function assertStateNotNull(position, code, testValue) {
	if (testValue == null && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong state. Null value");
}

function assertStateTrue(position, code, condition) {
	if (!condition && stjsAssertHandler)
		stjsAssertHandler(position, code, "Wrong state. Condition is false");
}
/** exception **/
var Throwable = function(message, cause){
	Error.call(this);
	if(typeof Error.captureStackTrace === 'function'){
		// nice way to capture the stack trace for chrome
		Error.captureStackTrace(this, arguments.callee);
	} else {
		// alternate way to capture the stack trace for other browsers
		try{
			throw new Error();
		}catch(e){
			this.stack = e.stack;
		}
	}
	if (typeof message === "string"){
		this.detailMessage  = message;
		this.message = message;
		this.cause = cause;
	} else {
		this.cause = message;
	}
};
stjs.extend(Throwable, Error, [], function(constructor, prototype){
	prototype.detailMessage = null;
	prototype.cause = null;
	prototype.getMessage = function() {
        return this.detailMessage;
    };

	prototype.getLocalizedMessage = function() {
        return this.getMessage();
    };

	prototype.getCause = function() {
        return (this.cause==this ? null : this.cause);
    };

	prototype.toString = function() {
	        var s = "Exception";//TODO should get the exception's type name here
	        var message = this.getLocalizedMessage();
	        return (message != null) ? (s + ": " + message) : s;
	 };

	 prototype.getStackTrace = function() {
		 return this.stack;
	 };

	 prototype.printStackTrace = function(){
		 console.error(this.getStackTrace());
	 };
}, {});

var Exception = function(message, cause){
	Throwable.call(this, message, cause);
};
stjs.extend(Exception, Throwable, [], function(constructor, prototype){
}, {});

var RuntimeException = function(message, cause){
	Exception.call(this, message, cause);
};
stjs.extend(RuntimeException, Exception, [], function(constructor, prototype){
}, {});

/** stjs field manipulation */
stjs.setField=function(obj, field, value, returnOldValue){
	if (stjs.setFieldHandler)
		return stjs.setFieldHandler(obj, field, value, returnOldValue);
	var toReturn = returnOldValue ? obj[field] : value;
	obj[field] = value;
	return toReturn;
};

stjs.getField=function(obj, field){
	if (stjs.getFieldHandler)
		return stjs.getFieldHandler(obj, field);
	return obj[field];
};

var Pair = function() {};
Pair = stjs.extend(Pair, null, [], function(constructor, prototype) {
    prototype.key = null;
    prototype.value = null;
    constructor.of = function(k, v) {
        var p = new Pair();
        p.key = k;
        p.value = v;
        return p;
    };
}, {}, {});
var Platform = function() {};
Platform = stjs.extend(Platform, null, [], function(constructor, prototype) {
    constructor.possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    constructor.makeid = function() {
        var text = "";
        for (var i = 0; i < 11; i++) 
            text += Platform.possible.charAt(stjs.trunc((Math.floor(Math.random() * Platform.possible.length))));
        return text;
    };
    constructor.currentTimeMillis = function() {
        return stjs.trunc(Date.now());
    };
    constructor.isEmptyMap = function(map) {
        return map == null || (Object).keys(map).length == 0;
    };
}, {}, {});
var RTalk = function(client, tube) {
    if (!Boolean(tube)) {
        tube = "default";
    }
    this.tube = tube;
    this.kReadyQueue = tube + "_readyQueue";
    this.kDelayQueue = tube + "_delayQueue";
    this.kBuried = tube + "_buried";
    this.kDeleteCount = tube + "_deleted";
    this.kReserveCount = tube + "_reserved";
    this.client = client;
};
RTalk = stjs.extend(RTalk, null, [], function(constructor, prototype) {
    constructor.KICKED = "KICKED";
    constructor.DELETED = "DELETED";
    constructor.TOUCHED = "TOUCHED";
    constructor.BURIED = "BURIED";
    constructor.RELEASED = "RELEASED";
    constructor.NOT_FOUND = "NOT_FOUND";
    constructor.RESERVED = "RESERVED";
    constructor.TIMED_OUT = "TIMED_OUT";
    constructor.DEADLINE_SOON = "DEADLINE_SOON";
    constructor.INSERTED = "INSERTED";
    constructor.EXPECTED_CRLF = "EXPECTED_CRLF";
    constructor.JOB_TOO_BIG = "JOB_TOO_BIG";
    constructor.DRAINING = "DRAINING";
    prototype.kReadyQueue = null;
    prototype.kDelayQueue = null;
    prototype.kBuried = null;
    prototype.kDeleteCount = null;
    prototype.kReserveCount = null;
    prototype.tube = null;
    prototype.client = null;
    prototype.getRedis = function() {
        return this.client;
    };
    constructor.main = function(args) {
        var program = require("commander");
        program.version("1.0.3").option("-u, --url [url]", "Redis URL [redis://localhost:6379/0]", "redis://localhost:6379/0").option("-t, --tube [tube]", "RTalk tube to use [default]", "default").command("stats-tube").action(function(e) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("stats-tube", tube);
            var url = RTalk.toStr((program)["url"]);
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.statsTube().then(function(response) {
                console.log(response);
                r.quit();
            });
        });
        program.command("kick-job <jobid>").action(function(jobid) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("kick-job", tube, jobid);
            var url = (program)["url"];
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.kickJob(jobid).then(function(response) {
                console.log(response);
                r.quit();
            });
        });
        program.command("bury <jobid>").option("-p, --priority [pri]", "Job priority").option("-r, --reason [reason]", "Bury reason text description").action(function(jobid, cmd) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("bury", tube, jobid);
            var pri = RTalk.toLong((cmd)["priority"]);
            var reason = RTalk.toStr((cmd)["reason"]);
            var url = RTalk.toStr((program)["url"]);
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.bury(jobid, pri, reason).then(function(response) {
                console.log(response);
                r.quit();
            });
        });
        program.command("reserve").action(function(cmd) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("reserve", tube);
            var url = RTalk.toStr((program)["url"]);
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.reserve(0).then(function(response) {
                console.log(response);
                r.quit();
            });
        });
        program.command("touch <jobid>").action(function(jobid, cmd) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("touch", tube, jobid);
            var url = RTalk.toStr((program)["url"]);
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.touch(jobid).then(function(response) {
                console.log(response);
                r.quit();
            });
        });
        program.command("stats-jobs").option("-H, --human", "Print in human-readable format").action(function(cmd) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("stats-jobs", tube);
            var human = Boolean((cmd)["human"]);
            var url = (program)["url"];
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            console.log(PrintJ.sprintf("%5.5s %19.19s %13.13s %4s %4s %4s %4s %4s %4s %s %s", "State", "Ready Time", "TTR Duration", "Pri", "Rsrv", "Rels", "Bury", "Kick", "Tout", "id", "data"));
            rtalk.statsJobs().finally(function() {
                return r.quit();
            }).subscribe(function(job) {
                if (human) {
                    var readyTime = Moment(job.readyTime).calendar();
                    var duration = Moment.duration(job.ttrMsec).humanize();
                    console.log(PrintJ.sprintf("%5.5s %19.19s %13.13s %3d %4d %4d %4d %4d %4d %s %s", job.state, readyTime, duration, job.pri, job.reserves, job.releases, job.buries, job.kicks, job.timeouts, job.id, RTalk.escape(job.data.substring(0, 100)) + (job.error == null ? "" : " " + RTalk.escape(job.error))));
                } else {
                    console.log(JSON.stringify(job));
                }
            }, function(err) {
                console.error("unhandled", err);
            });
        });
        program.command("flush").action(function(cmd) {
            var tube = RTalk.toStr((program)["tube"]);
            console.log("flush", tube);
            var url = RTalk.toStr((program)["url"]);
            var r = NodeRedis.createClient(url);
            var rtalk = new RTalk(r, tube);
            rtalk.flushTube().subscribe(function(id) {
                console.log(RTalk.DELETED, id);
            }, function(err) {
                console.log(err);
            }, function() {
                r.quit();
            });
        });
        program.parse(process.argv);
        if (process.argv.slice(2).length == 0) {
            program.help();
            return;
        }
    };
    constructor.toStr = function(obj) {
        if (obj == null) {
            return "";
        }
        return "" + obj;
    };
    constructor.escape = function(data) {
        if (data == null) 
            return "(null)";
        return data.replaceAll("\n", "\\n");
    };
    prototype.updateRedisTransaction = function(m) {
        var multi = this.getRedis().multi();
        m(multi);
        return multi.execAsync();
    };
    prototype.getTube = function() {
        return this.tube;
    };
    /**
     *  use <tube>\r\n
     *  
     *  - <tube> is a name at most 200 bytes. It specifies the tube to use. If
     *  the tube does not exist, it will be created.
     *  
     *  The only reply is:
     *  
     *  USING <tube>\r\n
     *  
     *  - <tube> is the name of the tube now being used.
     */
    constructor.use = function(jedis, tube) {
        return new RTalk(jedis, tube);
    };
    /**
     *  put <pri> <delay> <ttr> <bytes>\r\n
     *  
     *  <data>\r\n
     *  
     *  It inserts a job into the client's currently used tube (see the "use"
     *  command below).
     *  
     *  - <pri> is an integer < 2**32. Jobs with smaller priority values will be
     *  scheduled before jobs with larger priorities. The most urgent priority is
     *  0; the least urgent priority is 4,294,967,295.
     *  
     *  - <delay> is an integer number of seconds to wait before putting the job
     *  in the ready queue. The job will be in the "delayed" state during this
     *  time.
     *  
     *  - <ttr> -- time to run -- is an integer number of seconds to allow a
     *  worker to run this job. This time is counted from the moment a worker
     *  reserves this job. If the worker does not delete, release, or bury the
     *  job within <ttr> seconds, the job will time out and the server will
     *  release the job. The minimum ttr is 1. If the client sends 0, the server
     *  will silently increase the ttr to 1.
     *  
     *  - <bytes> is an integer indicating the size of the job body, not
     *  including the trailing "\r\n". This value must be less than max-job-size
     *  (default: 2**16).
     *  
     *  - <data> is the job body -- a sequence of bytes of length <bytes> from
     *  the previous line.
     *  
     *  After sending the command line and body, the client waits for a reply,
     *  which may be:
     *  
     *  - "INSERTED <id>\r\n" to indicate success.
     *  
     *  - <id> is the integer id of the new job
     *  
     *  - "BURIED <id>\r\n" if the server ran out of memory trying to grow the
     *  priority queue data structure.
     *  
     *  - <id> is the integer id of the new job
     *  
     *  - "EXPECTED_CRLF\r\n" The job body must be followed by a CR-LF pair, that
     *  is, "\r\n". These two bytes are not counted in the job size given by the
     *  client in the put command line.
     *  
     *  - "JOB_TOO_BIG\r\n" The client has requested to put a job with a body
     *  larger than max-job-size bytes.
     *  
     *  - "DRAINING\r\n" This means that the server has been put into "drain
     *  mode" and is no longer accepting new jobs. The client should try another
     *  server or disconnect and try again later.
     *  
     *  The "use" command is for producers. Subsequent put commands will put jobs
     *  into the tube specified by this command. If no use command has been
     *  issued, jobs will be put into the tube named "default".
     */
    constructor.Job = function() {};
    constructor.Job = stjs.extend(constructor.Job, null, [], function(constructor, prototype) {
        constructor.DELAYED = "DELAYED";
        constructor.READY = "READY";
        constructor.RESERVED = "RESERVED";
        constructor.BURIED = "BURIED";
        prototype.id = null;
        prototype.ttrMsec = 0;
        prototype.data = null;
        prototype.state = null;
        prototype.pri = 0;
        prototype.tube = null;
        prototype.reserves = 0;
        prototype.releases = 0;
        prototype.buries = 0;
        prototype.kicks = 0;
        prototype.timeouts = 0;
        prototype.readyTime = 0;
        prototype.ctime = 0;
        prototype.now = 0;
        prototype.error = null;
        /**
         *  - "age" is the time in seconds since the put command that created
         *  this job.
         */
        prototype.age = function() {
            return this.now - this.ctime;
        };
        /**
         *  - "time-left" is the number of seconds left until the server puts
         *  this job into the ready queue. This number is only meaningful if the
         *  job is reserved or delayed. If the job is reserved and this amount of
         *  time
         */
        prototype.timeLeft = function() {
            return this.readyTime - this.now;
        };
    }, {}, {});
    constructor.Response = function(tube, status, id, data) {
        this.status = status;
        this.id = id;
        this.data = data;
        this.tube = tube;
    };
    constructor.Response = stjs.extend(constructor.Response, null, [], function(constructor, prototype) {
        prototype.tube = null;
        prototype.status = null;
        prototype.id = null;
        prototype.data = null;
        prototype.error = null;
        prototype.isReserved = function() {
            return RTalk.RESERVED.equals(this.status);
        };
        prototype.isInserted = function() {
            return RTalk.INSERTED.equals(this.status);
        };
        prototype.isDeleted = function() {
            return RTalk.DELETED.equals(this.status);
        };
        prototype.isBuried = function() {
            return RTalk.BURIED.equals(this.status);
        };
        prototype.isKicked = function() {
            return RTalk.KICKED.equals(this.status);
        };
        prototype.toString = function() {
            var builder = "";
            builder += "{\"";
            if (this.tube != null) {
                builder += ("tube\":\"");
                builder += (this.tube);
                builder += ("\",\"");
            }
            if (this.id != null) {
                builder += ("id\":\"");
                builder += (this.id);
                builder += ("\",\"");
            }
            if (this.status != null) {
                builder += ("status\":\"");
                builder += (this.status);
                builder += ("\",\"");
            }
            if (this.error != null) {
                builder += ("error\":\"");
                builder += (this.error);
                builder += ("\",\"");
            }
            if (this.data != null) {
                builder += ("data\":\"");
                builder += (this.data);
            }
            builder += ("\"}");
            return builder.toString();
        };
    }, {}, {});
    prototype.put = function(pri, delayMsec, ttrMsec, data) {
        var id = this.newId();
        return this.putWithId(id, pri, delayMsec, ttrMsec, data);
    };
    prototype.newId = function() {
        return Platform.makeid();
    };
    prototype.putWithId = function(id, pri, delayMsec, ttrMsec, data) {
        var contains = this.contains(id);
        var put = contains.then(stjs.bind(this, function(idExists) {
            if (idExists) {
                var bury = this.bury(id, pri);
                return bury;
            }
            var _ttrMsec = Math.max(1000, ttrMsec);
            var status = delayMsec > 0 ? RTalk.Job.DELAYED : RTalk.Job.READY;
            var exec = this.updateRedisTransaction(stjs.bind(this, function(tx) {
                var now = Platform.currentTimeMillis();
                if (delayMsec > 0) {
                    var readyTimeMsec = now + delayMsec;
                    tx.zadd(this.kDelayQueue, readyTimeMsec, id);
                } else {
                    tx.zadd(this.kReadyQueue, pri, id);
                }
                tx.hset(this.kJob(id), RTalk.fPriority, Long.toString(pri));
                tx.hset(this.kJob(id), RTalk.fTtr, Long.toString(_ttrMsec));
                tx.hset(this.kJob(id), RTalk.fData, data);
                tx.hset(this.kJob(id), RTalk.fState, status);
                tx.hset(this.kJob(id), RTalk.fCtime, Long.toString(now));
                tx.hset(this.kJob(id), RTalk.fTube, this.tube);
            }));
            return exec.then(stjs.bind(this, function(a) {
                return Promise.resolve(this.on(this.Response(RTalk.INSERTED, id, data)));
            }));
        }));
        return put;
    };
    prototype.on = function(response) {
        return response;
    };
    constructor.fTube = "tube";
    constructor.fState = "state";
    constructor.fPriority = "pri";
    constructor.fReserves = "reserves";
    constructor.fCtime = "ctime";
    constructor.fTtr = "ttr";
    constructor.fData = "data";
    constructor.fTimeouts = "timeouts";
    constructor.fReleases = "releases";
    constructor.fBuries = "buries";
    constructor.fKicks = "kicks";
    constructor.fBuryReason = "error";
    prototype.kJob = function(id) {
        return this.tube + "_" + id;
    };
    prototype.contains = function(id) {
        return this.getRedis().existsAsync(this.kJob(id)).then(function(i) {
            return Promise.resolve(Boolean(i));
        });
    };
    prototype._isBuried = function(id) {
        return this.getRedis().zscoreAsync(this.kBuried, id).then(function(i) {
            return Promise.resolve(i != null);
        });
    };
    /**
     *  The bury command puts a job into the "buried" state. Buried jobs are put
     *  into a FIFO linked list and will not be touched by the server again until
     *  a client kicks them with the "kick" command.
     *  
     *  The bury command looks like this:
     *  
     *  bury <id> <pri>\r\n
     *  
     *  - <id> is the job id to release.
     *  
     *  - <pri> is a new priority to assign to the job.
     *  
     *  There are two possible responses:
     *  
     *  - "BURIED\r\n" to indicate success.
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     *  client.
     */
    prototype.bury = function(id, pri, reason) {
        var contains = this.contains(id);
        return contains.then(stjs.bind(this, function(_contains) {
            if (!_contains) {
                return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
            }
            return this.getRedis().hgetAsync(this.kJob(id), RTalk.fData).then(stjs.bind(this, function(data) {
                var tx = this.getRedis().multi();
                tx.zrem(this.kReadyQueue, id);
                tx.zrem(this.kDelayQueue, id);
                tx.hset(this.kJob(id), RTalk.fPriority, Long.toString(pri));
                tx.hset(this.kJob(id), RTalk.fState, RTalk.Job.BURIED);
                tx.decr(this.kReserveCount);
                if (reason != null) {
                    tx.hset(this.kJob(id), RTalk.fBuryReason, reason);
                }
                tx.hincrby(this.kJob(id), RTalk.fBuries, 1);
                tx.zadd(this.kBuried, Platform.currentTimeMillis(), id);
                return tx.execAsync().then(stjs.bind(this, function(a) {
                    var response = this.Response(RTalk.BURIED, id, data);
                    response.error = reason;
                    return Promise.resolve(this.on(response));
                }));
            }));
        }));
    };
    /**
     *  The delete command removes a job from the server entirely. It is normally
     *  used by the client when the job has successfully run to completion. A
     *  client can delete jobs that it has reserved, ready jobs, delayed jobs,
     *  and jobs that are buried. The delete command looks like this:
     *  
     *  delete <id>\r\n
     *  
     *  - <id> is the job id to delete.
     *  
     *  The client then waits for one line of response, which may be:
     *  
     *  - "DELETED\r\n" to indicate success.
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist or is not either reserved by
     *  the client, ready, or buried. This could happen if the job timed out
     *  before the client sent the delete command.
     */
    prototype.Delete = function(id) {
        return this.contains(id).then(stjs.bind(this, function(_contains) {
            if (!_contains) {
                return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
            }
            var then2 = this.updateRedisTransaction(stjs.bind(this, function(tx) {
                tx.zrem(this.kDelayQueue, id);
                tx.zrem(this.kReadyQueue, id);
                tx.del(this.kJob(id));
                tx.incr(this.kDeleteCount);
                tx.decr(this.kReserveCount);
            })).then(stjs.bind(this, function(a) {
                return Promise.resolve(this.on(this.Response(RTalk.DELETED, id)));
            }));
            return then2;
        }));
    };
    prototype.Response = function(status, id, data) {
        return new RTalk.Response(this.getTube(), status, id, data);
    };
    prototype._pri = function(r, id) {
        return RTalk.toLongRx(r.hgetAsync(this.kJob(id), RTalk.fPriority));
    };
    constructor.toLongRx = function(hgetAsync) {
        return Rx.Observable.fromPromise(hgetAsync).map(function(str) {
            return RTalk.toLong(str);
        });
    };
    /**
     *  The release command puts a reserved job back into the ready queue (and
     *  marks its state as "ready") to be run by any client. It is normally used
     *  when the job fails because of a transitory error. It looks like this:
     *  
     *  release <id> <pri> <delay>\r\n
     *  
     *  - <id> is the job id to release.
     *  
     *  - <pri> is a new priority to assign to the job.
     *  
     *  - <delay> is an integer number of seconds to wait before putting the job
     *  in the ready queue. The job will be in the "delayed" state during this
     *  time.
     *  
     *  The client expects one line of response, which may be:
     *  
     *  - "RELEASED\r\n" to indicate success.
     *  
     *  - "BURIED\r\n" if the server ran out of memory trying to grow the
     *  priority queue data structure.
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     *  client.
     */
    prototype.release = function(id, pri, delayMsec) {
        return this.contains(id).then(stjs.bind(this, function(_contains) {
            if (!_contains) {
                return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
            }
            return this.updateRedisTransaction(stjs.bind(this, function(tx) {
                if (delayMsec == 0) {
                    tx.zadd(this.kReadyQueue, pri, id);
                }
                tx.zadd(this.kDelayQueue, Platform.currentTimeMillis() + delayMsec, id);
                tx.hset(this.kJob(id), RTalk.fPriority, Long.toString(pri));
                tx.hset(this.kJob(id), RTalk.fState, delayMsec > 0 ? RTalk.Job.DELAYED : RTalk.Job.READY);
                tx.decr(this.kReserveCount);
                tx.hincrby(this.kJob(id), RTalk.fReleases, 1);
            })).then(stjs.bind(this, function(a) {
                return Promise.resolve(this.on(this.Response(RTalk.RELEASED, id)));
            }));
        }));
    };
    prototype.reserve = function(blockTimeoutMsec) {
        var now = Platform.currentTimeMillis();
        var r = this.getRedis();
        var readyQueueSize_ = RTalk.rxLong(r.zcardAsync(this.kReadyQueue));
        var copyToReadyQueue = readyQueueSize_.concatMap(stjs.bind(this, function(readyQueueSize) {
            if (readyQueueSize == 0) {
                var delayQueueSize_ = RTalk.rxLong(r.zcardAsync(this.kDelayQueue));
                var concatMap3 = delayQueueSize_.concatMap(stjs.bind(this, function(delayQueueSize) {
                    if (delayQueueSize == 0) {
                        return Rx.Observable.just(0);
                    }
                    var delayedIds_ = RTalk.rxArray(r.zrangebyscoreAsync(this.kDelayQueue, 0, now));
                    return this.prioritiesArray(r, delayedIds_).concatMap(stjs.bind(this, function(arr) {
                        return RTalk.rx(r.zaddAsync(this.kReadyQueue, arr));
                    }));
                }));
                return concatMap3;
            }
            return Rx.Observable.just(0);
        }));
        var ids = RTalk.rxArray(r.zrangeAsync(this.kReadyQueue, 0, 0));
        var jobs = ids.concatMap(stjs.bind(this, function(id) {
            return RTalk.rx(this._getJob(r, id));
        }));
        var firstJob_ = jobs.filter(function(j) {
            return j != null && !RTalk.Job.BURIED.equals(j.state);
        }).take(1);
        var responseRx = firstJob_.concatMap(stjs.bind(this, function(j) {
            return RTalk.rx(this.updateRedisTransaction(stjs.bind(this, function(tx) {
                tx.hset(this.kJob(j.id), RTalk.fState, RTalk.Job.RESERVED);
                tx.zrem(this.kReadyQueue, j.id);
                tx.zadd(this.kDelayQueue, now + j.ttrMsec, j.id);
                tx.hincrby(this.kJob(j.id), RTalk.fReserves, 1);
                tx.incr(this.kReserveCount);
            }))).map(stjs.bind(this, function(arr) {
                return this.on(this.Response(RTalk.RESERVED, j.id, j.data));
            }));
        })).defaultIfEmpty(this.Response(RTalk.TIMED_OUT, null, null));
        var responseRx_ = copyToReadyQueue.ignoreElements().concat(responseRx);
        return responseRx_.toPromise();
    };
    /**
     *  The "touch" command allows a worker to request more time to work on a
     *  job. This is useful for jobs that potentially take a long time, but you
     *  still want the benefits of a TTR pulling a job away from an unresponsive
     *  worker. A worker may periodically tell the server that it's still alive
     *  and processing a job (e.g. it may do this on DEADLINE_SOON). The command
     *  postpones the auto release of a reserved job until TTR seconds from when
     *  the command is issued.
     *  
     *  The touch command looks like this:
     *  
     *  touch <id>\r\n
     *  
     *  - <id> is the ID of a job reserved by the current connection.
     *  
     *  There are two possible responses:
     *  
     *  - "TOUCHED\r\n" to indicate success.
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist or is not reserved by the
     *  client.
     */
    prototype.touch = function(id) {
        return this.contains(id).then(stjs.bind(this, function(_contains) {
            if (!_contains) {
                return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
            }
            var r = this.getRedis();
            return this._getJob(r, id).then(stjs.bind(this, function(j) {
                if (j == null || !RTalk.Job.RESERVED.equals(j.state)) {
                    return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
                }
                return r.zaddAsync(this.kDelayQueue, [Platform.currentTimeMillis() + j.ttrMsec, id]).then(stjs.bind(this, function(x) {
                    return Promise.resolve(this.on(this.Response(RTalk.TOUCHED, id, j.data)));
                }));
            }));
        }));
    };
    /**
     *  The kick command applies only to the currently used tube. It moves jobs
     *  into the ready queue. If there are any buried jobs, it will only kick
     *  buried jobs. Otherwise it will kick delayed jobs. It looks like:
     *  
     *  kick <bound>\r\n
     *  
     *  - <bound> is an integer upper bound on the number of jobs to kick. The
     *  server will kick no more than <bound> jobs.
     *  
     *  The response is of the form:
     *  
     *  KICKED <count>\r\n
     *  
     *  - <count> is an integer indicating the number of jobs actually kicked.
     */
    prototype.kick = function(bound) {
        var now = Platform.currentTimeMillis();
        var r = this.getRedis();
        var idsRx = RTalk.rxArray(r.zcardAsync(this.kBuried).then(stjs.bind(this, function(buried) {
            if (buried > 0) {
                return r.zrangeAsync(this.kBuried, 0, bound);
            }
            return r.zrangebyscoreAsync(this.kDelayQueue, 0.0, Double.POSITIVE_INFINITY, "limit", 0, bound);
        })));
        var prisRx = this.priorities(r, idsRx).toArray().concatMap(stjs.bind(this, function(pris) {
            return RTalk.rx(this.updateRedisTransaction(stjs.bind(this, function(tx) {
                pris.forEach(stjs.bind(this, function(p) {
                    var id = p.key;
                    var pri = p.value;
                    this._kickJob(id, now, tx, pri);
                    this.on(this.Response(RTalk.KICKED, id));
                }));
            }))).map(function(a) {
                return pris;
            });
        }));
        return prisRx.count().toPromise();
    };
    /**
     *  The kick-job command is a variant of kick that operates with a single job
     *  identified by its job id. If the given job id exists and is in a buried
     *  or delayed state, it will be moved to the ready queue of the the same
     *  tube where it currently belongs. The syntax is:
     *  
     *  kick-job <id>\r\n
     *  
     *  - <id> is the job id to kick.
     *  
     *  The response is one of:
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist or is not in a kickable
     *  state. This can also happen upon internal errors.
     *  
     *  - "KICKED\r\n" when the operation succeeded.
     */
    prototype.kickJob = function(id) {
        var now = Platform.currentTimeMillis();
        return this._isBuried(id).then(stjs.bind(this, function(_buried) {
            if (!_buried) {
                return Promise.resolve(this.Response(RTalk.NOT_FOUND, id));
            }
            return this._pri(this.getRedis(), id).concatMap(stjs.bind(this, function(pri) {
                return RTalk.rx(this.updateRedisTransaction(stjs.bind(this, function(tx) {
                    return this._kickJob(id, now, tx, pri);
                })));
            })).map(stjs.bind(this, function(x) {
                return this.on(this.Response(RTalk.KICKED, id));
            })).toPromise();
        }));
    };
    prototype._kickJob = function(id, now, tx, pri) {
        tx.zrem(this.kBuried, id);
        tx.hset(this.kJob(id), RTalk.fState, RTalk.Job.READY);
        tx.hincrby(this.kJob(id), RTalk.fKicks, 1);
        tx.zadd(this.kReadyQueue, pri, id);
    };
    /**
     *  The stats-job command gives statistical information about the specified
     *  job if it exists. Its form is:
     *  
     *  stats-job <id>\r\n
     *  
     *  - <id> is a job id.
     *  
     *  The response is one of:
     *  
     *  - "NOT_FOUND\r\n" if the job does not exist.
     *  
     *  - "OK <bytes>\r\n<data>\r\n"
     *  
     *  - <bytes> is the size of the following data section in bytes.
     *  
     *  - <data> is a sequence of bytes of length <bytes> from the previous line.
     *  It is a YAML file with statistical information represented a dictionary.
     *  
     *  The stats-job data is a YAML file representing a single dictionary of
     *  strings to scalars. It contains these keys:
     *  
     *  - "id" is the job id
     *  
     *  - "tube" is the name of the tube that contains this job
     *  
     *  - "state" is "ready" or "delayed" or "reserved" or "buried"
     *  
     *  - "pri" is the priority value set by the put, release, or bury commands.
     *  
     *  - "age" is the time in seconds since the put command that created this
     *  job.
     *  
     *  - "time-left" is the number of seconds left until the server puts this
     *  job into the ready queue. This number is only meaningful if the job is
     *  reserved or delayed. If the job is reserved and this amount of time
     *  elapses before its state changes, it is considered to have timed out.
     *  
     *  - "file" is the number of the earliest binlog file containing this job.
     *  If -b wasn't used, this will be 0.
     *  
     *  - "reserves" is the number of times this job has been reserved.
     *  
     *  - "timeouts" is the number of times this job has timed out during a
     *  reservation.
     *  
     *  - "releases" is the number of times a client has released this job from a
     *  reservation.
     *  
     *  - "buries" is the number of times this job has been buried.
     *  
     *  - "kicks" is the number of times this job has been kicked.
     */
    prototype.statsJob = function(id) {
        return this._getJob(this.getRedis(), id);
    };
    constructor.rxLong = function(promise) {
        return Rx.Observable.fromPromise(promise).map(function(d) {
            return RTalk.toLong(d);
        });
    };
    prototype.prioritiesArray = function(r, ids) {
        return this.priorities(r, ids).reduce(function(arr, map) {
            arr.push(map.value, map.key);
            return arr;
        }, []);
    };
    prototype.priorities = function(r, ids) {
        return ids.concatMap(stjs.bind(this, function(id) {
            return this._pri(r, id).map(function(pri) {
                return Pair.of(id, pri);
            });
        }));
    };
    constructor.rxArray = function(promise) {
        return Rx.Observable.fromPromise(promise).filter(function(x) {
            return x != null;
        }).concatMap(function(arr) {
            return Rx.Observable.from(arr);
        });
    };
    constructor.rx = function(promise) {
        return Rx.Observable.fromPromise(promise).filter(function(x) {
            return x != null;
        });
    };
    constructor.toLong = function(zcard) {
        var i = parseInt(zcard);
        if (isNaN(i)) {
            return 0;
        }
        return i;
    };
    prototype._getJob = function(r, id) {
        var now = Platform.currentTimeMillis();
        var _job = r.hgetallAsync(this.kJob(id));
        var then = _job.then(stjs.bind(this, function(job) {
            if (Platform.isEmptyMap(job)) 
                return Promise.resolve(null);
            var _readyTime = r.zscoreAsync(this.kDelayQueue, id);
            var jobp = _readyTime.then(function(readyTime) {
                var j = new RTalk.Job();
                if (readyTime != null) {
                    j.readyTime = RTalk.toLong(readyTime);
                } else {
                    j.readyTime = RTalk.toLong(job[RTalk.fCtime]);
                }
                j.tube = job[RTalk.fTube];
                j.state = job[RTalk.fState];
                if (RTalk.Job.DELAYED.equals(j.state) || RTalk.Job.RESERVED.equals(j.state)) {
                    if (j.readyTime <= now) {
                        j.state = RTalk.Job.READY;
                    }
                }
                j.pri = RTalk.toLong(job[RTalk.fPriority]);
                j.data = RTalk.substr(job[RTalk.fData], 0, 64 * 1024);
                delete job[RTalk.fData];
                j.ttrMsec = RTalk.toLong(job[RTalk.fTtr]);
                j.id = id;
                j.reserves = RTalk.toLong(job[RTalk.fReserves]);
                j.releases = RTalk.toLong(job[RTalk.fReleases]);
                j.buries = RTalk.toLong(job[RTalk.fBuries]);
                j.kicks = RTalk.toLong(job[RTalk.fKicks]);
                j.timeouts = RTalk.toLong(job[RTalk.fTimeouts]);
                j.ctime = RTalk.toLong(job[RTalk.fCtime]);
                j.now = Platform.currentTimeMillis();
                j.error = job[RTalk.fBuryReason];
                return Promise.resolve(j);
            });
            return jobp;
        }));
        return then;
    };
    constructor.substr = function(str, start, end) {
        if (str == null || str.length < (end - start)) {
            return str;
        }
        return str.substring(start, end);
    };
    constructor.StatsTube = function() {};
    constructor.StatsTube = stjs.extend(constructor.StatsTube, null, [], function(constructor, prototype) {
        prototype.name = null;
        prototype.currentjobsUrgent = 0;
        prototype.currentjobsready = 0;
        prototype.currentjobsreserved = 0;
        prototype.currentjobsdelayed = 0;
        prototype.currentjobsburied = 0;
        prototype.totaljobs = 0;
        prototype.currentusing = 0;
        prototype.currentwaiting = 0;
        prototype.currentwatching = 0;
        prototype.pause = 0;
        prototype.cmddelete = 0;
        prototype.cmdpausetube = 0;
        prototype.pausetimeleft = 0;
    }, {}, {});
    /**
     *  The stats-tube data is a YAML file representing a single dictionary of
     *  strings to scalars. It contains these keys:
     *  
     *  - "name" is the tube's name.
     *  
     *  - "current-jobs-urgent" is the number of ready jobs with priority < 1024
     *  in this tube.
     *  
     *  - "current-jobs-ready" is the number of jobs in the ready queue in this
     *  tube.
     *  
     *  - "current-jobs-reserved" is the number of jobs reserved by all clients
     *  in this tube.
     *  
     *  - "current-jobs-delayed" is the number of delayed jobs in this tube.
     *  
     *  - "current-jobs-buried" is the number of buried jobs in this tube.
     *  
     *  - "total-jobs" is the cumulative count of jobs created in this tube in
     *  the current beanstalkd process.
     *  
     *  - "current-using" is the number of open connections that are currently
     *  using this tube.
     *  
     *  - "current-waiting" is the number of open connections that have issued a
     *  reserve command while watching this tube but not yet received a response.
     *  
     *  - "current-watching" is the number of open connections that are currently
     *  watching this tube.
     *  
     *  - "pause" is the number of seconds the tube has been paused for.
     *  
     *  - "cmd-delete" is the cumulative number of delete commands for this tube
     *  
     *  - "cmd-pause-tube" is the cumulative number of pause-tube commands for
     *  this tube.
     *  
     *  - "pause-time-left" is the number of seconds until the tube is un-paused.
     */
    prototype.statsTube = function() {
        var now = Platform.currentTimeMillis();
        var r = this.getRedis();
        var m = r.multi();
        m.zcard(this.kReadyQueue);
        m.zcount(this.kDelayQueue, 0, now);
        m.zcount(this.kDelayQueue, now + 1, Double.POSITIVE_INFINITY);
        m.zcard(this.kBuried);
        m.get(this.kReserveCount);
        m.get(this.kDeleteCount);
        m.zcard(this.kDelayQueue);
        return m.execAsync().then(stjs.bind(this, function(arr) {
            var zkReadyQueue = RTalk.toLong(arr[0]);
            var zkDelayQueueNow = RTalk.toLong(arr[1]);
            var zkDelayQueueFuture = RTalk.toLong(arr[2]);
            var zkBuried = RTalk.toLong(arr[3]);
            var zkReserveCount = RTalk.toLong(arr[4]);
            var zkDeleteCount = RTalk.toLong(arr[5]);
            var zkDelayQueue = RTalk.toLong(arr[6]);
            var stats = new RTalk.StatsTube();
            stats.name = this.tube;
            stats.currentjobsready = zkReadyQueue + zkDelayQueueNow;
            stats.currentjobsdelayed = zkDelayQueueFuture;
            stats.currentjobsburied = zkBuried;
            stats.currentjobsreserved = zkReserveCount;
            stats.totaljobs = zkReadyQueue + zkDelayQueue + zkBuried + zkDeleteCount;
            stats.cmddelete = zkDeleteCount;
            return Promise.resolve(stats);
        }));
    };
    prototype.statsJobs = function() {
        var r = this.getRedis();
        var buried = RTalk.rxArray(r.zrangeAsync(this.kBuried, 0, -1));
        var ready = RTalk.rxArray(r.zrangeAsync(this.kReadyQueue, 0, -1));
        var delayed = RTalk.rxArray(r.zrangeAsync(this.kDelayQueue, 0, -1));
        var ids = Rx.Observable.concat([buried, ready, delayed]);
        return ids.concatMap(stjs.bind(this, function(id) {
            return RTalk.rx(this._getJob(r, id));
        }));
    };
    prototype.flushTube = function() {
        var r = this.getRedis();
        var buried = RTalk.rxArray(r.zrangeAsync(this.kBuried, 0, -1));
        var ready = RTalk.rxArray(r.zrangeAsync(this.kReadyQueue, 0, -1));
        var delayed = RTalk.rxArray(r.zrangeAsync(this.kDelayQueue, 0, -1));
        var ids = Rx.Observable.concat([buried, ready, delayed]);
        return ids.concatMap(stjs.bind(this, function(id) {
            return RTalk.rx(this.Delete(id)).map(function(_r) {
                return _r.id;
            });
        }));
    };
}, {client: "NodeRedis"}, {});
if (!stjs.mainCallDisabled) 
    RTalk.main();
//# sourceMappingURL=rtalkjs.map
