load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.js')
load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.growl.js')
load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.xhr.js')

load('spec/support/env.rhino.js');
Envjs('spec/fixtures/dummy.html') 
Envjs.wait();

load('lib/jquery.js');

load('lib/jquery_extras_core.js');
load('lib/widgets/Button.js');


JSpec.exec('spec/unit/spec.js').run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' }).report()