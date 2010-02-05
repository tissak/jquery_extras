//*********
//**dep.level1**
//--dep.level2--
//--dep.level2_1--
//**********

widgets.level1 = function(){

}

widgets.something.asd.a = function(){
  document.body.innerHTML += "ASD: "+ $p.ping();
};

for(var x=0;x<10000;x++){
  var a = 1; 
}


// function pausecomp(millis)
// {
//   var date = new Date();
//   var curDate = null;
//   do { curDate = new Date(); }
//   while(curDate-date < millis);
// } 
// 
// pausecomp(500);