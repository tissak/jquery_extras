/* make sure we have a conf variable to work with */
if(typeof($wConf) == "undefined" ){ $wConf = {}; }

/* setup wConf */
(function(){
  var found = null;
  $("script").each(function(index,item){ if(item.src.indexOf("extras") >0){ found = item}})
  if(found){     
    $wConf.basePath = ($wConf.basePath) ? $wConf.basePath : found.src.replace("jquery_extras.js","");
    $wConf.templateBasePath = ($wConf.templateBasePath) ? $wConf.templateBasePath : ($wConf.basePath + "/widgets");
    var pOnLoad = found.getAttribute("parseOnLoad");
    $wConf.parseOnLoad = ($wConf.parseOnLoad) ? $wConf.parseOnLoad : (pOnLoad=="true");
  }
})()

/* - class inheritance - */
if(typeof(console)=="undefined"){
  //if no firebug log to null
  console = { log:function(){}, error:function(){}}
}

/* - $e = jQuery extension - */

(function(){
  var subscriptions = [];
  $e = {
    /* X,Y pair for all widgets to access current mouse position*/
    mouseX:0,
    mouseY:0,    
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
        console.error("Issue getting object: "+name)
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
  
  /* a non widget base we can build from */
  $e.base = {}

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
    }

    this.addCallback = function(func){ 
      if(this.fired == 0){
        //if we have already succeeded, immediately fire
        func.apply(window, this.result);
      }else{
        this.chain.push(func); 
      }
    }
    this.addErrback = function(func){ 
      this.check();
      this.err.push(func); 
    }
    this.addBoth = function(success, fail){
      this.check();
      this.chain.push(success);
      this.err.push(fail);
    }
    this.errback = function(){
      this.check();
      console.error("Error from deferred")
      this.fired = 1;
      jQuery.each(this.err, function(index,item){
        item.call();   
      })
    }
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
          })
          this.fired = 0;
          this.isFiring = false;
        }
      } catch(e){
        console.error("Error executing deferred callbacks")
        this.error();
      }
    }
  }

})();


/* -$w = jQuery Widget - */  

(function(){
  /* setup a base path for us to load widget templates*/  
  if($wConf["templateBasePath"] == null){
    console.log("no preset base path")
    var jqextrasInclude =  $("script").map(function(index,item){ if(item.src.indexOf("jqextras")>0){ return item; }})
    if(jqextrasInclude.length > 0 ){
      var src = jqextrasInclude[0].src;
      $wConf["templateBasePath"] = src.replace("jqextras.js","templates/");
    }    
  }

  $w = {
    _guid_counter:0,
    _index:{},
    all:[],
    prefetch: false,
    templateCache: {},
    _getUID: function(){
      return "_widget_"+this._guid_counter++;
    },
    byId: function(id){
      return this._index[id];
    },
    parse: function(rootNode){
      if(!rootNode){ rootNode = window.document; }
      var widgets = $(rootNode).find("[widgetType]");
      widgets.each(function(index, node){
        var type = node.getAttribute("widgetType");
        try{        
          var clss = $e.getObject(type);
          new clss(node);      
        } catch(e){
          console.error("failed to render widget type: "+type);
          console.error(e);
        }
      })
      this.parseComplete();
    },
    reset: function(){
      jQuery.each(this.all, function(index,item){ item.destroy(); });
      this.all = [];
      this._index = {};
    },
    parseComplete:function(){
      //event stub
    },
    register: function(widget){
      this.all.push(widget);
      var id = widget.id;
      if(this._index[id]){ throw "Widget already exists with id "+id; }
      this._index[id] = widget;
    }
  }
  
  /* The core lifecycle of a widget */
  $e.declare(
    "$w.lifeCycle",
    null,
    {      
    create: function(){
      this.propMixin();
      this.render();
      this.postCreate();
      this.startup();
      $w.register(this);
      this.ready();      
    },
    destroy: function(){
      $(this.domNode).remove();
    },
    propMixin: function(){},
    render: function(){},
    postCreate: function(){},
    startup: function(){},
    ready: function(){}
  });
})();

/* The base widget from which all widgets should extend */
$e.declare(
  "$w.Widget",
  $w.lifeCycle,
  {
    domNode: null,
    props: {},
    widgetType: "",
    /* 
      callable as: 
        domNode, ?props - use domNode to build from
        null, ?props - build a new instance outside of the page
      
    */
    constructor: function(domNode, props){
      /* initial setup */
      this.domNode = domNode;
      this.props = props;
      this.widgetType = this._className_;
      /* life cycle start */
      this.create();    
    },
  
    propMixin: function(){
      if(this.domNode){ 
        this.id = this.domNode.getAttribute("id");
        /*mixin values from the node*/
        var attributes = this.domNode.attributes;
        var props = {};
        var self = this;
        jQuery.each(attributes, function(index, item){
          self[item.name] = item.value;
        });
      }
      $e.mixin(this, this.props);    
      if(this.id == null){ this.id = $w._getUID(); }
      /*mix in props from node*/    
    },
  
    /* Return a jQuery object wrapping our domNode. Shorthand for chaining */
    $:function(){
      return $(this.domNode);
    },
    
    /* Helps set the scope for connecting internal dom nodes to event functions */
    /* TODO - look at using proxy instead */
    bind: function(node, event, func){
      $(node).bind(event, $e.hitch(this, func));
    },

    _mapAttribute: function(){},
    
    /* mimic std dom attr method */
    /*
      start by tring to map the attr call to an internall accessor method accessor<Name>.
      - if that is found use it.
      next use the argument number to determine if it's a getter / setter.
      - in either case, first attempt to use the native node getter / setter.
    */
    attr: function(){
      if(arguments.length>=1){
        // try to use an accessor method.
        var name = "accessor"+$e._capitalise(arguments[0]);
        if(typeof(this[name]) == "function"){ 
          var args = Array.prototype.slice.apply(arguments,[1,arguments.length])
          return this[name].apply(this, args);
        }
        
        // try a native attribute
        var attrib = typeof(this[arguments[0]])
        if((attrib != "undefined")&&(attrib != "function")){
          if(arguments.length==1){ return this[arguments[0]]; }
          if(arguments.length==2){ 
            this[arguments[0]] = arguments[1];
            return arguments[1];
          }
        }
      }
      // split out to getter if one value.
      if(arguments.length==1){ return this._getter(arguments[0]); }
      // split out to setter if two values.
      if(arguments.length==2){ return this._setter(arguments[0],arguments[1]); }
    },
      
    _setter: function(name, val){
      // try the node first. if it exists then update it.
      var nodeVal = this.$().attr(name);
      if(nodeVal != null){ return this.$().attr(name, val); }      
      // try using the map attribute method next.
      var attributeFunc = this._mapAttribute(name)
      if(attributeFunc){ return attributeFunc.apply(this,[val]); }
      // if still not succeeded default to pushing onto the node.
      return this.$().attr(name, val);
    },
    
    _getter: function(name){
      // default to the node value
      var nodeVal =this.$().attr(name);
      if(nodeVal != null){ return nodeVal; }
      
      // fall back to trying the mapped method
      var attributeFunc = this._mapAttribute(name)
      if(attributeFunc){ return attributeFunc.apply(this,[]); }
      
      // return null if all else fails
      return null;
    }
  }
);

/* The base templated widget from which all widgets that use a template should extend */
$e.declare(
  "$w.Templated", 
  $w.Widget,
  {
    template: "",  
    /* insert template handling into the lifecycle */
    create: function(){
      if(this._fetchTemplate()){
        this.inherited(arguments)
      }
    },
    /* set the template and recall create with template established */
    _setTemplate: function(data){    
      this.template = data;
      $w.templateCache[this.templatePath] = data;
      this.create();
    },
    /* get a remote template if necessary */
    _fetchTemplate: function(){
      if(this.template){ return true; }
      if(this.templatePath){
        if($w.templateCache[this.templatePath]!=null){
          this.template = $w.templateCache[this.templatePath];
          return true;
        }
        // force sync mode as async means unpredictable behvior for widgets expecting this widget to be done
        $.ajax({
          url: this.templatePath,
          async: false,
          success: $e.hitch(this,this._setTemplate)
        })
        return false;
      } else {
        return true;
      }
    },
    destroy: function(){
      this.inherited(arguments);
      $(this.domNode).replaceWith(this.originalNode);
    },
    render: function(){    
      var renderedTemplate = $($e.string.substitute(this.template, this)); 
      if(this.domNode!=null){   
        //if we have a page level node, swap in the template.
        this.originalNode = this.domNode;
        $(this.domNode).replaceWith(renderedTemplate)    
      }
      this.domNode = renderedTemplate[0];
      this.domNode.setAttribute("id",this.id);
      var self = this;
      /* connect up any attach points into the widget */
      $(this.domNode).find("[attachpoint]").each(function(index,node){
        var point = node.getAttribute("attachpoint");
        self[point] = node;      
      })
      // if the main domnode has a connect then attach it
      if(this.domNode.getAttribute("attachpoint") != null){
        var point = this.domNode.getAttribute("attachpoint") 
        self[point] = this.domNode;
      }
    }
  }
);

/* Just like a templated widget only it doesn't mess with a page node. */
$e.declare(
  "$w.SubTemplate",
  $w.Templated,
  {
    template: "",
    render: function(){    
      var renderedTemplate = $($e.string.substitute(this.template, this)); 
      if(this.domNode != null){
        this.originalNode = this.domNode;
      }
      this.domNode = renderedTemplate[0];
      this.domNode.setAttribute("id",this.id);
      var self = this;
      /* connect up any attach points into the widget */
      $(this.domNode).find("[attachpoint]").each(function(index,node){
        var point = node.getAttribute("attachpoint");
        self[point] = node;      
      })
      // if the main domnode has a connect then attach it
      if(this.domNode.getAttribute("attachpoint") != null){
        var point = this.domNode.getAttribute("attachpoint") 
        self[point] = this.domNode;
      }
    }
  }
)

/* provides a widget wrapper to more traditional jquery code. */
$e.declare(
  "$w.Modifier",
  $w.Widget,
  {
    id: "",
    domNode:null,
    //reduced lifecycle for modifiers
    create: function(){
      this.propMixin();
      this.applyModifier();
      $w.register(this);
      this.ready();      
    },
    // stub for overriding
    applyModifier: function(){}
  }
)

$e.codeLoaded = function(){
  $e._codeLoaded = true;
  if($e._documentLoaded){ $w.parse(); }
}
$e.documentLoaded = function(){
  $e._documentLoaded = true;
  if($e._codeLoaded){ $w.parse(); }
}
  
$(document).ready(function(){    
  var parseIfSet = function(){
    if((typeof($wConf)!="undefined")&&($wConf.parseOnLoad)){$w.parse();}    
  }
  if($e._requirePaths.length>0){
    $LAB.script($e._requirePaths).wait(function(){ 
      parseIfSet();
    })
  } else {
    parseIfSet();
  }  
  $e.trackMouse();
});