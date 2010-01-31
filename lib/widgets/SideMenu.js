/*
  http://jquery.com/files/demo/dl-done.html
  
  John Resigs example of a simple side menu turned into a widget. 
  Main difference is that a widget will not impact other code on the page. 
  Hence you can have multiple instances or avoid breaking other code.
*/

$e.declare(
  "widgets.SideMenu",
  $w.Modifier,
  {
    applyModifier: function(){
  		this.$().find("dd:not(:first)").hide();
  		this.$().find("dt a").click($e.hitch(this, this.hideAll));
  		this.$().find("dt a").click(this.toggle);
    },
    hideAll: function(){
      this.$().find("dd:visible").slideUp("slow");
    },
    toggle: function(){			
      //in this case 'this' refers to the clicked node
			$(this).parent().next().slideDown("slow");
			return false;
  	}
  }
)