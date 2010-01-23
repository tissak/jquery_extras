$e.declare(
  "widgets.Button",
  $w.Templated,
  {
    clickable: null,
    okAttribute: "",
    template: "<input attachpoint='clickable' type='button' name='${id}' value='click me' />"
  }
)

$e.declare(
  "widgets.RemoteButton",
  $w.Templated,
  {
    clickable: null,
    templatePath: "/test/widgets/templates/button.html",
    val: ""
  }
)