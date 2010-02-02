/* make sure we have a conf variable to work with */
if(typeof($wConf) == "undefined" ){ window["$wConf"] = {}; }

/* if no firebug log to null */
if(typeof(console)=="undefined"){ window["console"] = { log:function(){}, error:function(){}, warn:function(){}}}

(function(){
  /* setup wConf */
  var found = null;
  $("script").each(function(index,item){ if(item.src.indexOf("extend") >0){ found = item}});

  if(found){
    $wConf.basePath = ($wConf.basePath) ? $wConf.basePath : found.src.replace("extend.js","");
    $wConf.templateBasePath = ($wConf.templateBasePath) ? $wConf.templateBasePath : ($wConf.basePath + "/widgets");
    $wConf.parseOnLoad = ($wConf.parseOnLoad) ? $wConf.parseOnLoad : (found.getAttribute("parseOnLoad")=="true");
  }

  var subscriptions = [];
  $e = {
    /* X,Y pair for all widgets to access current mouse position*/
    mouse: {x:0, y:0},
    basePath: $wConf.basePath,
    templateBasePath: $wConf.templateBasePath,
    _requirePaths: [],
    require: function(){
      var paths = [];
      var bpath = this.basePath;
      jQuery.each(arguments,function(index, item){
        paths.push(bpath + item.replace(".","/") + ".js");
      });
      this._requirePaths = this._requirePaths.concat(paths);
    },
    /* moves b content into a*/
    mixin: function(a,b){
      jQuery.extend(a,b);
      return a
    },
    extend: function(/*Object*/ constructor, /*Object...*/ props){
    	// summary:
    	//		Adds all properties and methods of props to constructor's
    	//		prototype, making them available to all instances created with
    	//		constructor.
    	for(var i=1, l=arguments.length; i<l; i++){
    		$e.mixin(constructor.prototype, arguments[i]);
    	}
    	return constructor; // Object
    },


    _capitalise: function(word){
      var letter = word.slice(0,1);
      var remainder = word.slice(1,word.length);
      return (letter.toUpperCase() + remainder);
    },

    setObject: function(name, obj){
      var parts = name.split(".");
      //pull of the class target
      var target = parts.pop();
      //make sure the full object branch is declared
      if(parts.length>0){
        var branch = $e.setObjectBranch(parts.join("."));
        branch[target] = obj;
        return branch[target];
      } else {
        window[target] = obj;
        return window[target];
      }

    },
    string: {
      /* In the string |template| replace instances of ${name} with the <name> value from the object |valuesHash| */
      substitute: function(template, valuesHash){
        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
          function(match, key, format){
          return valuesHash[key]
        });
      }
    },
    setObjectBranch: function(name){
      var parts = name.split(".");
      var scope = window;
      if(parts.length>=1){
        parts.reverse();
        while(parts.length >0){
          var item = parts.pop();
          if(!scope[item]){
            scope[item] = {};
          }
          scope = scope[item];
        }
      }
      return scope;
    },
    /* return a function that will execute |func| in the scope of |obj| */
    // or
    /* return a function that will execute obj.func in the scope of obj if func is a string */
    hitch: function(obj, func){
      if(jQuery.isFunction(func)){
        return function(){
          return func.apply(obj, arguments)
        }
      } else {
        return function(){
          return obj[func].apply(obj, arguments)
        }
      }
    },
    getObject: function(name, scope){
      if(!scope){ scope = window}
      var parts = name.split(".");
      parts.reverse();
      try{
        while(parts.length>0){
          scope = scope[parts.pop()];
        }
      }catch(e){
        console.error("Issue getting object: "+name);
        throw "object not found"
      }
      return scope
    },
    pub: function(channel, args){
      var listeners = subscriptions[channel];
      if(listeners){
        jQuery.each(listeners,function(index, item){
          item.apply(window, args);
        })
      }
    },
    sub: function(channel, callback){
      if(!subscriptions[channel]){ subscriptions[channel] = []; }
      subscriptions[channel].push(callback);
    },
    trackMouse: function(){
      $(window).bind("mousemove",function(e){
        $e.mouseX = e.pageX;
        $e.mouseY = e.pageY;
      });
    }
  }

  $e.delegate = $e._delegate = (function(){
  	// boodman/crockford delegation w/ cornford optimization
  	function TMP(){}
  	return function(obj, props){
  		TMP.prototype = obj;
  		var tmp = new TMP();
  		TMP.prototype = null;
  		if(props){
  			$e.mixin(tmp, props);
  		}
  		return tmp; // Object
  	}
  })();


  $e.declare = function(/*String*/ className, /*Function|Function[]*/ superclass, /*Object*/ props){
  	var dd = arguments.callee, mixins;
  	if(jQuery.isArray(superclass)){
  		mixins = superclass;
  		superclass = mixins.shift();
  	}
  	// construct intermediate classes for mixins
  	if(mixins){
  		jQuery.each(mixins, function(i, m){
  			if(!m){ throw(className + ": mixin #" + i + " is null"); } // It's likely a required module is not loaded
  			superclass = dd._delegate(superclass, m);
  		});
  	}
  	// create constructor
  	var ctor = dd._delegate(superclass);
  	// extend with "props"
  	props = props || {};
  	ctor.extend(props);
  	// more prototype decoration
  	$e.extend(ctor, { declaredClass: className, _constructor: props.constructor/*, preamble: null*/ });
  	// special help for IE
  	ctor.prototype.constructor = ctor;
  	// create named reference
  	return $e.setObject(className, ctor);
  };

  $e.mixin($e.declare, {
  	_delegate: function(base, mixin){
  		var bp = (base || 0).prototype, mp = (mixin || 0).prototype, dd = $e.declare;
  		// fresh constructor, fresh prototype
  		var ctor = dd._makeCtor();
  		// cache ancestry
  		$e.mixin(ctor, { superclass: bp, mixin: mp, extend: dd._extend });
  		// chain prototypes
  		if(base){ ctor.prototype = $e._delegate(bp); }
  		// add mixin and core
  		$e.extend(ctor, dd._core, mp || 0, { _constructor: null, preamble: null });
  		// special help for IE
  		ctor.prototype.constructor = ctor;
  		// name this class for debugging
  		ctor.prototype.declaredClass = (bp || 0).declaredClass + '_' + (mp || 0).declaredClass;
  		return ctor;
  	},
  	_extend: function(props){
  		var i, fn;
  		for(i in props){ if(jQuery.isFunction(fn=props[i]) && !0[i]){fn.nom=i;fn.ctor=this;} }
  		$e.extend(this, props);
  	},
  	_makeCtor: function(){
  		// we have to make a function, but don't want to close over anything
  		return function(){ this._construct(arguments); };
  	},
  	_core: {
  		_construct: function(args){
  			var c = args.callee, s = c.superclass, ct = s && s.constructor,
  				m = c.mixin, mct = m && m.constructor, a = args, ii, fn;
  			// side-effect of = used on purpose here, lint may complain, don't try this at home
  			if(a[0]){
  				// FIXME: preambles for each mixin should be allowed
  				// FIXME:
  				//		should we allow the preamble here NOT to modify the
  				//		default args, but instead to act on each mixin
  				//		independently of the class instance being constructed
  				//		(for impedence matching)?

  				// allow any first argument w/ a "preamble" property to act as a
  				// class preamble (not exclusive of the prototype preamble)
  				if(/*dojo.isFunction*/((fn = a[0].preamble))){
  					a = fn.apply(this, a) || a;
  				}
  			}
  			// prototype preamble
  			if((fn = c.prototype.preamble)){ a = fn.apply(this, a) || a; }
  			// FIXME:
  			//		need to provide an optional prototype-settable
  			//		"_explicitSuper" property which disables this
  			// initialize superclass
  			if(ct && ct.apply){ ct.apply(this, a); }
  			// initialize mixin
  			if(mct && mct.apply){ mct.apply(this, a); }
  			// initialize self
  			if((ii = c.prototype._constructor)){ ii.apply(this, args); }
  			// post construction
  			if(this.constructor.prototype == c.prototype && (ct = this.postscript)){ ct.apply(this, args); }
  		},
  		_findMixin: function(mixin){
  			var c = this.constructor, p, m;
  			while(c){
  				p = c.superclass;
  				m = c.mixin;
  				if(m == mixin || (m instanceof mixin.constructor)){ return p; }
  				if(m && m._findMixin && (m = m._findMixin(mixin))){ return m; }
  				c = p && p.constructor;
  			}
  		},
  		_findMethod: function(name, method, ptype, has){
  			// consciously trading readability for bytes and speed in this low-level method
  			var p=ptype, c, m, f;
  			do{
  				c = p.constructor;
  				m = c.mixin;
  				// find method by name in our mixin ancestor
  				if(m && (m = this._findMethod(name, method, m, has))){ return m; }
  				// if we found a named method that either exactly-is or exactly-is-not 'method'
  				if((f = p[name]) && (has == (f == method))){ return p; }
  				// ascend chain
  				p = c.superclass;
  			}while(p);
  			// if we couldn't find an ancestor in our primary chain, try a mixin chain
  			return !has && (p = this._findMixin(ptype)) && this._findMethod(name, method, p, has);
  		},
  		inherited: function(name, args, newArgs){
  			// summary:
  			//		Call an inherited member function of this declared class.
  			//
  			// description:
  			//		Call an inherited member function of this declared class, allowing advanced
  			//		manipulation of passed arguments to inherited functions.
  			//		Explicitly cannot handle the case of intending to pass no `newArgs`, though
  			//		hoping the use in conjuction with `dojo.hitch`. Calling an inherited
  			//		function directly via hitch() is not supported.
  			//
  			// name: String?
  			//		The name of the method to call. If omitted, the special `arguments` passed is
  			//		used to determine the inherited function. All subsequent positional arguments
  			//		are shifted left if `name` has been omitted. (eg: args becomes name)
  			//
  			// args: Object
  			//		An `arguments` object to pass along to the inherited function. Can be in the
  			//		`name` position if `name` has been omitted. This is a literal JavaScript `arguments`
  			//		object, and must be passed.
  			//
  			// newArgs: Array?
  			//		An Array of argument values to pass to the inherited function. If omitted,
  			//		the original arguments are passed (determined from the `args` variable)
  			//
  			// example:
  			//		Simply call an inherited function with the same signature.
  			//	|	this.inherited(arguments);
  			// example:
  			//		Call an inherited method, replacing the arguments passed with "replacement" and "args"
  			//	|	this.inherited(arguments, [replacement, args]);
  			// example:
  			//		Call an inherited method, passing an explicit name.
  			//	|	this.inherited("method", arguments);
  			// example:
  			//		Call an inherited method by name, replacing the arguments:
  			//	|	this.inherited("method", arguments, [replacement, args]);

  			var a = arguments;
  			// some magic crap that alters `arguments` to shift in the case of missing `name`
  			if(typeof a[0] != "string"){ // inline'd type check
  				newArgs = args;
  				args = name;
  				name = args.callee.nom;
  			}
  			a = newArgs || args; // WARNING: hitch()ed functions may pass a newArgs you aren't expecting.
  			var c = args.callee, p = this.constructor.prototype, fn, mp;
  			// if not an instance override
  			if(this[name] != c || p[name] == c){
  				// start from memoized prototype, or
  				// find a prototype that has property 'name' == 'c'
  				mp = (c.ctor || 0).superclass || this._findMethod(name, c, p, true);
  				if(!mp){ throw(this.declaredClass + ': inherited method "' + name + '" mismatch'); }
  				// find a prototype that has property 'name' != 'c'
  				p = this._findMethod(name, c, mp, false);
  			}
  			// we expect 'name' to be in prototype 'p'
  			fn = p && p[name];
  			if(!fn){ throw( mp.declaredClass + ': inherited method "' + name + '" not found'); }
  			// if the function exists, invoke it in our scope
  			return fn.apply(this, a);
  		}
  	}
  });

  /* - $e.Deferred = The deferred class for delayed processing - */
  $e.Deferred = function(){
    this.chain = [];
    this.err = [];
    this.fired = -1;
    this.result = null;
    this.isFiring = false;
    this.check = function(){
      if(this.fired != -1){
        throw "Already fired!";
      }
      if(this.fired == 1){
        console.log("Error was fired");
      }
    };

    this.addCallback = function(func){
      if(this.fired == 0){
        //if we have already succeeded, immediately fire
        func.apply(window, this.result);
      }else{
        this.chain.push(func);
      }
    };

    this.addErrback = function(func){
      this.check();
      this.err.push(func);
    };

    this.addBoth = function(success, fail){
      this.check();
      this.chain.push(success);
      this.err.push(fail);
    };

    this.errback = function(){
      this.check();
      console.error("Error from deferred");
      this.fired = 1;
      jQuery.each(this.err, function(index,item){
        item.call();
      })
    };
    this.callback = function(val){
      if(this.isFiring){ return; }
      this.check();
      try{
        if(val){
          this.isFiring = true;
          this.result = arguments;
          var args = arguments;
          jQuery.each(this.chain, function(index,item){
            item.apply(window, args);
          });
          this.fired = 0;
          this.isFiring = false;
        }
      } catch(e){
        console.error("Error executing deferred callbacks")
        this.error();
      }
    };
  }
})();

$e.codeLoaded = new $e.Deferred();
$(document).ready(function(){
  if($e._requirePaths.length>0){
    $LAB.script($e._requirePaths).wait(function(){
      $e.codeLoaded.callback(true);
    });
  } else {
    $e.codeLoaded.callback(true);
  }

  $e.trackMouse();  
});