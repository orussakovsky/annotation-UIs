var VG = (function(vg) {
    vg.DrawBoxTask = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;
	var boxes = task_input.boxes;

	//console.log(boxes);
	//console.log(typeof(boxes.x));
	//console.log(boxes.length)
	
	if (typeof(boxes.x) === 'undefined' && typeof(boxes.length) === 'undefined') {
	    var task_name =  "Draw a good box around a";	    
	    var button_text = "Click here if no box can be drawn";
	    var button_text_clicked = "No box can be drawn (click again to undo)";
	} else {
	    var task_name = "Draw a good box around another";
	    var button_text = "Click here if no other box can be drawn";
	    var button_text_clicked = "No other box can be drawn (click again to undo)";
	}

	var ti_options = {object_name: task_input.object_name,
			  instructions_url: "draw_box_instructions.html"
			 }

	var ui_div = VG.TaskInstructions(container_div,task_name,ti_options).GetInputDiv();

	var drawer_div = $('<div>').appendTo(ui_div);

	VIEWPORT_HEIGHT = 500;

	var max_height = VIEWPORT_HEIGHT;
        max_height -= $('#task-instr-div').height();
        max_height -= $('#c-buttons-div').height();
	var images_div = $('#c-imgs-div');
        var bbox_drawer_options = {
	    max_height: max_height,
	    max_width: images_div.width(),
	    static_box_color: 'yellow',
	    include_button: true,
	    gt: task_input.gt,
	    'button_text': button_text,
	    'button_text_clicked':button_text_clicked
        };
	var bbox_drawer = new VG.BBoxDrawer(drawer_div,image_url,null,bbox_drawer_options);
	bbox_drawer.addStaticBoxes(boxes);

	var timer = new VG.Timer();

	that.GetAnswerIfValid = function () {
	    return {'answer': bbox_drawer.GetAnswer(),
		    'time':timer.total(),
		    'eval':bbox_drawer.EvalAnswer()};
	}

	that.enable = function() {
	    enabled = true;
	    bbox_drawer.enable();
	    timer.start();
	}

	that.disable = function() {
	    enabled = false;
	    bbox_drawer.disable();
	    timer.stop();
	}
	
	that.disable();
	
	return that;
    }
    
  return vg;

}(VG || {}));
