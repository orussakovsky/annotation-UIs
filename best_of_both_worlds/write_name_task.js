var VG = (function(vg) {
    vg.WriteNameTask = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;
	var box = task_input.box;

	var task_name = "Name the object in the blue box (only if the box is good!):";

	var ti_options = {instructions_url: "write_name_instructions.html"
			 }

	var ui_div = VG.TaskInstructions(container_div,task_name,ti_options).GetInputDiv();

	tinput_opts = {include_button : true,
		       button_text: 'Click here if not a good box',
		       button_text_clicked:'Not a good box (click to undo)',
		       gt: task_input.gt,
		       autocomplete_options: task_input.autocomplete_options
		      };
	var tinput = new VG.TextInput(ui_div,tinput_opts);
	
	var drawer_div = $('<div>').appendTo(ui_div);

	VIEWPORT_HEIGHT = 500;

	var max_height = VIEWPORT_HEIGHT;
        max_height -= $('#task-instr-div').height();
        max_height -= $('#c-buttons-div').height();
	var images_div = $('#c-imgs-div');
        var bbox_drawer_options = {
	    max_height: max_height,
	    max_width: images_div.width(),
	    static_box_color: 'blue'
        };
	var bbox_drawer = new VG.BBoxDrawer(drawer_div,image_url,null,bbox_drawer_options);
	bbox_drawer.addStaticBox(box);
	bbox_drawer.disable();	

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
