var VG = (function(vg) {
    vg.WriteClassTask = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;
	var box = task_input.box;

	var s= '';
	if (task_input.curr_object_names) {
	    if (typeof task_input.curr_object_names === 'string') { 
		s = "Current object: " + task_input.curr_object_names;
	    } else if (task_input.curr_object_names.length > 0) { 
		s = "Current objects: "
		for (var i=0;i<task_input.curr_object_names.length; i++) {
		    if (i > 0)
			s += '; ';
		    s += task_input.curr_object_names[i];
		}
	    }
	}
	if (s.length > 0) {
	    var task_name = "Name another object in the image:";
	    var bt = "Click here if no other objects";
	    var btc = "No other objects (click to undo)";
	} else {
	    var task_name = "Name an object in the image:";
	    var bt = "Click here if no objects";
	    var btc = "No objects (click to undo)";
	}

	var ti_options = {instructions_url: "write_class_instructions.html"
			 }

	var ui_div = VG.TaskInstructions(container_div,task_name,ti_options).GetInputDiv();


	var obj_div = $('<div>')
	    .addClass('text-center')
	    .text(s)
	    .appendTo(ui_div);

	tinput_opts = {include_button : true,
		       button_text: bt,
		       button_text_clicked:btc,
		       gt: task_input.gt,
		       autocomplete_options: task_input.autocomplete_options,
		       prohibited_text: task_input.curr_object_names
		      };
	var tinput = new VG.TextInput(ui_div,tinput_opts);


	var img_div = $('<img>').attr('src',image_url).appendTo(ui_div);

	var timer = new VG.Timer();

	that.enable = function() {
	    enabled = true;
	    tinput.enable();
	    timer.start();
	}

	that.disable = function() {
	    enabled = false;
	    tinput.disable();
	    timer.stop();
	}

	that.GetAnswerIfValid = function () {
	    return {'answer': tinput.GetAnswer(),
		    'time':timer.total(),
		    'eval':tinput.EvalAnswer()};
	}
	
	that.disable();
	
	return that;
    }
    
  return vg;

}(VG || {}));
