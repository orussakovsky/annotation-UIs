var VG = (function(vg) {
	//task_input must have:
	//  image_url, obj_name, obj_plural, gt.bbox, gt.min_num, gt.max_num
    vg.PointTaskOnce = function(container_div,task_input) {
	var that = (this === vg ? {} : this);
	var enabled = false;

	var image_url = task_input.image_url;

	var drawer_div = $('<div>').appendTo(container_div);

	VIEWPORT_HEIGHT = 500;

	var max_height = VIEWPORT_HEIGHT;
        max_height -= $('#task-instr-div').height();
        max_height -= $('#c-buttons-div').height();
	var images_div = $('#c-imgs-div');
        var bbox_drawer_options = {
	    max_height: max_height,
	    max_width: images_div.width(),

	    gt: task_input.gt,
	    obj_singular: task_input.obj_name,
        };
	var bbox_drawer = new VG.PointDrawerOnce(drawer_div,image_url,null,bbox_drawer_options);

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
