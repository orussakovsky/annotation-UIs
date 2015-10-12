var VG = (function(vg) {
    var DEFAULT_OPTIONS = {
	pos_button_name: 'Yes',
	neg_button_name: 'No',
	gt: null
    }

    vg.BinaryInput = function(container_div,options) {
	var that = (this === vg ? {} : this);

	options = vg.merge_options(options,DEFAULT_OPTIONS);
	var answer = 0;
	
	var enabled = false;

	var button_div = $('<div>').appendTo(container_div);

	var button_yes=$('<button>')
	    .click(SetYes)
	    .text(options.pos_button_name)
	    .addClass('btn btn-lg btn-default padded')
	    .appendTo(button_div);
	var button_no=$('<button>')
	    .click(SetNo)
	    .text(options.neg_button_name)
	    .addClass('btn btn-lg btn-default padded')
	    .appendTo(button_div);
	
	function SetYes() {
	    answer = 1;
	    button_yes.removeClass('btn-default').addClass('btn-success');
	    button_no.removeClass('btn-danger').addClass('btn-default');
	}	
	
	function SetNo() {
	    answer = -1;
	    button_no.removeClass('btn-default').addClass('btn-danger');
	    button_yes.removeClass('btn-success').addClass('btn-default');
	}	
	
	that.GetAnswer = function() {
	    return answer;
	}

	that.EvalAnswer = function() {
	    if (answer == 0) {
		return 'incomplete'; // no answer
	    } else if (options.gt == null) {
		return 'neutral'; // no checks needed
	    } else if (options.gt == answer) {
		return 'good'; // checked with gt, OK
	    } else {
		return 'bad';		
	    }
	}

	that.enable = function() {
	    enabled = true;
	    button_yes.attr('disabled',false);
	    button_no.attr('disabled',false);
	}

	that.disable = function() {
	    enabled = false;
	    button_yes.attr('disabled',true);
	    button_no.attr('disabled',true);
	}
	
	that.disable();
	if (typeof default_value !== 'undefined') {
	    if (default_value > 0)
		SetYes();
	    else
		SetNo();
	}

	$(document.documentElement).keyup(function(e) {
		if (!enabled) return;
		if ($.inArray(e.keyCode, [49]) !== -1) SetYes(); // '1'
		if ($.inArray(e.keyCode, [50]) !== -1) SetNo(); // '2'
	});

	return that;
    }
    
  return vg;

}(VG || {}));
