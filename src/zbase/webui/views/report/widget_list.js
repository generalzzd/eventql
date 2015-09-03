var WidgetList = function() {
  var pane;
  var widgets = [];

  var init = function(elem) {
    pane = elem;
    console.log("init");
    
  };

  var getJSON = function() {
    return widgets;
  };

  var setJSON = function(new_widgets) {
    widgets = new_widgets;
    var tpl = $.getTemplate(
          "views/report",
          "zbase_report_widget_main_tpl");

    widgets.forEach(function(widget) {
      var elem = tpl.cloneNode(true);
      //widget.render(elem)

      $.onClick($("button.edit", elem), function() {
        console.log("render widget edit view");
        //widget.editView();
      });
      pane.appendChild(elem);
    });
  };

  var setEditable = function(is_editable) {
    var widget_elems = document.querySelectorAll(".zbase_report_widget");

    for (var i = 0; i < widget_elems.length; i++) {
      if (is_editable) {
        widget_elems[i].classList.add("editable");
      } else {
        widget_elems[i].classList.remove("editable");
      }
    }
  };


  return {
    init: init,
    getJSON: getJSON,
    setJSON: setJSON,
    setEditable: setEditable
  }
};
