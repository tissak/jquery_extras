load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.js')
load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.growl.js')
load('/Library/Ruby/Gems/1.8/gems/jspec-3.1.3/lib/jspec.xhr.js')

load('spec/support/env.rhino.js');
Envjs('spec/fixtures/dummy.html') 
Envjs.wait();

load('lib/jquery.js');

load('lib/jquery_extras.js');
load('lib/connect.js');
load('lib/LAB.js');
load('lib/widgets/Button.js');
load("lib/widgets/Accordion.js")
load("lib/widgets/ContentPane.js")

JSpec
.exec('spec/unit/spec.js')
.exec('spec/unit/accordion.spec.js')
.exec('spec/unit/contentpane.spec.js')
.run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
.report()