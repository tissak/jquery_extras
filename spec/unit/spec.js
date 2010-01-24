describe 'Class'
  it 'should be defined'
    Class.should.be_a Function
  end
  it 'should be extendable'
    var newClass = Class.extend({ name: function(){} })
    var obj = new newClass();
    obj.name.should.be_a Function
  end
end

describe 'jQuery extra extensions'
  it 'should be defined'
    $e.should.be_an Object
  end
  
  it 'should be able to mixin two objects'
      var a = {a:1}
      var b = {b:2}
      $e.mixin(a,b)
      a.a.should.equal 1
      a.b.should.equal 2
  end
  
  it 'should be able to set an object path'
    $e.setObjectBranch("l");
    l.should.be_an Object

    $e.setObjectBranch("x.y");
    x.should.be_an Object
    x.y.should.be_an Object
  
    $e.setObjectBranch("a.b.c");
    a.should.be_an Object
    a.b.should.be_an Object
    a.b.c.should.be_an Object
  end
  
  it 'should get an object from a string path'
    window.g = {h:{i:{j:1}}};
    var obj = $e.getObject("g.h.i");
    obj.j.should.equal 1
  end
end

describe "jQuery extra widget"
  it 'should be defined'
    typeof($w).should_not.be_undefined
  end
  
  it 'should provide super methods'
    var newClass = Class.extend({ getVal: function(){ return 1; } })
    var subClass = newClass.extend({ getVal: function(){ return this._inherited(); }})
    var obj = new subClass();
    obj.getVal().should.equal 1
  end
  
  it 'should allow modification of super returns through the call chain'
    var newClass = Class.extend({ getVal: function(){ return 1; } })
    var subClass = newClass.extend({ getVal: function(){ return (this._inherited() + 1); }})
    var obj = new subClass();
    obj.getVal().should.equal 2
  end
  
  it 'should not parse any widgets by default'
    $w.all.length.should.equal 0
  end
  
  it 'should find test node ready'
    $("#testSpace1").length.should.equal 1
  end
  
  it "should parse a region and produce widgets"
    $w.all.length.should.equal 0
    $w.parse("#testSpace1")
    $w.all.length.should.equal 1
  end

  it "should not produce more widgets reparsing a region"
    $w.all.length.should.equal 1
    $w.parse("#testSpace1")
    $w.all.length.should.equal 1
  end

  it "should produce additional widgets when parsing whole document"
    $w.parse(window.document.body)
    $w.all.length.should.equal 2
  end
  
  it "should produce all widgets with an id"
    jQuery.each($w.all, function(index, item){
      item.id.should_not.be_null
      item.id.should_not.equal ""
    })  
  end
  
  it "should allow fetching of widget by id"
    var w = $w.byId("button1")
    w.should_not.be_null
    typeof(w).should.be "object"
  end
  
  it "allows for building a widget manually"
    var newWidget = new widgets.Button();
    newWidget.should_not.be_null
    $w.all.length.should.be 3
  end

  it "should have attached the templates handles"
    var widget = $w.all[0];
    widget.clickable.should_not.be_null
  end
  
  it "should set widgets types"
    $w.all[0].widgetType.should.equal "widgets.Button"
  end
  
  it "should be able to return a jquery reference from the widget"
    $w.all[0].$().jquery.should.be "1.4"
  end

  it "should move node properties onto the widget"
    $w.all[1].val.should.equal "testval"
  end
  
  it "can build a widget manually with props & no node"
    var newWidget = new widgets.Button(null, {val:1});
    newWidget.should_not.be_null
    $w.all.length.should.be 4
    newWidget.val.should.be 1
  end
  
  it "can build a widget manually with node & no props"
    var targ = $("#targetNode")[0];
    var newWidget = new widgets.Button(targ);
    newWidget.should_not.be_null
    $w.all.length.should_be 5
  end

  it "can build a widget manually with node + props"
    var newWidget = new widgets.Button($("<div something='1'>asd</div>")[0],{val:1});
    newWidget.should_not.be_null
    $w.all.length.should_be 6
    newWidget.val.should_be 1
    newWidget.something.should_be "1"
  end
end

describe "jQuery Extra Deferred"
  it "can create an instance"
    var a = new $e.Deferred();
    a.should_not.be_null
  end

  it "will fire assigned callback methods"
    var a = new $e.Deferred();
    window.deferredHit = null;
    a.addCallback(function(){window.deferredHit = 1; })
    window.deferredHit.should.be_null
    a.callback(true);
    window.deferredHit.should.be 1
  end

  it "will fire callbacks added after success fire"
    var a = new $e.Deferred();
    window.deferredHit = null;
    window.deferredHit1 = null;
    a.addCallback(function(){window.deferredHit = 1; })
    window.deferredHit1.should.be_null
    a.callback(true);  
    window.deferredHit1.should.be_null
    a.addCallback(function(){window.deferredHit1 = 1; })
    window.deferredHit1.should.be 1
  end

  it "will not fire callbacks added after fail fire"
    var a = new $e.Deferred();
    window.deferredHit = null;
    window.deferredHit1 = null;
    a.addCallback(function(){ window.deferredHit = 1; });
    window.deferredHit.should.be_null
    window.deferredHit1.should.be_null
    a.errback(true);  
    window.deferredHit1.should.be_null
    a.addCallback(function(){ window.deferredHit1 = 1; });
    window.deferredHit.should.be_null
    window.deferredHit1.should.be_null
  end
end

describe "jQuery Extra Pub Sub"
  it "Publish to an empty channel does not fail"
    try{
      $e.pub("nothing",[1,2,3]);      
      true.should.be_true
    }catch(e){
      e.should.be_null
    }
  end

  it "should be able to cause single subscription to fire with publish"
    window.chan1 = null;
    $e.sub("chan1",function(){ window.chan1 = true; })
    window.chan1.should.be_null
    $e.pub("chan1",[true]);
    window.chan1.should.be_true
  end

  it "should be able to publish with arguments"
    window.chan2 = null;
    $e.sub("chan2",function(a){ window.chan2 = a; })
    window.chan2.should.be_null
    $e.pub("chan2",["something"]);
    window.chan2.should.be "something"
  end

  it "should publish to a channel causing multiple subscriptions to pass arguments"
    $e.sub("chan3",function(a){ window.chan3 = a; });
    $e.sub("chan3",function(a){ window.chan4 = a; });
    $e.sub("chan3",function(a){ window.chan5 = a; });
    $e.sub("chan3",function(a){ window.chan6 = a; });
    $e.sub("chan3",function(a){ window.chan7 = a; });

    $e.pub("chan3",["something"]);
    window.chan3.should.be "something"
    window.chan4.should.be "something"
    window.chan5.should.be "something"
    window.chan6.should.be "something"
    window.chan7.should.be "something"
  end
end