var VG = (function(vg, $) {

    var DEFAULT_OPTIONS = {
	//unused for now
	obj_singular: "",
	gt: null,
	
	handle_opacity: 0.7,
	conflict_radius: 10,
	pointer_radius: 5, // unused currently
	click_radius: 10,
	image_opacity: 0.9,
	max_height: 300,
	max_width: 500,
       
	callback: function() {},
    };
    
    /*
      var STATIC_BOX_COLOR = '#f00';
      var BBOX_COLOR = '#00f';
      var BBOX_LINE_WIDTH = 2.0;
      
      var CLICK_RADIUS = 15;
      var HANDLE_OPACITY = 0.2;
      
      var OBJECT_SMALL_RADIUS = 5;
      var OBJECT_BIG_RADIUS = 10;
    */
    
    var TEXT_FONT_SIZE = 20;
    var TEXT_FONT = TEXT_FONT_SIZE + 'px sans-serif';
    var TEXT_BOX_PADDING = 4;
    
    vg.PointDrawerOnce = function(div, image_url, canvas_width, options) {
	var that = (this === vg ? {} : this);
	
	options = vg.merge_options(options, DEFAULT_OPTIONS);
	
	var scale = null;
	var canvas = null;
	var canvas_pos = null;
	var ctx = null;
	
	// Most recent positions of the mouse and of a click
	var click_pos = null;
	var mouse_pos = null;	
		
	// Object with properties x, y
	var clicks = [];
	
	// if mouse gets too close to any point, save that fact
	var conflict_click_idx = null;

	var disabled = true;

	var counterdiv = null;

	var buttondiv = null;
	var binput = null;
	var binput_on = false;

	var timer = new VG.Timer();

	var button_text = 'Click here to confirm there is no ' + options.obj_singular;
	var button_text_clicked = 'There is no ' + options.obj_singular + ' (click again to undo)';

	var timer = new VG.Timer();

	// object with properties x, y, add, time
	var history = [];

	// todo: set up ground truth evaluation with segmentations 
	// and with number of instances that should be clicked

	var img = new Image();
	img.onload = setup;
	img.src = image_url;
	
	function GetClicks() {
	    var clicks_img = [];
	    for (var i=0; i<clicks.length; i++) {
		clicks_img.push({'x' : toImageCoords(clicks[i].x),
				 'y' : toImageCoords(clicks[i].y)});
	    }
	    return clicks_img;
	}
	
	that.GetAnswer = function() {
	    return {'clicks' : GetClicks(),
		    'history': history};
	}

	that.EvalAnswer = function() {
	    // check for completeness
	    if (clicks.length == 0 && !binput_on) 
		return 'incomplete';

	    var bChecked = false;
	    var bOK = true;
	    if (options.gt) {
		if (options.gt.bbox) {
		    bChecked = true;
		    bOK = false;
		    clicks_img = GetClicks();
		    if (options.gt.bbox.x) {
			var bx1 = options.gt.bbox.x;
			var by1 = options.gt.bbox.y;
			var bx2 = bx1 + options.gt.bbox.w;
			var by2 = by1 + options.gt.bbox.h;
		    
			//for (var j=0; j < clicks_img.length;j++) {
			j = 0;  
			var x = clicks_img[j].x;
			var y = clicks_img[j].y;
			if (x >= bx1 && x <= bx2 && y >= by1 && y <= by2) {
			    bOK = true; // at least one was clicked correctly
			    //break;
			}
			//}
		    } else {
			for (var i=0; i < options.gt.bbox.length; i++) {
			    var bx1 = options.gt.bbox[i].x;
			    var by1 = options.gt.bbox[i].y;
			    var bx2 = bx1 + options.gt.bbox[i].w;
			    var by2 = by1 + options.gt.bbox[i].h;
			
			    j = 0;
			    //for (var j=0; j < clicks_img.length;j++) {
			    var x = clicks_img[j].x;
			    var y = clicks_img[j].y;
			    if (x >= bx1 && x <= bx2 && y >= by1 && y <= by2) {
				bOK = true; // at least one was clicked correctly
				break;
			    }
			    //}
			    //if (bOK) {
			    //	break;
			    //}
			}
		    }
		}
		
		if (options.gt.num_min >= 0 && options.gt.num_min < 10) {
		    bChecked = true;
		    if (clicks.length < options.gt.num_min) {
			bOK = false;
		    }
		}
		
		if (options.gt.num_max <= 1000000) {
		    bChecked = true;
		    if (clicks.length > options.gt.num_max) {
			bOK = false;
		    }
		}
	    }
	
	    if (bChecked) {
		if (bOK) 
		    return 'good';
		else
		    return 'bad';
	    } else {
		return 'neutral';
	    }
	}

	function choose_scale(img) {
	    if (_.isNumber(options.max_width) && _.isNumber(options.max_height)) {
		var scale_h = img.width / options.max_width;
		var scale_v = img.height / options.max_height;
		return Math.max(scale_h, scale_v);
	    } else {
		return img.width / canvas_width;
	    }
	}
	
	function setup() {

	    // scale = img.width / canvas_width;
	    scale = choose_scale(img);
	    canvas_width = img.width / scale;
	    var canvas_height = img.height / scale;
	    canvas = $('<canvas>')
                .attr({'width': canvas_width,
                       'height': canvas_height})
                .css({'cursor': 'pointer'})
                .appendTo(div);
	    
	    canvas_pos = {'x': canvas.offset().left, 'y': canvas.offset().top};
	    ctx = canvas[0].getContext('2d');
	    canvas.mousemove(mousemove);
	    canvas.mousedown(mousedown);
	    canvas.mouseup(mouseup);
	    canvas.mouseout(mouseup);
	    
	    draw();
	    options.callback();

	    if (disabled)
		setCursor('pointer');

	    counterdiv = $('<div>').appendTo(div);
	    updateCounter();
	    
	    buttondiv = $('<div>').appendTo(div);
	    
	    binput=$('<button>')
	    .click(SwitchButton)
	    .text(button_text)
	    .addClass('btn btn-small btn-default padded')
	    .appendTo(buttondiv);
	    
	    if (disabled)
		binput.attr('disabled',true);	
	}

	function SwitchButton() {
	    if (binput_on) {
		// turning it off
		binput.text(button_text);
		binput_on = false;
		binput.removeClass('btn-danger').addClass('btn-default');
		disabled = false;
		counterdiv.attr('hidden',false);
		updateCounter();
		history.push({'a':'unconfirm','t':timer.total()});
	    } else {
		// turning it on
		binput.text(button_text_clicked);
		binput_on = true;
		binput.removeClass('btn-default').addClass('btn-danger');
		clicks = [];
		disabled = true;
		draw();
		counterdiv.attr('hidden',true);
		updateCounter();
		history.push({'a':'confirm','t':timer.total()});
	    }
	}
	
	function toCanvasCoords(x) { return x / scale; }
	function toImageCoords(x) { return x * scale; }
	function setCursor(cursor) { canvas.css('cursor', cursor); }
	
	function getPosition(e) {
	    var x = e.pageX - canvas_pos.x;
	    var y = e.pageY - canvas_pos.y;
	    return {'x': x, 'y': y};
	}

	function updateCounter() {
	    if (clicks.length == 1) {
		counterdiv.text("You found 1 " + options.obj_singular + " so far");
	    } else {
		counterdiv.text("You found " + String(clicks.length) + " instances of " + options.obj_singular + " so far");
	    }
	}
	
	function mousedown(e) {
	    if (disabled) return;
	    click_pos = getPosition(e);
	    
	    // TODO: timing
	    idx = detectConflict(click_pos);
	    if (idx !== null) {
		var x = clicks[idx].x;
		var y = clicks[idx].y;
		clicks.splice(idx,1); // remove the conflicting element
		history.push({'x':toImageCoords(x),'y':toImageCoords(y),'a':'remove','t':timer.total()});
	    } else {
		clicks.push(click_pos);
		history.push({'x':toImageCoords(click_pos.x),'y':toImageCoords(click_pos.y),'a':'add','t':timer.total()});
	    }
	    conflict_click_idx = null;

	    updateCounter();

	    if (clicks.length == 0) {
		buttondiv.attr('hidden',false);
		binput.attr('disabled',false);
	    } else {
		binput.attr('disabled',true);
		buttondiv.attr('hidden',true);
	    }
	
	    draw();
	}
	
	function mouseup(e) {
	    draw();
	}
	
	function mousemove(e) {
	    mouse_pos = getPosition(e);
	    conflict_click_idx = detectConflict(mouse_pos);
	    draw();
	}
	
	function detectConflict(pt) {
	    function dist(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	    }
	    var min_d = 10000000;
	    var idx = null;
	    for (var i=0;i<clicks.length;i++) {
		var d = dist(clicks[i].x,clicks[i].y,pt.x,pt.y);
		if (d < options.conflict_radius && d < min_d) {
		    min_d = d;
		    idx = i;
		}
	    }
	    return idx;
	}

	function drawClicks() {
	    ctx.save();

	    for (var i=0; i < clicks.length; i++) {
		var x = clicks[i].x;
		var y = clicks[i].y;

		ctx.globalAlpha = options.handle_opacity;
		ctx.beginPath();
		ctx.arc(x, y, options.click_radius, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fillStyle = "white";
		ctx.fill();
		
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.arc(x, y, options.click_radius/5, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fillStyle = "red";
		ctx.fill();

		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.arc(x, y, options.click_radius, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = "black";
		ctx.stroke();



		if (i == conflict_click_idx) {
		    ctx.beginPath();
		    ctx.moveTo(x-options.click_radius,y-options.click_radius);
		    ctx.lineTo(x+options.click_radius,y+options.click_radius);
		    ctx.moveTo(x-options.click_radius,y+options.click_radius);
		    ctx.lineTo(x+options.click_radius,y-options.click_radius);
		    ctx.strokeStyle = "red";
		    ctx.lineWidth = 3;
		    ctx.stroke();
		} else {
		}
	    }
	    
	    ctx.restore();
	}

	function drawMouse(x, y) {
	    return;

	    ctx.save();
	
	    ctx.beginPath();
	    ctx.arc(x, y, options.pointer_radius, 0, 2 * Math.PI);
	    ctx.closePath();
	    ctx.fill();

	    ctx.restore();
	}
	
	function draw() {
	    if (!ctx) return;
	    
	    ctx.clearRect(0, 0, canvas.width(), canvas.height());
	    ctx.save();
	    ctx.globalAlpha = options.image_opacity;
	    ctx.drawImage(img, 0, 0, canvas.width(), canvas.height());
	    ctx.restore();
	    	    
	    drawClicks();
	    
	    if (disabled) return;

	    if (mouse_pos) {
		drawMouse(mouse_pos.x, mouse_pos.y);
	    }
	}

	that.remove = function() {
	    canvas.remove();
	}
	
	
	that.enable = function() {
	    disabled = false;
	    timer.start();
	    if (binput) {
		binput.attr('disabled',false);
		if (binput_on) {
		    disabled = true;
		}
	    }
	    draw();
	}
	
	that.disable = function() {
	    disabled = true;
	    mouseup();
	    draw();
	    if (canvas)
		setCursor('pointer');
	    if (binput)
		binput.attr('disabled',true);
	    timer.stop();
	}
	
	
	return that;
    }
    
    return vg;
    
}(VG || {}, jQuery));

