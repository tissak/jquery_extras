/* make sure we have a conf variable to work with */
if(typeof($wConf) == "undefined" ){ $wConf = {}; }


/* - class inheritance - */
if(typeof(console)=="undefined"){
  //if no firebug log to null
  console = { log:function(){}, error:function(){}}
}

// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_inherited\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _inherited = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _inherited[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._inherited;
           
            // Add a new ._inherited() method that is the same method
            // but on the super-class
            this._inherited = _inherited[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._inherited = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

/* - $e = jQuery extension - */

(function(){
  var subscriptions = [];
  $e = {
    /* X,Y pair for all widgets to access current mouse position*/
    mouseX:0,
    mouseY:0,
    /* moves b content into a*/
    mixin: function(a,b){
      jQuery.extend(a,b);
      return a
    },
    declare: function(name, parent, methods){
      if((!parent)||(typeof(parent.extend) == "undefined")){ throw "Parent class not extendable in declaration in "+name; }
      if(!name||name==""){ throw "Missing name in declaration"; }
      if(!methods){methods = {}}
      //parts of our namespace
      var parts = name.split(".")
      //pull of the class target
      var target = parts.pop();
      //make sure the full object branch is declared
      var branch = $e.setObjectBranch(parts.join("."))
      //append the target class to its definition on the branch.
      methods["_className_"] = name;
      branch[target] = parent.extend(methods);
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
  
  /* a non widget base we can build from */
  $e.base = Class.extend({});

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
  $w.lifeCycle = Class.extend({
    create: function(){
      this.propMixin();
      this.render();
      this.postCreate();
      this.startup();
      this.ready();
      $w.register(this);
    },
    destroy: function(){},
    propMixin: function(){},
    render: function(){},
    postCreate: function(){},
    startup: function(){},
    ready: function(){}
  })
})();

/* The base widget from which all widgets should extend */
$w.Widget = $w.lifeCycle.extend({
  domNode: null,
  props: {},
  widgetType: "",
  /* 
    callable as: 
      domNode, ?props - use domNode to build from
      null, ?props - build a new instance outside of the page
      
  */
  init: function(domNode, props){
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
  bind: function(node, event, func){
    $(node).bind(event, $e.hitch(this, func));
  }
})

/* The base templated widget from which all widgets that use a template should extend */
$w.Templated = $w.Widget.extend({
  template: "",  
  /* insert template handling into the lifecycle */
  create: function(){
    if(this._fetchTemplate()){
      this._inherited()
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
    $(this.domNode).replaceWith(this.originalNode);
  },
  render: function(){    
    var renderedTemplate = $($e.string.substitute(this.template, this)); 
    if(this.domNode){   
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
})

/* Just like a templated widget only it doesn't mess with a page node. */
$w.SubTemplate = $w.Templated.extend({
  template: "",
  render: function(){    
    var renderedTemplate = $($e.string.substitute(this.template, this)); 
    this.originalNode = this.domNode;
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
})


$(document).ready(function(){
  if((typeof($wConf)!="undefined")&&($wConf.parseOnLoad)){
    $w.parse();
  }
  $e.trackMouse();
});