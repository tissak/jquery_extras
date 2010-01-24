describe 'content pane'
  before
    contentPane = $(fixture("ContentPane"))
  end
  
  it "should be defined"
    widgets.ContentPane.should_not.be_null
  end
  
  it "should pull in remote content on render"
    var widgetCount = $w.all.length;
    $w.parse(contentPane)
    var diff = $w.all.length - widgetCount;
    diff.should.be 2
  end
end