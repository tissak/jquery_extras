$e.declare(
  "widgets.TabContainer",
  $w.Templated,
  {
    buttonBar:null,
    contentSpace:null,
    template: "<div><div attachpoint='buttonBar' class='tabButtonBar'></div><div attachpoint='contentSpace' class='tabContainer'></div></div>",
    panes: [],
    children: null,
    selectedIndex: null,
    postCreate: function(){
      if(!this.selectedIndex) { this.selectedIndex = 0; }
      this.inherited(arguments);
      this.panelsButtons = [];                  
      this.children = $(this.originalNode).children("div");
      this._buildPanels();
    },
    _buildPanels: function(){
      var self = this;
      this.children.each(function(index,item){        
        var selected = (index==self.selectedIndex) ? true : false;
        // buttons
        var button = new widgets.TabButton(null, {parent: self, label:item.getAttribute("label"), index: index, selected: selected});
        self.panelsButtons.push(button);
        self.buttonBar.appendChild(button.domNode);        
        // panels
        var panel = new widgets.TabPane(item, {parent: self, showing: selected, index: index})
        self.contentSpace.appendChild(panel.domNode);
        self.panes.push(panel);
      })      
    },
    showPane: function(selectedIndex){
      this.$().find(".tabButtonSelected").removeClass("tabButtonSelected");
      jQuery.each(this.panes, function(index, item){
        if(item.index == selectedIndex){ 
          item.show(); 
        } else {
          item.hide();
        }
      })
    }
  }
)

$e.declare(
  "widgets.TabButton",
  $w.SubTemplate,
  {
    parent: null,
    index: 0,
    label:"",
    template: "<div class='tabButton'><span attachpoint='label'>${label}</span></div>",
    selected: false,
    postCreate: function(){
      this.bind(this.domNode,"click",this.onClick);
      if(this.selected){ this.select(); }
    },
    onClick: function(){
      this.parent.showPane(this.index);
      this.select();
    },
    select: function(){
      this.$().addClass("tabButtonSelected")
    }
  }
)

$e.declare(
  "widgets.TabPane",
  $w.SubTemplate,
  {
    parent: null,
    showing:false,
    template: "<div class='tabPane'></div>",
    postCreate: function(){
      this.domNode.innerHTML = this.originalNode.innerHTML;
      if(!this.showing){ this.domNode.style.display = "none"; }
    },
    show: function(){ this.$().show(); },
    hide: function(){ this.$().hide(); }
  }
)
