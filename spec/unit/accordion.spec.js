describe 'accordion'
  describe 'single accordion'
    before
      accordion = $(fixture("Accordion"))
    end
  
    it "should be defined"
      widgets.Accordion.should_not.be_null
    end
  
    it "should render"    
      accordion.should_not.be_null
      accordion.length.should.be 1
      $w.parse(accordion[0])
      $w.byId("accordion").panels.length.should.be 3
    end
  
    it "should have only the first panel showing"
      var widget = $w.byId("accordion");
      widget.panels[0]._showing.should.be_true
      widget.panels[0].contentSpace.style.display.should.be "block"
      widget.panels[1]._showing.should.be_false
      widget.panels[1].contentSpace.style.display.should.be "none"
      widget.panels[2]._showing.should.be_false
      widget.panels[2].contentSpace.style.display.should.be "none"
    end
  
    it "should show the second panel after clicking on it"
      var widget = $w.byId("accordion");
      widget.panels[1].showPanel();
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_true
      widget.panels[2]._showing.should.be_false
    end
  
    it "should show the third panel after clicking on it"
      var widget = $w.byId("accordion");
      widget.panels[2].showPanel();
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_false
      widget.panels[2]._showing.should.be_true
    end
  
    it "should still show the third panel after reclicking on it"
      var widget = $w.byId("accordion");
      widget.panels[2].showPanel();
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_false
      widget.panels[2]._showing.should.be_true
      Envjs.wait(1000); //need to let the animation finish 
      widget.panels[2].contentSpace.style.display.should.be "block"
    end
    
    after
      accordion = null;
      $w.reset();
    end
  end
  
  describe 'multiple accordions'
    before
      accordion = $(fixture("Accordion2"))
    end
    
    it "should render"    
      accordion.should_not.be_null
      accordion.length.should.be 1
      $w.parse(accordion[0])
      $w.byId("accordion").panels.length.should.be 3
      $w.byId("accordion2").panels.length.should.be 3
    end
  
    it "should have only the first panel showing for the first accordion"
      var widget = $w.byId("accordion");
      widget.panels[0]._showing.should.be_true
      widget.panels[0].contentSpace.style.display.should.be "block"
      widget.panels[1]._showing.should.be_false
      widget.panels[1].contentSpace.style.display.should.be "none"
      widget.panels[2]._showing.should.be_false
      widget.panels[2].contentSpace.style.display.should.be "none"
    end

    it "should have only the second panel showing for the second accordion"
      var widget = $w.byId("accordion2");
      widget.panels[0]._showing.should.be_false
      widget.panels[0].contentSpace.style.display.should.be "none"
      widget.panels[1]._showing.should.be_true
      widget.panels[1].contentSpace.style.display.should.be "block"
      widget.panels[2]._showing.should.be_false
      widget.panels[2].contentSpace.style.display.should.be "none"
    end

    it "should modify only the first accordion when clicked on"
      var widget = $w.byId("accordion");
      widget.panels[1].showPanel();
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_true
      widget.panels[2]._showing.should.be_false

      var widget = $w.byId("accordion2");
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_true
      widget.panels[2]._showing.should.be_false
    end

    it "should modify only the second accordion when clicked on"
      var widget = $w.byId("accordion2");
      widget.panels[0].showPanel();
      widget.panels[0]._showing.should.be_true
      widget.panels[1]._showing.should.be_false
      widget.panels[2]._showing.should.be_false

      var widget = $w.byId("accordion");
      widget.panels[0]._showing.should.be_false
      widget.panels[1]._showing.should.be_true
      widget.panels[2]._showing.should.be_false
    end

  end
end