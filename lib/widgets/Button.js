/* Buttons */
$e.declare(
  "widgets.Button",
  $w.Templated,
  {
    button: null,
    template:"<input type='button' value='${label}' attachpoint='button'/>",
    label: "click me",
    postCreate:function(){
      this._inherited(arguments);
      this.bind(this.button,"click", this.onClick);
      if(this.originalNode){
        this.setLabel(this.originalNode.innerHTML)
      }
    },
    onClick: function(){ 
      this.setLabel(this.label +".");
    },
    setLabel: function(label){
      this.label = label;
      this.domNode.value = label;
    }    
  }
)

$e.declare(
  "widgets.DivButton",
  widgets.Button,
  {
    width:"100px",
    template:"<div style='width:${width};cursor:pointer; border:1px solid #eee; height:30px'><div attachpoint='button' style='height:100%;text-align:center' >Button</div></div>",
    postCreate:function(){
      this._inherited(arguments);
      this.bind(this.button,"mouseover", this.onMouseOver);
      this.bind(this.button,"mouseout", this.onMouseOut);
    },
    onMouseOut: function(){
      console.log("out");
      this.highlight(false);
    },
    onMouseOver: function(){
      console.log("over");
      this.highlight(true);
    },
    highlight:function(isOn){
      var bgColor = "transparent"
      if(isOn){ bgColor = "#ccc";}
      this.domNode.style.backgroundColor=bgColor;
    },
    setLabel: function(label){
      this.label = label;
      this.button.innerHTML = label;
    }    
  }
)

$e.declare(
  "widgets.ExpandoButton",
  widgets.DivButton,
  {
    onMouseOver:function(){
      this._inherited(arguments);
      this._expand();
    },
    onMouseOut: function(){
      this._inherited(arguments);
      this._contract();
    },
    _expand: function(){
      $(this.domNode).animate({width: "+=100"}, 500);
    },
    _contract: function(){
      $(this.domNode).animate({width: "-=100"}, 500);
    }
  }
)

$e.declare(
  "widgets.ExpandoButton",
  widgets.DivButton,
  {
    onMouseOver:function(){
      this._inherited(arguments);
      this._expand();
    },
    onMouseOut: function(){
      this._inherited(arguments);
      this._contract();
    },
    _expand: function(){
      $(this.domNode).animate({width: "+=100"}, 500);
    },
    _contract: function(){
      $(this.domNode).animate({width: "-=100"}, 500);
    }
  }
)
$e.declare(
  "widgets.SuperExpandoButton",
  widgets.ExpandoButton,
  {
    _expand: function(){
      $(this.domNode).animate({width: "+=100",height: "+=100"}, 500);
    },
    _contract: function(){
      $(this.domNode).animate({width: "-=100",height: "-=100"}, 500);
    }
  }
)