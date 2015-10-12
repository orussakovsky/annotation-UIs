var VG = (function(vg) {

  /*
   * A Carosel allows different panes of content to be shown. Buttons and
   * keyboard shortcuts are used to navigate between panes.
   *
   * container_div: Parent div; for each pane a new div will be created
   *                inside this parent div.
   * button_div: A pair of buttons and a span will be added to this div for
   *             navigating between panes.
   * num_panes: The number of panes to be shown in this carosel
   * show_callback(idx, div): A callback function called whenever a pane
   *                          becomes active. idx is the numeric index of the
   *                          pane being activated, and div is the div for the
   *                          newly activated pane.
   * should_scroll: Boolean, optional.
   *                If true, when the buttons are clicked an additional
   *                callback function is passed to show_callback. The show_callback
   *                can call this callback when it is done rendering to scroll the
   *                page back to the position that it was in prior to clicking any
   *                buttons. This is useful if rendering modifies the page length
   *                and is not instanteanous (such as if images are loaded).
   *
   * A Carosel has the following methods:
   * select_pane(new_idx): Set idx to be the current pane.
   * enable() / disable(): Enable or disable the carosel. It starts disabled.
   * enableKeyboardShortcuts() / disableKeyboardShortcuts(): Enable or disable
   *   the keyboard shortcuts. They start enabled, but only work if the carosel
   *   as a whole is also enabled.
   */
  vg.Carosel = function(container_div, button_div, num_panes,
                        show_callback, should_scroll) {
    var that = (this === vg ? {} : this);

    var enabled = false;
    if (typeof(should_scroll) === 'undefined') should_scroll = false;

    // First go through and create a bunch of divs
    var divs = [];
    for (var i = 0; i < num_panes; i++) {
      var div = $('<div>').appendTo(container_div).hide();
      divs.push(div);
    }

    // Create buttons
    var prev_button = $('<button>').prop('disabled', true)
                                   .text('Previous (left arrow)')
                                   .addClass('btn btn-default btn-lg padded')
                                   .appendTo(button_div);
    var counter_span = $('<span>').addClass('h3 padded vcenter')
                                  .appendTo(button_div);
    var next_button = $('<button>').prop('disabled', true)
                                   .text('Next (right arrow)')
                                   .addClass('btn btn-default btn-lg padded')
                                   .appendTo(button_div);

    var current_idx = 0;

    // Handlers for selecting next or previous pane
    var next = function() { if (enabled) select_pane(current_idx + 1, should_scroll); };
    var prev = function() { if (enabled) select_pane(current_idx - 1, should_scroll); };

    next_button.click(next);
    prev_button.click(prev);

    var keyboard_enabled = true;

    // Set up keypress handlers for keyboard shortcuts
    //prevKeys = [37, 65]; // a and left
    //nextKeys = [39, 68]; // d and right
    prevKeys = [37];
    nextKeys = [39];
    $(document.documentElement).keyup(function(e) {
	    if (!keyboard_enabled || !enabled) return;
	    if ($.inArray(e.keyCode, prevKeys) !== -1) prev();
	    if ($.inArray(e.keyCode, nextKeys) !== -1) next();
	});

    that.enable = function() {
      enable_buttons();
      enabled = true;
    }

    that.disable = function() {
      disable_buttons();
      enabled = false;
    }

    that.enableKeyboardShortcuts = function() { keyboard_enabled = true; };
    that.disableKeyboardShortcuts = function() { keyboard_enabled = false; };

    function select_pane(new_idx, scroll) {
      // Ignore out-of-bounds calls
      if (new_idx < 0 || new_idx >= num_panes) return;

      if (typeof(scroll) === 'undefined') {
        scroll = false;
      }


      var scroll_pos = $('body').scrollTop();
      function cb() {
        if (scroll) $('body').scrollTop(scroll_pos);
      }

      // Hide all divs
      for (var i = 0; i < divs.length; i++) {
        divs[i].hide();
      }

      // Show the proper div and call the callback
      divs[new_idx].show();
      if (scroll) {
        show_callback(new_idx, divs[new_idx], cb);
      } else {
        show_callback(new_idx, divs[new_idx]);
      }

      // Update the text of the counter
      counter_span.text((new_idx + 1) + ' / ' + num_panes);

      current_idx = new_idx;

      // We don't want to enable the buttons if we are not enabled
      if (enabled) enable_buttons();
    }
    that.select_pane = select_pane;

    function enable_buttons() {
      disable_buttons();
      // Enable / disable buttons depending on index
      if (current_idx > 0) {
        prev_button.prop('disabled', false);
      }
      if (current_idx !== num_panes - 1) {
        next_button.prop('disabled', false);
      }
    }

    function disable_buttons() {
      prev_button.prop('disabled', true);
      next_button.prop('disabled', true);
    }

    select_pane(0, false);

    return that;
  }

  return vg;

}(VG || {}));
