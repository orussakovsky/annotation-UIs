var VG = (function(vg) {
    vg.VerifyImageTask = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;

	var task_name = "Is this object present in the image:";

	var ti_options = {object_name: task_input.object_name,
			  instructions_url: "verify_image_instructions.html"
			 }

	var ui_div = VG.TaskInstructions(container_div,task_name,ti_options).GetInputDiv();
	
	var img_div = $('<img>').attr('src',image_url).appendTo(ui_div);

	binput_info = {gt:task_input.gt};
	var binput = new VG.BinaryInput(ui_div,binput_info);

	var timer = new VG.Timer();
	
	that.GetAnswerIfValid = function () {
	    return {'answer': binput.GetAnswer(),
		    'time':timer.total(),
		    'eval':binput.EvalAnswer()};
	}
	
	that.enable = function() {
	    enabled = true;
	    binput.enable();
	    timer.start();
	}

	that.disable = function() {
	    enabled = false;
	    binput.disable();
	    timer.stop();
	}
	
	that.disable();

	return that;
    }
    
  return vg;

}(VG || {}));
