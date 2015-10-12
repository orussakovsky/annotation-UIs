var VG = (function(vg, $) {

    var DEFAULT_OPTIONS = {
	//static_box_color: '#f00',
	static_box_color: 'red',
	bbox_color: '#00f',
	bbox_line_width: 5.0,
	click_radius: 15,
	handle_opacity: 0.2,
	dot_small_radius: 5,
	dot_big_radius: 10,
	image_opacity: 0.9,
	max_height: 300,
	max_width: 500,
	include_button: false,
	button_text: 'Click here if no box can be drawn',
	button_text_clicked: 'No box can be drawn (click again to undo)',
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
    
    vg.BBoxDrawer = function(div, image_url, canvas_width, options) {
	var that = (this === vg ? {} : this);
	
	options = vg.merge_options(options, DEFAULT_OPTIONS);
	
	var scale = null;
	var canvas = null;
	var canvas_pos = null;
	var ctx = null;
	
	// Most recent positions of the mouse and of a click
	var click_pos = null;
	var mouse_pos = null;
	
	// Whether the box has been been finalized after the initial drag
	var bbox_drawn = false;
	
	// Object with properties x, y, w, h
	var bbox = null;
	var static_boxes = [];
	
	var object_pos = null;
	var object_name = null;
	
	var resize_direction = null;
	var old_bbox = null;
	
	var disabled = true;

	var binput = null;
	var binput_on = false;

	var p_thr_gt = 10;
	var iou_thr_gt = 0.6;
	var p_thr_box = 10;
	var iou_thr_box = 0.8;

	var cursors = {
	    'UL': 'nw-resize',
	    'UR': 'ne-resize',
	    'BL': 'sw-resize',
	    'BR': 'se-resize',
	    'U': 'n-resize',
	    'R': 'e-resize',
	    'L': 'w-resize',
	    'B': 's-resize',
	};
	
	var img = new Image();
	img.onload = setup;
	img.src = image_url;
	
	that.getBoxPosition = function() {
	    if (bbox) {
		// Convert to image coordinates
		return {
		    'x': toImageCoords(bbox.x),
		    'y': toImageCoords(bbox.y),
		    'w': toImageCoords(bbox.w),
		    'h': toImageCoords(bbox.h)
		};
	    }
	    return null;
	}
	
	that.GetAnswer = function() {
	    if (binput && binput_on)
		return -1;
	    else if (bbox)
		return that.getBoxPosition();
	    else
		return null;
	}

	that.EvalAnswer = function() {
	    if (binput && binput_on) { // thinks there's no box
		if (options.gt == null)
		    return 'neutral'; // no idea if it's ok
		else if (options.gt == -1)
		    return 'good'; // verified
		else {
		    return 'bad'; // gt disagrees
		}
	    } else if (bbox && isValidBox()) { // drew a reasonable box
		box_ans = that.getBoxPosition();
		if (options.gt == null) { // nothing to check
		    return 'neutral';
		} else if (options.gt == -1) { // wrong
		    return 'bad';
		} else {
		    if (tooclose_any(box_ans,options.gt,p_thr_gt,iou_thr_gt)) { // close enough
			return 'good';
		    } else {
			return 'bad';
		    }
		}
	    } else {
		return 'incomplete';
	    }
	}

	that.setObject = function(x, y, name) {
	    if (scale) {
		object_pos = {'x': toCanvasCoords(x), 'y': toCanvasCoords(y)};
	    } else {
		object_pos = {'x': x, 'y': y};
	    }
	    object_name = name;
	}
	
	that.addStaticBox = function(box) {
	    sb = $.extend({}, box);
	    if (scale) {
		sb.x = toCanvasCoords(box.x);
		sb.y = toCanvasCoords(box.y);
		sb.w = toCanvasCoords(box.w);
		sb.h = toCanvasCoords(box.h);
	    }
	    static_boxes.push(sb);
	    draw();
	}
	that.addStaticBoxes = function(boxes) {
	    if (typeof(boxes.x) === 'undefined') {
		for (var i=0; i < boxes.length; i++) {
		    that.addStaticBox(boxes[i]);
		}
	    } else {
		that.addStaticBox(boxes);
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
                .css({'cursor': 'crosshair'})
                .appendTo(div);
	    
	    canvas_pos = {'x': canvas.offset().left, 'y': canvas.offset().top};
	    ctx = canvas[0].getContext('2d');
	    canvas.mousemove(mousemove);
	    canvas.mousedown(mousedown);
	    canvas.mouseup(mouseup);
	    canvas.mouseout(mouseup);
	    
	    if (object_pos) {
		object_pos.x = toCanvasCoords(object_pos.x);
		object_pos.y = toCanvasCoords(object_pos.y);
	    }
	    
	    // Convert the static box from image coordinates to canvas coordinates
	    var props = ['x', 'y', 'w', 'h'];
	    for (var k=0; k < static_boxes.length; k++) {
		for (var i = 0; i < props.length; i++) {
	            static_boxes[k][props[i]] = toCanvasCoords(static_boxes[k][props[i]]);
		}
	    }
	    
	    draw();
	    options.callback();

	    if (disabled)
		setCursor('pointer');

	    if (options.include_button) {
		var bdiv = $('<div>').appendTo(div);

		binput=$('<button>')
		    .click(SwitchButton)
		    .text(options.button_text)
		    .addClass('btn btn-lg btn-default padded')
		    .appendTo(bdiv);
		if (disabled)
		    binput.attr('disabled',true);	
	    }
	}

	function SwitchButton() {
	    if (binput_on) {
		// turning it off
		binput.text(options.button_text);
		binput_on = false;
		binput.removeClass('btn-danger').addClass('btn-default');
		disabled = false;
	    } else {
		// turning it on
		binput.text(options.button_text_clicked);
		binput_on = true;
		binput.removeClass('btn-default').addClass('btn-danger');
		bbox = null;
		bbox_drawn = false;
		disabled = true;
		draw();
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
	
	function mousedown(e) {
	    if (disabled) return;
	    click_pos = getPosition(e);
	    if (bbox) {
		resize_direction = detectCollision(click_pos.x, click_pos.y, bbox);
		if (resize_direction) {
		    old_bbox = $.extend({}, bbox);
		}
	    }
	}
	
	function mouseup(e) {
	    click_pos = null;
	    resize_direction = null;
	    if (bbox) {
		bbox_drawn = true;
		setCursor('pointer');
	    }
	    draw();
	}
	
	function mousemove(e) {
	    mouse_pos = getPosition(e);
	    updateBBox();
	    
	    if (bbox && !click_pos && !disabled) {
		var collision = detectCollision(mouse_pos.x, mouse_pos.y, bbox);
		
		if (cursors.hasOwnProperty(collision)) {
		    setCursor(cursors[collision]);
		} else {
		    setCursor('pointer');
		}
	    }
	    
	    draw();
	}
	
	function detectCollision(x, y, box) {
	    function dist(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	    }
	    if (dist(x, y, box.x, box.y) < options.click_radius) {
		return 'UL';
	    } else if (dist(x, y, box.x + box.w, box.y) < options.click_radius) {
		return 'UR';
	    } else if (dist(x, y, box.x, box.y + box.h) < options.click_radius) {
		return 'BL';
	    } else if (dist(x, y, box.x + box.w, box.y + box.h)
                       < options.click_radius) {
		return 'BR';
	    } else if (Math.abs(box.x - x) < options.click_radius) {
		return 'L';
	    } else if (Math.abs(box.x + box.w - x) < options.click_radius) {
		return 'R';
	    } else if (Math.abs(box.y - y) < options.click_radius
                       && x >= bbox.x && x <= bbox.x + bbox.w) {
		return 'U';
	    } else if (Math.abs(box.y + box.h - y) < options.click_radius
                       && y >= bbox.y && y <= bbox.y + bbox.h) {
		return 'B';
	    }
	    
	    return null;
	}
	
	function updateBBox() {
	    function makeBBox(x1, y1, x2, y2) {
		var x = Math.min(x1, x2);
		var y = Math.min(y1, y2);
		var w = Math.max(x1, x2) - x;
		var h = Math.max(y1, y2) - y;
		return {'x': x, 'y': y, 'w': w, 'h': h};
	    }
	    if (!bbox_drawn && click_pos && mouse_pos) {
		bbox = makeBBox(click_pos.x, click_pos.y, mouse_pos.x, mouse_pos.y);
	    } else if (bbox_drawn && click_pos && mouse_pos && resize_direction) {
		var x1 = old_bbox.x;
		var x2 = old_bbox.x + old_bbox.w;
		var y1 = old_bbox.y;
		var y2 = old_bbox.y + old_bbox.h;
		if (resize_direction === 'L'
		    || resize_direction === 'UL'
		    || resize_direction === 'BL') {
		    x1 = mouse_pos.x;
		}
		if (resize_direction === 'R'
		    || resize_direction === 'UR'
		    || resize_direction === 'BR') {
		    x2 = mouse_pos.x;
		}
		if (resize_direction === 'U'
		    || resize_direction === 'UR'
		    || resize_direction === 'UL') {
		    y1 = mouse_pos.y;
		}
		if (resize_direction === 'B'
		    || resize_direction === 'BR'
		    || resize_direction === 'BL') {
		    y2 = mouse_pos.y;
		}
		bbox = makeBBox(x1, y1, x2, y2);
	    }
	}
	
	function drawBox(box, box_color) {
	    ctx.save();
	    
	    function r(x) { return Math.floor(x); }
	    
	    ctx.strokeStyle = box_color;
	    ctx.lineWidth = options.bbox_line_width;
	    ctx.strokeRect(r(box.x), r(box.y), r(box.w), r(box.h));
	    
	    ctx.restore();
	}
	
	function drawCrosshair(x, y) {
	    y = Math.floor(y) + 0.5;
	    x = Math.floor(x) + 0.5;
	    
	    ctx.save();
	    ctx.lineWidth = 3;
	    ctx.strokeStyle = '#fff';
	    ctx.globalAlpha = 0.3;
	    
	    ctx.beginPath();
	    ctx.moveTo(x, 0);
	    ctx.lineTo(x, canvas.height());
	    ctx.stroke();
	    
	    ctx.beginPath();
	    ctx.moveTo(0, y);
	    ctx.lineTo(canvas.width(), y);
	    ctx.stroke();
	    
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = '#000';
	    ctx.globalAlpha = 1.0;
	    
	    ctx.beginPath();
	    ctx.moveTo(x, 0);
	    ctx.lineTo(x, canvas.height());
	    ctx.stroke();
	    
	    ctx.beginPath();
	    ctx.moveTo(0, y);
	    ctx.lineTo(canvas.width(), y);
	    ctx.stroke();
	    
	    ctx.restore();
	}
	
	function drawHandle(x, y) {
	    ctx.save();
	    ctx.globalAlpha = options.handle_opacity;
	    
	    ctx.beginPath();
	    ctx.arc(x, y, options.click_radius, 0, 2 * Math.PI);
	    ctx.closePath();
	    ctx.fill();
	    
	    ctx.restore();
	}

	function drawText(x,y,words) {
	    // Draw the text box
	    var width = ctx.measureText(words).width/2;
	    
	    ctx.fillStyle = '#fff';
	    ctx.strokeStyle = '#fff';
	    ctx.beginPath();
	    var x1 = x - width - TEXT_BOX_PADDING;
	    var x2 = x + width + TEXT_BOX_PADDING;
	    var y1 = y + options.dot_big_radius + 1.5 * TEXT_BOX_PADDING;
	    var y2 = y1 + 1.5 * TEXT_BOX_PADDING + TEXT_FONT_SIZE;
	    ctx.moveTo(x1, y1);
	    ctx.lineTo(x1, y2);
	    ctx.lineTo(x2, y2);
	    ctx.lineTo(x2, y1);
	    ctx.closePath();
	    ctx.fill();
	    ctx.stroke();
	    
	    ctx.font = TEXT_FONT;
	    ctx.fillStyle = '#f00';
	    var tx = x - width;
	    var ty = y + TEXT_FONT_SIZE + 2.5 * TEXT_BOX_PADDING + options.dot_big_radius;
	    ctx.fillText(words, tx, ty);
	    
	    ctx.fillStyle = '#000';
	    ctx.strokeStyle = '#000';
	}
	
	function drawObject(x, y, name, emphasized) {
	    ctx.save();
	    ctx.fillStyle = options.bbox_color;
	    
	    var r = emphasized ? options.dot_big_radius : options.dot_small_radius;
	    
	    ctx.beginPath();
	    ctx.arc(x, y, r, 0, 2 * Math.PI);
	    ctx.closePath();
	    ctx.fill();
	    ctx.stroke();
	    
	    if (emphasized) {
		drawText(x,y,name);
	    }
	    
	    ctx.restore();
	}
	
	function draw() {
	    if (!ctx) return;
	    
	    ctx.clearRect(0, 0, canvas.width(), canvas.height());
	    ctx.save();
	    ctx.globalAlpha = options.image_opacity;
	    ctx.drawImage(img, 0, 0, canvas.width(), canvas.height());
	    ctx.restore();
	    	    
	    for (var i=0; i < static_boxes.length; i++) {
		drawBox(static_boxes[i], options.static_box_color);
	    }
	    
	    if (disabled) return;

	    if (object_name && object_pos) {
		var emphasized = false;
		if (mouse_pos) {
		    var dx = mouse_pos.x - object_pos.x;
		    var dy = mouse_pos.y - object_pos.y;
		    if (Math.sqrt(dx * dx + dy * dy) < options.click_radius) {
			emphasized = true;
		    }
		}
		
		drawObject(object_pos.x, object_pos.y, object_name, emphasized);
	    }
	    
	    if (bbox) {
		if (bbox_drawn) {
		    drawHandle(bbox.x, bbox.y);
		    drawHandle(bbox.x + bbox.w, bbox.y);
		    drawHandle(bbox.x, bbox.y + bbox.h);
		    drawHandle(bbox.x + bbox.w, bbox.y + bbox.h);
		} else {
		    drawCrosshair(bbox.x, bbox.y);
		    drawCrosshair(bbox.x + bbox.w, bbox.y + bbox.h);
		}
		drawBox(bbox, options.bbox_color);
		isValidBox();
	    } else if (mouse_pos) {
		drawCrosshair(mouse_pos.x, mouse_pos.y);
	    }
	}

	function isValidBox() {
	    if (!bbox) {
		return true;
	    }

	    // check if too close to static boxes
	    var bTooClose = tooclose_any(bbox,static_boxes,p_thr_box,iou_thr_box);
	    if (bTooClose) {
		drawText(bbox.x+bbox.w/2,bbox.y,'Too close to existing box');
	    }
	    return !bTooClose;
	}

	function tooclose_any(bbox1,bboxes_set,p_thr,iou_thr) {
	    if (typeof(bboxes_set.x) === 'undefined') {
		for (var i=0; i < bboxes_set.length;i++) {
		    if (tooclose(bbox1,bboxes_set[i],p_thr,iou_thr)) {
			return true;
		    }
		}
		return false;
	    } else {
		return tooclose(bbox1,bboxes_set,p_thr,iou_thr);
	    }
	}

	function tooclose(bbox1,bbox2,p_thr,iou_thr) {
	    if ((Math.abs(bbox1.x - bbox2.x) < p_thr) &&
		(Math.abs(bbox1.y - bbox2.y) < p_thr) &&
		(Math.abs(bbox1.x+bbox1.w - bbox2.x-bbox2.w) < p_thr) &&
		(Math.abs(bbox1.y+bbox1.h - bbox2.y-bbox2.h) < p_thr)) {
		return true;
	    } else {
		var bi = {'x1': Math.max(bbox1.x,bbox2.x),
			  'y1': Math.max(bbox1.y,bbox2.y),
			  'x2': Math.min(bbox1.w+bbox1.x,bbox2.w+bbox2.x),
			  'y2': Math.min(bbox1.h+bbox1.y,bbox2.h+bbox2.y)};
		bi.w = bi.x2-bi.x1;
		bi.h = bi.y2-bi.y1;
		if (bi.w > 0 && bi.h > 0) {
		    var ua = bbox1.w*bbox1.h + bbox2.w*bbox2.h - bi.w*bi.h;
		    var iou = bi.w*bi.h/ua;
		    //console.log({'iou':iou,'bbox1':bbox1,'bbox2':bbox2});
		    if (iou > iou_thr) {
			return true;
		    }
		}
	    }
	    return false;
	}
	
	that.remove = function() {
	    canvas.remove();
	}
	
	
	that.enable = function() {
	    disabled = false;
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
	}
	
	
	return that;
    }
    
    return vg;
    
}(VG || {}, jQuery));

