// low-level delegation machinery
$e._listener = {
	// create a dispatcher function
	getDispatcher: function(){
		// following comments pulled out-of-line to prevent cloning them 
		// in the returned function.
		// - indices (i) that are really in the array of listeners (ls) will 
		//   not be in Array.prototype. This is the 'sparse array' trick
		//   that keeps us safe from libs that take liberties with built-in 
		//   objects
		// - listener is invoked with current scope (this)
		return function(){
			var ap=Array.prototype, c=arguments.callee, ls=c._listeners, t=c.target;
			// return value comes from original target function
			var r = t && t.apply(this, arguments);
			// make local copy of listener array so it is immutable during processing
			var lls;
			//>>includeStart("connectRhino", kwArgs.profileProperties.hostenvType == "rhino");
			if(!$e.isRhino){
			//>>includeEnd("connectRhino");
				//>>includeStart("connectBrowser", kwArgs.profileProperties.hostenvType != "rhino");
				lls = [].concat(ls);
				//>>includeEnd("connectBrowser");
			//>>includeStart("connectRhino", kwArgs.profileProperties.hostenvType == "rhino");
			}else{
				// FIXME: in Rhino, using concat on a sparse Array results in a dense Array.
				// IOW, if an array A has elements [0, 2, 4], then under Rhino, "concat [].A"
				// results in [0, 1, 2, 3, 4], where element 1 and 3 have value 'undefined'
				// "A.slice(0)" has the same behavior.
				lls = [];
				for(var i in ls){
					lls[i] = ls[i];
				}
			}
			//>>includeEnd("connectRhino");

			// invoke listeners after target function
			for(var i in lls){
				if(!(i in ap)){
					lls[i].apply(this, arguments);
				}
			}
			// return value comes from original target function
			return r;
		}
	},
	// add a listener to an object
	add: function(/*Object*/ source, /*String*/ method, /*Function*/ listener){
		// Whenever 'method' is invoked, 'listener' will have the same scope.
		// Trying to supporting a context object for the listener led to 
		// complexity. 
		// Non trivial to provide 'once' functionality here
		// because listener could be the result of a $e.hitch call,
		// in which case two references to the same hitch target would not
		// be equivalent. 
		source = source || $e.global;
		// The source method is either null, a dispatcher, or some other function
		var f = source[method];
		// Ensure a dispatcher
		if(!f||!f._listeners){
			var d = $e._listener.getDispatcher();
			// original target function is special
			d.target = f;
			// dispatcher holds a list of listeners
			d._listeners = []; 
			// redirect source to dispatcher
			f = source[method] = d;
		}
		// The contract is that a handle is returned that can 
		// identify this listener for disconnect. 
		//
		// The type of the handle is private. Here is it implemented as Integer. 
		// DOM event code has this same contract but handle is Function 
		// in non-IE browsers.
		//
		// We could have separate lists of before and after listeners.
		return f._listeners.push(listener) ; /*Handle*/
	},
	// remove a listener from an object
	remove: function(/*Object*/ source, /*String*/ method, /*Handle*/ handle){
		var f = (source||$e.global)[method];
		// remember that handle is the index+1 (0 is not a valid handle)
		if(f && f._listeners && handle--){
			delete f._listeners[handle];
		}
	}
};

// Multiple delegation for arbitrary methods.

// This unit knows nothing about DOM, 
// but we include DOM aware 
// documentation and dontFix
// argument here to help the autodocs.
// Actual DOM aware code is in event.js.

$e.connect = function(/*Object|null*/ obj, 
						/*String*/ event, 
						/*Object|null*/ context, 
						/*String|Function*/ method,
						/*Boolean*/ dontFix){
	// summary:
	//		Create a link that calls one function when another executes. 
	//
	// description:
	//		Connects method to event, so that after event fires, method
	//		does too. All connected functions are passed the same arguments as
	//		the event function was initially called with. You may connect as
	//		many methods to event as needed.
	//
	//		event must be a string. If obj is null, $e.global is used.
	//
	//		null arguments may simply be omitted.
	//
	//		obj[event] can resolve to a function or undefined (null). 
	//		If obj[event] is null, it is assigned a function.
	//
	//		The return value is a handle that is needed to 
	//		remove this connection with $e.disconnect.
	//
	// obj: 
	//		The source object for the event function. 
	//		Defaults to $e.global if null.
	//		If obj is a DOM node, the connection is delegated 
	//		to the DOM event manager (unless dontFix is true).
	//
	// event:
	//		String name of the event function in obj. 
	//		I.e. identifies a property obj[event].
	//
	// context: 
	//		The object that method will receive as "this".
	//
	//		If context is null and method is a function, then method
	//		inherits the context of event.
	//	
	//		If method is a string then context must be the source 
	//		object object for method (context[method]). If context is null,
	//		$e.global is used.
	//
	// method:
	//		A function reference, or name of a function in context. 
	//		The function identified by method fires after event does. 
	//		method receives the same arguments as the event.
	//		See context argument comments for information on method's scope.
	//
	// dontFix:
	//		If obj is a DOM node, set dontFix to true to prevent delegation 
	//		of this connection to the DOM event manager. 
	//
	// example:
	//		When obj.onchange(), do ui.update():
	//	|	$e.connect(obj, "onchange", ui, "update");
	//	|	$e.connect(obj, "onchange", ui, ui.update); // same
	//
	// example:
	//		Using return value for disconnect:
	//	|	var link = $e.connect(obj, "onchange", ui, "update");
	//	|	...
	//	|	$e.disconnect(link);
	//
	// example:
	//		When onglobalevent executes, watcher.handler is invoked:
	//	|	$e.connect(null, "onglobalevent", watcher, "handler");
	//
	// example:
	//		When ob.onCustomEvent executes, customEventHandler is invoked:
	//	|	$e.connect(ob, "onCustomEvent", null, "customEventHandler");
	//	|	$e.connect(ob, "onCustomEvent", "customEventHandler"); // same
	//
	// example:
	//		When ob.onCustomEvent executes, customEventHandler is invoked
	//		with the same scope (this):
	//	|	$e.connect(ob, "onCustomEvent", null, customEventHandler);
	//	|	$e.connect(ob, "onCustomEvent", customEventHandler); // same
	//
	// example:
	//		When globalEvent executes, globalHandler is invoked
	//		with the same scope (this):
	//	|	$e.connect(null, "globalEvent", null, globalHandler);
	//	|	$e.connect("globalEvent", globalHandler); // same

	// normalize arguments
	var a=arguments, args=[], i=0;
	// if a[0] is a String, obj was ommited
	args.push((typeof(a[0])=="string") ? null : a[i++], a[i++]);
	// if the arg-after-next is a String or Function, context was NOT omitted
	var a1 = a[i+1];
	args.push((typeof(a1)=="string")||jQuery.isFunction(a1) ? a[i++] : null, a[i++]);
	// absorb any additional arguments
	for(var l=a.length; i<l; i++){	args.push(a[i]); }
	// do the actual work
	return $e._connect.apply(this, args); /*Handle*/
}

// used by non-browser hostenvs. always overriden by event.js
$e._connect = function(obj, event, context, method){
	var l=$e._listener, h=l.add(obj, event, $e.hitch(context, method)); 
	return [obj, event, h, l]; // Handle
}

$e.disconnect = function(/*Handle*/ handle){
	// summary:
	//		Remove a link created by $e.connect.
	// description:
	//		Removes the connection between event and the method referenced by handle.
	// handle:
	//		the return value of the $e.connect call that created the connection.
	if(handle && handle[0] !== undefined){
		$e._disconnect.apply(this, handle);
		// let's not keep this reference
		delete handle[0];
	}
}

$e._disconnect = function(obj, event, handle, listener){
	listener.remove(obj, event, handle);
}