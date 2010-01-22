describe 'Class'
  it 'should be defined'
    typeof(Class).should.be "function"    
  end
  it 'should be extendable'
    var newClass = Class.extend({ name: function(){} })
    var obj = new newClass();
    typeof(obj.name).should.equal "function"
  end
end

describe 'jQuery extra extensions'
  it 'should be defined'
    typeof($e).should.be "object"
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
    typeof(l).should.equal "object"

    $e.setObjectBranch("x.y");
    typeof(x).should.equal "object"
    typeof(x.y).should.equal "object"
  
    $e.setObjectBranch("a.b.c");
    typeof(a).should.equal "object"
    typeof(a.b).should.equal "object"
    typeof(a.b.c).should.equal "object"
  end
  
  it 'should get an object from a string path'
    window.g = {h:{i:{j:1}}};
    var obj = $e.getObject("g.h.i");
    obj.j.should.equal 1
  end
end

describe "jQuery extra widget"
  it 'should be defined'
    typeof($w).should_not.equal "undefined"
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
  
  it "should parse a region and produce widgets"
    $w.parse("#testSpace1")
    $w.all.length.should.equal 1
  end

  it "should not produce more widgets reparsing a region"
    $w.parse("#testSpace1")
    $w.all.length.should.equal 1
  end

  it "should produce additional widgets when parsing whole document"
    $w.parse()
    $w.all.length.should.equal 2
  end
end