$e.declare(
  "widgets.TabContainer",
  $w.Templated,
  {
    template: "",
    children
    postCreate: function(){
      this.children = this.$().find("div");
    }
  }
)

$e.declare(
  "widgets.TabButton",
  $w.SubTemplate,
  {
    template: "<div><span attachpoint='label'>tab</span></div>"
  }
)

$e.declare(
  "widgets.TabButtonBar",
  $w.SubTemplate,
  {
    template: "<div></div>",    
  }
)


