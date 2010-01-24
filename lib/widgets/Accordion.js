$e.declare(
  "widgets.Accordion",
  $w.Templated,
  {
    template: "<div class='accordion'></div>",
    panels: null,
    multiOpen: false,
    paddingBottom: 10,
    postCreate: function(){
      this.panels = [];
      var source = this.originalNode;
      var panels = $(source).find("div");
      var self = this;
      panels.each(function(index, node){
        self._addPanel(node);
      })
      this._draw();
    },
    _addPanel: function(node){
      this.panels.push(new widgets.Panel(node,{parent: this}));
    },
    _draw: function(){
      var maxHeight = 0;
      var titles = 0;
      jQuery.each(this.panels, function(index, item){
        if(item.height > maxHeight){
          maxHeight = item.height;
        };
        titles += item.titleHeight;
      })
      this.maxHeight = maxHeight;
      var currentHeight = $(this.domNode).height();
      this.domNode.style.height =  this.paddingBottom + titles + maxHeight + "px";
    },
    selecting: function(id){
    	if(!this.multiOpen){
	      var self = this;
   	   jQuery.each(this.panels, function(index,item){
     	   if(item.id != id){
     	     item.hidePanel()
     	   }
     	 })
      }
    }
  }
)


$e.declare(
  "widgets.Panel",
  $w.SubTemplate,
  {
    title:"",
    content:"",
    parent: null,
    contentSpace: null,
    _showing:false,
    selected: false,
    speed:300,
    height:'',
    titleHeight:'',
    template: "<div class='panel'><div class='title' attachpoint='title'>${title}</div><div attachpoint='expander'><div class='panelContent' attachpoint='contentSpace'></div></div></div>",
    postCreate: function(){
      this.setContent(this.originalNode.innerHTML);
      this.bind(this.title,'click',this.showPanel);
      this.parent.domNode.appendChild(this.domNode);
      this.height = $(this.expander).outerHeight();
      this.titleHeight = $(this.domNode).outerHeight() - this.height;
      console.log("content height: " + this.height + " title height: "+ this.titleHeight);
      if(!this.selected){
        this.contentSpace.style.display="none";
      } else {
        //starting visible so setup the expander and flags.
        this._showing = true;
        this.expander.style.height = this.height+"px";
      }
    }, 
    setContent: function(content){
      this.contentSpace.innerHTML = content;
    },
    togglePanel: function(){
      if(this._showing){ 
        this.hidePanel(); 
      } else {
        this.showPanel();
      }
    },
    hidePanel: function(){
      this.contentSpace.style.display="none";
      $(this.expander).animate({height: 1}, this.speed)
      this._showing = false;
    },
    showPanel: function(){
    	this.parent.selecting(this.id);
      var self = this;
      $(this.expander).animate({height: this.height}, this.speed, function(){ self._showContent();})
      this._showing = true;
    },
    _showContent: function(){
      this.contentSpace.style.display="";
    }    
  }
)