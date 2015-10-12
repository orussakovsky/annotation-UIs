// Misc utility functions that don't fit anywhere else.
var VG = (function(vg) {

  // For each property in default_options that is not in options, add that
  // property to options.
  vg.merge_options = function(options, default_options) {
    if (typeof(options) === 'undefined') {
      options = {};
    }

    for (var opt in default_options) {
      if (default_options.hasOwnProperty(opt)
          && !options.hasOwnProperty(opt)) {
        options[opt] = default_options[opt];
      }
    }

    return options;
  }

  /**
   * Dynamically create a Bootstrap collapse widget from data.
   *
   * div - The div that will hold the collapse widget. It will be
   *       given a unique ID if it doesn't already have one.
   * data - List of the following form:
   *        [{'title': "A title", 'render': function(div) { }}, ... ]
   *        each element of the list corresponds to a panel in the div.
   *        The title gives the title of the panel, and the render
   *        callback will be passed the body of the panel.
   */
  vg.make_bootstrap_collapse = function(div, data) {
    div.addClass('panel-group');
    var div_id = div.attr('id');
    if (!div_id) {
      div_id = _.uniqueId();
      div.attr('id', div_id);
    }
    for (var i = 0; i < data.length; i++) {
      (function() {
        var panel = $('<div>').addClass('panel panel-default')
                              .appendTo(div);
        var heading = $('<div>').addClass('panel-heading')
                                .appendTo(panel);
        var title = $('<h4>').addClass('panel-title')
                             .appendTo(heading);
        var collapse_id = _.uniqueId();
        var collapse = $('<div>').addClass('panel-collapse collapse')
                                 .attr('id', collapse_id)
                                 .appendTo(panel);
        var body = $('<div>').addClass('panel-body')
                             .appendTo(collapse);
        var link = $('<a>').attr({'data-toggle': 'collapse',
                                  'data-parent': '#' + div_id,
                                  'href': '#' + collapse_id,})
                           .text(data[i].title)
                           .appendTo(title);
        var rendered = false;
        var render_fn = data[i].render;
        collapse.on('show.bs.collapse', function() {
          if (!rendered) {
            render_fn(body);
            rendered = true;
          }
        });
      })();
    }
  }

  /**
   * Dynamicalled create a list of images from data.
   *
   * div - The dic that will hold the image list.
   * data - a list of urls.
   *
   */
  vg.make_image_list = function(div, data) {
    for (var image_index in data) {
      var url = data[image_index];
      $('<img>').attr({'src': url, 'width': 100, 'height': 100, 'margin': '5px'})
                .appendTo(div);
    }
  }

  return vg;

}(VG || {}));
