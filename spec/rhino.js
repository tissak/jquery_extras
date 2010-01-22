load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.js')
load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.growl.js')

// load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.xhr.js')

//what to use
load('spec/support/env.js');
load('spec/support/jquery.js');
load('lib/jquery.js');
load('lib/jquery_extras_core.js');
Envjs('spec/fixtures/dummy.html') 

JSpec
.exec('spec/unit/spec.js')
.run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
.report()