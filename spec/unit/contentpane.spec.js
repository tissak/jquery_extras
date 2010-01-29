describe 'content pane'
  before
    contentPane = $(fixture("ContentPane"))
  end
  
  it "should be defined"
    widgets.ContentPane.should_not.be_null
  end
  
  it "should pull in remote content on render"
    contentPane.should_not.be_null
    var widgetCount = $w.all.length;
    $w.parse(contentPane[0])
    ($w.all.length - widgetCount).should.be 2
  end
end