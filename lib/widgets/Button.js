/* Buttons */

/* default button with nothing special*/
$e.declare(
  "widgets.Button",
  $w.Templated,
  {
    button: null,
    template:"<input type='button' value='${label}' attachpoint='button'/>",
    label: "click me",
    postCreate:function(){
      this.inherited(arguments);
      $e.connect(this.button,"onclick", this, "onClick");
      if(this.originalNode){
        this.attr('label', this.originalNode.innerHTML)
      }
    },
    onClick: function(){
      console.log("widget click")
    },
    accessorLabel: function(){
      if(arguments.length == 0){
        return this.label;
      } else {
        this.label = arguments[0];
        this.domNode.value = arguments[0];
        return this.label;
      }
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
      this.inherited(arguments);
      $e.connect(this.button,"onmouseover", this, "onMouseOver");
      $e.connect(this.button,"onmouseout", this, "onMouseOut");
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
    accessorLabel: function(){
      if(arguments.length == 0){
        return this.label;
      } else {
        this.label = arguments[0];
        this.button.innerHTML = arguments[0];
        return this.label;
      }
    }  
  }
)

$e.declare(
  "widgets.ExpandoButton",
  widgets.DivButton,
  {
    onMouseOver:function(){
      this.inherited(arguments);
      this._expand();
    },
    onMouseOut: function(){
      this.inherited(arguments);
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
      this.inherited(arguments);
      this._expand();
    },
    onMouseOut: function(){
      this.inherited(arguments);
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