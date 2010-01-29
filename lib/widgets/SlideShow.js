/*
  http://sixrevisions.com/tutorials/javascript_tutorial/create-a-slick-and-accessible-slideshow-using-jquery/

  Modified example of a slide show into a widget applied version with internal state.
  Added some boundary conditions so there's no way to force beyond edge slides calling move directly
*/
$e.declare(
  "widgets.SlideShow",
  $w.Modifier,
  {
    slides: null,
    currentPosition: 0,
    slideWidth: 560,
    numberOfSlides:0,
    apply: function(){
      this.slides = this.$().find('.slide');
      this.numberOfSlides = this.slides.length;
      this.$().find('#slidesContainer').css('overflow', 'hidden');
      var slideWidth = this.slideWidth;
      this.slides.wrapAll('<div id="slideInner"></div>')
      	.css({
          'float' : 'left',
          'width' : slideWidth
        });
      this.$().find('#slideInner').css('width', this.slideWidth * this.numberOfSlides);
      this.$()
        .prepend('<span class="control" id="leftControl">Clicking moves left</span>') 
        .append('<span class="control" id="rightControl">Clicking moves right</span>');
      this.manageControls(this.currentPosition);
      this.bind(this.$().find("#leftControl"), "click", this.previous);
      this.bind(this.$().find("#rightControl"), "click", this.next);
    },
    next: function(){ this.move(1); },
    previous: function(){  this.move(-1); },
    move: function(modifier){ 
      this.currentPosition += modifier;
      if(this.currentPosition > (this.numberOfSlides-1)){ this.currentPosition = (this.numberOfSlides-1); }
      if(this.currentPosition < 0){ this.currentPosition = 0; }
      this.manageControls(this.currentPosition);
      this.$().find('#slideInner').animate({ 'marginLeft' : this.slideWidth*(-this.currentPosition) }); 
    },
    manageControls: function(position){
  	  if(position==0){ this.$().find('#leftControl').fadeOut() } else{ this.$().find('#leftControl').fadeIn() }
      if(position==this.numberOfSlides-1){ this.$().find('#rightControl').fadeOut() } else{ this.$().find('#rightControl').fadeIn() }      
    }
  }
)