/* The message dialog instance that will be shared by all message dialogs */
$e.declare("widgets._Dialog",
  widgets.ContentPane,
  {
    template: null,
    templatePath:'dialog.html',
    //handles
    closeButton: null,
    titleBar: null,
    contentSpace: null,
    loaded: false,
    postCreate: function(){
      //this._inherited(arguments);
      this.bind(this.close, "click", this.hide);
      $(this.domNode).hide();
      this.bind(window, "resize", this.position);
      document.body.appendChild(this.domNode);
    },
    onLoad: function(){this.position();},
    setup: function(title, content, href){
      if(title){this.setTitle(title);}
      //href always takes priority over any content
      if(href){
        this.href = href;
      } else {
        if(content){this.setContent(content);}
      }
      
      this.show();
    },
    show: function(){
      if((this.href!="")&&(!this.loaded)){
        this.contentSpace.innerHTML = "Loading...";
        this.setHref(this.href);
        this.loaded = true;
      }
      this.position();
      this.getBlayer().style.display = "";
      $(this.domNode).fadeIn();
    },
    hide: function(){
      this.getBlayer().style.display="none";
      $(this.domNode).fadeOut();
    },
    position: function(){
      var dHeight = dWidth = 0;
      var vHeight = vWidth = 0;
      var n = $(this.domNode);
      dHeight = n.height();
      dWidth = n.width();
      var v = $(window);
      vHeight = v.height();
      vWidth = v.width();
      var top =  (dHeight>vHeight) ? 0 : ((vHeight - dHeight)/2);
      var left = (dWidth>vWidth) ? 0 : ((vWidth - dWidth)/2);
      $(this.domNode).css({left:left, top:top});
    },
    getBlayer: function(){
      if(this.blayer==null){
        this._blockingLayer();
        this.bind(this.blayer, "click", this.hide);
      }
      return this.blayer;
    },
    _blockingLayer: function(){
      this.blayer = $("<div class='blockingLayer'>&nbsp;</div>")[0];
      document.body.appendChild(this.blayer);
    },
    setContent: function(content){
      this.contentSpace.innerHTML = content;
    },
    setTitle: function(title){
      this.title.innerHTML = title;
    }
  }
)

/* The widget that provides an interface to the common shared dialog. */
$e.declare(
  "widgets.Dialog",
  $w.Widget,
  {
    dialog: null,
    content:"",
    title:"",
    postCreate:function(){
      this._inherited(arguments);
      this.content = this.domNode.innerHTML;
      this.title = this.domNode.title;
      this.domNode.style.display="none";
      console.log(this.domNode.innerHTML);
    },
    getDialog: function(){
      if(this.dialog == null){
        //create an instance to share
        this.dialog = new widgets._Dialog($("<div></div>")[0]);
      }
      return this.dialog;
    },
    setContent: function(content){
      this.content = content;      
    },
    setTitle: function(title){
      this.title = title;
    },
    show: function(){
      this.getDialog().setup(this.title, this.content, this.href);
    },
    hide: function(){
      this.getDialog().hide();
    }
  }
)
/* This message dialog creates its own instance. */
$e.declare("widgets.StandaloneMessage",
  widgets.ContentPane,
  {
    template: null,
    templatePath:'dialog.html',
    //areas    
    title: null,
    content: null,
    //handles
    closeButton: null,
    titleBar: null,
    contentSpace: null,
    loaded: false,
    clickAnywhereClose: true,
    postCreate: function(){
      //this._inherited(arguments);
      this.setContent(this.originalNode.innerHTML);
      this.bind(this.close, "click", this.hide);      
      this.domNode.style.display="none";
      this.bind(window, "resize", this.position);
      document.body.appendChild(this.domNode);
    },
    onLoad:function(){this.position();},
    show: function(){
      if((this.href!="")&&(!this.loaded)){
        this.contentSpace.innerHTML = "Loading...";
        this.setHref(this.href);
        this.loaded = true;
      }
      this.position();
      this.getBlayer().style.display = "";
      $(this.domNode).fadeIn();
    },
    hide: function(){
      this.getBlayer().style.display="none";
      $(this.domNode).fadeOut();
    },
    position: function(){
      var dHeight = dWidth = 0;
      var vHeight = vWidth = 0;
      var n = $(this.domNode);
      dHeight = n.height();
      dWidth = n.width();
      var v = $(window);
      vHeight = v.height();
      vWidth = v.width();
      
      var top =  (dHeight>vHeight) ? 0 : ((vHeight - dHeight)/2);
      var left = (dWidth>vWidth) ? 0 : ((vWidth - dWidth)/2);
      this.domNode.style.left = left + "px";
      this.domNode.style.top = top + "px";
    },
    getBlayer: function(){
      if(this.blayer==null){
        this._blockingLayer();
        if(this.clickAnywhereClose){
          this.bind(this.blayer, "click.dialog", this.hide);
        }
      }
      return this.blayer;
    },
    _blockingLayer: function(){
      this.blayer = $("<div class='blockingLayer'>&nbsp;</div>")[0];
      document.body.appendChild(this.blayer);
    },
    setContent: function(content){
      this.content = content;
      this.contentSpace.innerHTML = this.content;
    }
  }
)

$e.declare(
  "widgets.ModalDialog",
  widgets.StandaloneMessage,
  {
    clickAnywhereClose: true,
    postCreate: function(){
      this._inherited(arguments);
      this.bind(this.titlebar, "mousedown", this.startDrag);
      $(this.blayer).unbind("click.dialog");
    },
    startDrag: function(){
      console.log('start');
      var pos = this.$().position();
      this.diff = [($e.mouseX-pos.left), ($e.mouseY-pos.top)];
      $(window).bind("mouseup.dialog", $e.hitch(this, this.endDrag));
      $(window).bind("mousemove.dialog", $e.hitch(this, this.move));
    },
    endDrag: function(){
      console.log('stop');
      $(window).unbind("mouseup.dialog");
      $(window).unbind("mousemove.dialog");
    },
    move: function(){
        var left = $e.mouseX - this.diff[0];
        var top = $e.mouseY - this.diff[1];
        $(this.domNode).css({left: left, top: top});
    }   
  }
)