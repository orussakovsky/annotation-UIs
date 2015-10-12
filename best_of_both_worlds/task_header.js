var VG = (function(vg) {
    DEFAULT_OPTIONS = {object_name: null,
		       instructions: null,
		       instructions_url: null};

    vg.TaskInstructions = function(container_div,task_name,options) {
	var that = (this === vg ? {} : this);

	options = vg.merge_options(options,DEFAULT_OPTIONS);

	var top_div = $('<div>').appendTo(container_div);
	var middle_div = $('<div>').appendTo(container_div);
	var bottom_div = $('<div>').addClass('text-left').appendTo(container_div);

	$('<div>').addClass('task-instr-title').text(task_name).appendTo(top_div);
	if (options.object_name != null) {
	    $('<div>').addClass('task-instr-clsname')
		.text(options.object_name)
		.appendTo(top_div);    
	}

	if (options.instructions != null || options.instructions_url != null) {
	    $('<hr>').appendTo(bottom_div);
	    $('<h4>').text('Instructions:').appendTo(bottom_div);
	    
	    if (options.instructions != null) {
		$('<div>').addClass('task-instr-text')
		    .text(options.instructions).appendTo(bottom_div);
	    }
	    if (options.instructions_url != null) {
		// IMPORTANT: put in absolute rather than relative path
		$('<div>').addClass('task-instr-text').load('' + options.instructions_url).appendTo(bottom_div);
	    }
	}

	that.GetInputDiv = function() {
	    return middle_div;
	}

	return that;
    }
    
  return vg;

}(VG || {}));
