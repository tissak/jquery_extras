$e.declare(
  "widgets.Message",
  $w.Templated,
  {
		opacity: 0.8,
		fadeOutDuration: 500,
		fadeInDuration: 200,
		minDuration: 2500,
    messageSpace: null,
    visible: false,
    template:'<div class="jquery-message"><div class="round"></div><p attachpoint="messageSpace"></p><div class="round"></div></div>',
    postCreate: function(){
      
    },
    hide: function(){
      if(this.visible) {
        this.$().animate({ opacity: 0 }, this.fadeOutDuration, $e.hitch(this, function(){this.visible = false;}));
      }
    },
    show: function(){
      if (!this.visible) {
        this.$().show().animate({ opacity: this.opacity }, this.fadeInDuration, $e.hitch(this, function(){ this.visible=true;}));
      }
    },
    message: function(msg){
      this.messageSpace.innerHTML = msg;
      this.show();
      window.setTimeout($e.hitch(this,this.hide), this.minDuration);
    }
  }
)

//(function($) {
//	var helper,
//		visible,
//		timeout1,
//		timeout2;
//
//	$.fn.message = function(message) {
//		message = $.trim(message || this.text());
//		if (!message) {
//			return;
//		}
//		clearTimeout(timeout1);
//		clearTimeout(timeout2);
//
//		initHelper();
//		helper.find("p").html(message);
//		helper.show().animate({ opacity: $.message.defaults.opacity}, $.message.defaults.fadeInDuration);
//		visible = true;
//		active = false;
//		timeout1 = setTimeout(function() {
//			visible = false;
//		}, $.message.defaults.minDuration + $.message.defaults.displayDurationPerCharacter * Math.sqrt(message.length));
//		timeout2 = setTimeout(fadeOutHelper, $.message.defaults.totalTimeout);
//	};
//
//	function initHelper() {
//		if (!helper) {
//			helper = $($.message.defaults.template).appendTo(document.body);
//			$(window).bind("mousemove click keypress", fadeOutHelper);
//		}
//	}
//
//	function fadeOutHelper() {
//		if (helper.is(":visible") && !helper.is(":animated") && !visible) {
//			helper.animate({ opacity: 0 }, $.message.defaults.fadeOutDuration, function() { $(this).hide() })
//		}
//	}
//
//	$.message = {};
//	$.message.defaults = {
//		opacity: 0.8,
//		fadeOutDuration: 500,
//		fadeInDuration: 200,
//		displayDurationPerCharacter: 125,
//		minDuration: 2500,
//		totalTimeout: 6000,
//		template: '<div class="jquery-message"><div class="round"></div><p></p><div class="round"></div></div>'
//	}
//})(jQuery);
