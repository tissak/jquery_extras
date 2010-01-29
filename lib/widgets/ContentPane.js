$e.declare(
  "widgets.ContentPane",
  $w.Templated,
  {
    template: "<div attachpoint='contentSpace'></div>",
    contentSpace:null,
    href:"",
    postCreate:function(){
      this._inherited(arguments);
      if(this.href!=""){
        this.setHref(this.href);
      }
    },
    reload: function(){
    	this.setHref(this.href);
    },
    setHref:function(url){
      $.get(url, $e.hitch(this, this._updateContent));
    },
    _updateContent:function(data){
      this.contentSpace.innerHTML = data;
      this.onLoad();
    },
    onLoad:function(){
      //event stub;
    }
  }
)