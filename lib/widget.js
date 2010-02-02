/* -$w = jQuery Widget - */
(function(){
  /* setup a base path for us to load widget templates*/
  if($wConf["templateBasePath"] == null){
    console.log("no preset base path");
    var jqextrasInclude =  $("script").map(function(index,item){ if(item.src.indexOf("jqextras")>0){ return item; }});
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
      });
      this.parseComplete();
    },
    reset: function(){
      jQuery.each(this.all, function(index,item){ item.destroy(); });
      this.all = [];
      this._index = {};
    },
    register: function(widget){
      this.all.push(widget);
      var id = widget.id;
      if(this._index[id]){ throw "Widget already exists with id "+id; }
      this._index[id] = widget;
    },
    parseComplete:function(){ /*event stub*/ }
  }
})();

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
          var args = Array.prototype.slice.apply(arguments,[1,arguments.length]);
          return this[name].apply(this, args);
        }

        // try a native attribute
        var attrib = typeof(this[arguments[0]]);
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
      var attributeFunc = this._mapAttribute(name);
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
        });
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
      });
      // if the main domnode has a connect then attach it
      if(this.domNode.getAttribute("attachpoint") != null){
        var point = this.domNode.getAttribute("attachpoint");
        self[point] = this.domNode;
      }
    }
  }
);

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
);

$e.codeLoaded.addCallback(function(){
  if((typeof($wConf)!="undefined")&&($wConf.parseOnLoad)){
    $w.parse();
  }
});
