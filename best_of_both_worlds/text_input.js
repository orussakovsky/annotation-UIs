var VG = (function(vg) {
    var DEFAULT_OPTIONS = {
	include_button: false,
	button_text: 'Yes',
	button_text_clicked: 'No',
	autocomplete_options: null,
	gt: null,
	prohibited_text: null
    }

    vg.TextInput = function(container_div,options) {
	var that = (this === vg ? {} : this);

	options = vg.merge_options(options,DEFAULT_OPTIONS);

	var answer = '';
	var enabled = false;
	var binput = null;
	var binput_on = false;
	
	var input_div = $('<div>').appendTo(container_div);
	var tinput = $('<input>').addClass('padded typeahead').attr('autofocus','autofocus')
	    .appendTo(input_div);

	if (options.include_button) {
	    var button_div = $('<div>').appendTo(container_div);
	    binput=$('<button>')
		.click(SwitchButton)
		.text(options.button_text)
		.addClass('btn btn-sm btn-default padded')
		.appendTo(button_div);   
	}
	
	// http://twitter.github.io/typeahead.js/examples/
	var substringMatcher = function(strs) {
	    return function findMatches(q, cb) {
		var matches, substrRegex;
 
		// an array that will be populated with substring matches
		matches = [];
		if (strs == null)
		    return matches;
		
		// regex used to determine if a string contains the substring `q`
		substrRegex = new RegExp(q, 'i');
		
		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		$.each(strs, function(i, str) {
		    if (substrRegex.test(str)) {
			// the typeahead jQuery plugin expects suggestions to a
			// JavaScript object, refer to typeahead docs for more info
			matches.push({ value: str });
		    }
		});
 
		cb(matches);
	    };
	};

	tinput.typeahead({
	    hint:true,
	    highlight: true,
	    minLength: 1
	},{
	    name: 'names',
	    displayKey: 'value',
	    source:substringMatcher(options.autocomplete_options)
	});
	    

	function SwitchButton() {
	    if (binput_on) {
		// turning it off
		binput.text(options.button_text);
		binput_on = false;
		binput.removeClass('btn-danger').addClass('btn-default');
		tinput.attr('disabled',false);
	    } else {
		// turning it on
		binput.text(options.button_text_clicked);
		binput_on = true;
		binput.removeClass('btn-default').addClass('btn-danger');
		tinput.val('').attr('disabled',true);
	    }
	}
	
	that.enable = function() {
	    enabled = true;
	    if (binput) {
		binput.attr('disabled',false);
	    }
	    tinput.attr('disabled',false);
	    //tinput.attr('autofocus','autofocus');
	    tinput.focus();
	}

	that.disable = function() {
	    enabled = false;
	    if (binput)
		binput.attr('disabled',true);
	    tinput.attr('disabled',true);
	}

	that.GetAnswer = function() {
	    if (binput && binput_on) {
		return -1; // user indicated not a good box
	    }
	    t = tinput.val();
	    if (typeof t === 'undefined' || t.length == 0) {
		return ''; // user did nothing
	    } else {
		return t;
	    }
	}

	that.EvalAnswer = function() {
	    if (binput && binput_on) {
		// user indicated not a good box
		if (options.gt == null) {
		    return 'neutral'; // seems fine
		} else if (options.gt == -1) {
		    return 'good';
		} else {
		    return 'bad';
		}
	    }
	    t = tinput.val();
	    if (typeof t === 'undefined' || t.length == 0) {
		return 'incomplete';
	    }
	    if (options.prohibited_text) {
		for (var i=0; i < options.prohibited_text.length; i++) {
		    if (t == options.prohibited_text[i])
			return 'incomplete';
		}
	    }
	    if (options.gt == null) { 
		return 'neutral'; // nothing to check
	    } else if (options.gt == -1) {
		return 'bad'; // gt disagrees
	    } else {
		return 'good'; // or can do other checks
	    }
	}

	/*$(document.documentElement).keyup(function(e) {
	    if (!enabled) return;
	    if ($.inArray(e.keyCode, [49,50]) !== -1) SwitchButton(); // '1' or '2'
	});*/
	
	that.disable();

	return that;
    }
    
  return vg;

}(VG || {}));
