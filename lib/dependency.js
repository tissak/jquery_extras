// $e = ($e) ? $e : {};

$e.declare(
  "$e.Dependency", 
  null, 
  {
    unsatisfiedModules: null,
    satisfiedModules: null,
    modName: "",
    constructor:function(moduleName, requires, code){
      this.modName = moduleName;
      this.satisfiedModules = [];
      this.unsatisfiedModules = requires;
      this.waitingCode = code; 
    },
    satisfied: function(moduleName){
      this.satisfiedModules.push(moduleName);
      if(this.satisfiedModules.length == this.unsatisfiedModules.length){
        this.executeCode();
      }
    },
    executeCode: function(){
      if(typeof(this.waitingCode) == "string"){
        jQuery.globalEval(this.waitingCode);
        this.waitingCode = null;
      } else {
        this.waitingCode();
      }
      $e.dependencySatisfied(this.modName);
    }
  }
);

$e.mixin($e,{
  _dependenciesList: {},
  _depFetchedList: {},
  _depResolved: {},
  asyncMode: false,
  codeReady: function(moduleName, func){
    $e.dependencyRegister(moduleName, (new $e.Dependency("CODE", [moduleName], func)));
  },
  dependencyRegister: function(moduleName, dependency){
    if($e._depResolved[moduleName]){ 
      // if already resolved, immediately execute
      dependency.executeCode(); 
    }
    if(this._dependenciesList[moduleName]==null){ this._dependenciesList[moduleName] = []; }
    this._dependenciesList[moduleName].push(dependency);
  },
  dependencySatisfied: function(moduleName){
    $e._depResolved[moduleName] = true;
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
    jQuery.ajax({ url: path, tyep:"get", async: $e.asyncMode, context:this, success: sfunc, error: efunc, dataType: "text"});
  },
  _handleScriptFetch: function(moduleName, data){    
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
      //console.log("Requires found for "+moduleName+": "+requiresSet.join(","))
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
      //console.log("Executing for " + moduleName+ " (No Deps)");
      jQuery.globalEval(data);
      $e.dependencySatisfied(moduleName);
    }
  }
});