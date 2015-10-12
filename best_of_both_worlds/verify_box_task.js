var VG = (function(vg) {
    vg.VerifyBoxTask = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;
	var box = task_input.box;

	var task_name = "Is this a good box around a";

	var ti_options = {object_name: task_input.object_name,
			  instructions_url: "verify_box_instructions.html"
			 }

	var ui_div = VG.TaskInstructions(container_div,task_name,ti_options).GetInputDiv();

	var drawer_div = $('<div>').appendTo(ui_div);

	binput_options = {
	    pos_button_name: 'Yes, it is a good box',
	    neg_button_name: 'No, it is not a good box',
	    gt: task_input.gt
	}


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

	var binput = new VG.BinaryInput(ui_div,binput_options);


	var timer = new VG.Timer();

	that.GetAnswerIfValid = function () {
	    return {'answer': binput.GetAnswer(),
		    'time':timer.total(),
		    'eval':binput.EvalAnswer()};
	}
	
	that.enable = function() {
	    enabled = true;
	    //bbox_drawer.enable();
	    binput.enable();
	    timer.start();
	}

	that.disable = function() {
	    enabled = false;
	    bbox_drawer.disable();
	    binput.disable();
	    timer.stop();
	}
	
	that.disable();
	
	return that;
    }
    
  return vg;

}(VG || {}));
