// $e = ($e) ? $e : {};
console._log = console.log;
console.log = function(){
  // document.body.innerHTML += Array.prototype.join.apply(arguments, [", "])+"<br/>";
  console._log.apply(window, arguments);
}

$e.declare(
  "$e.Dependency", 
  null, 
  {
    unsatisfiedModules: null,
    satisfiedModules: null,
    modName: "",
    constructor:function(moduleName, requires, code){
      this.satisfiedModules = [];
      this.unsatisfiedModules = [];
      console.log("Creating for module: "+moduleName);
      this.modName = moduleName;
      this.unsatisfiedModules = requires;
      this.waitingCode = code; 
    },
    satisfied: function(moduleName){
      this.satisfiedModules.push(moduleName);
      console.log(moduleName+" satisfied for "+this.modName);
      if(this.satisfiedModules.length == this.unsatisfiedModules.length){
        this.executeCode();
      }
    },
    executeCode: function(){
      console.log("Executing for "+this.modName);
      $p.ping();
      jQuery.globalEval(this.waitingCode);
      $e.dependencySatisfied(this.modName);
    }
  }
);

$e.mixin($e,{
  _dependenciesList: {},
  _depFetchedList: {},
  dependencyRegister: function(moduleName, dependency){
    if(this._dependenciesList[moduleName]==null){ this._dependenciesList[moduleName] = []; }
    this._dependenciesList[moduleName].push(dependency);
  },
  dependencySatisfied: function(moduleName){
    console.log("Satisfied: "+moduleName)
    if(this._dependenciesList[moduleName] && this._dependenciesList[moduleName].length>0){
      var items = this._dependenciesList[moduleName];
      jQuery.each(items, function(index,item){
        item.satisfied(moduleName);
      });
    }
  },
  _moduleToPath: function(module){
    return $e.basePath + module.replace(".","/") + ".js";            
  }, 
  require: function(module){
    if($e._depFetchedList[module]){ return true; }
    $e._depFetchedList[module] = true;
    var path = $e._moduleToPath(module) + "?rand="+(new Date()-1);
    var sfunc = function(data){
      //tuck the module name into a scope for later usage
      var moduleName = module;
      return $e._handleScriptFetch(moduleName, data);
    };
    var efunc = function(data){
      //tuck the module name into a scope for later usage
      var moduleName = module;
      $e._depFetchedList[module] = false;
    };
    jQuery.ajax({ url: path, tyep:"get", async: true, context:this, success: sfunc, error: efunc, dataType: "text"});
  },
  _handleScriptFetch: function(moduleName, data){    
    // this._depLoadedList[moduleName]=true;
    // pull out provides and requires from commented space
    var provides = data.match(/\/\/\*\*(.*)\*\*/g);
    var requires = data.match(/\/\/\-\-(.*)\-\-/g);          
    if(provides && (provides.length > 0)){
      // presume 1 provides line and clean off the commenting.
      provides = provides[0].replace(/\/\//g,"").replace(/\*\*/g,"");
    }
  
    if(requires && (requires.length>0)){
      var requiresSet = $e.collect(requires, function(index, item){
        return item.replace(/\/\//g,"").replace(/\-\-/g,""); 
      });
      console.log("Requires found for "+moduleName+": "+requiresSet.join(","))
      // the dependency for this current module            
      var dep = new $e.Dependency(moduleName, requiresSet, data);
      jQuery.each(requiresSet, function(index, item){
        $e.dependencyRegister(item, dep);
      })
      jQuery.each(requiresSet, function(index, item){
        $e.require(item)
      })
    } else {
      //do not require anything so execute the code and notify dependencies
      console.log("Executing for " + moduleName+ " (No Deps)");
      jQuery.globalEval(data);
      $e.dependencySatisfied(moduleName);
    }
  }
});