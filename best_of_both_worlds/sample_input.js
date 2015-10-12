var VG = (function(vg) {

    vg.SampleInput = function() {
	var that = (this === vg ? {} : this);

	that.get = function(index) {
	    // ignores 'index' currently, but you can set it up to provide different inputs
	    // depending on the index, for easy debugging
	    return {"questions": [{"img_id": "ILSVRC2013_val_00002683","gt": 1,"class": 60,"object_name": "dragonfly","image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2013_val_00002683.JPEG","task": "vi"},{"img_id": "ILSVRC2012_val_00008738","gt": 1,"class": 171,"box": {"x": 309,"y": 108,"w": 157,"h": 104},"object_name": "strawberry","image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2012_val_00008738.JPEG","task": "vb"},{"img_id": "ILSVRC2012_val_00030313","gt": {"x": 81,"y": 67,"w": 201,"h": 280},"class": 113,"boxes": {"x": 110,"y": 30,"w": 138,"h": 77},"object_name": "monkey","image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2012_val_00030313.JPEG","task": "db"},{"img_id": "ILSVRC2012_val_00028723","gt": -1,"class": 71,"boxes": {"x": 1,"y": 1,"w": 375,"h": 178},"object_name": "french horn","image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2012_val_00028723.JPEG","task": "vc"},{"img_id": "ILSVRC2012_val_00003154","box": {"x": 258,"y": 247,"w": 104,"h": 174},"gt": -1,"image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2012_val_00003154.JPEG","task": "vo"},{"img_id": "ILSVRC2013_val_00003000","box": {"x": 438,"y": 260,"w": 62,"h": 79},"gt": -1,"image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2013_val_00003000.JPEG","task": "wn"},{"img_id": "ILSVRC2012_val_00018661","class": 77,"curr_classes": 37,"object_name": "golfcart","curr_object_names": "car","image_url": "http://www.image-net.org/image/ilsvrc2013/ILSVRC2013_DET_val/ILSVRC2012_val_00018661.JPEG","task": "wt","meta": {"gt_img_ids": 8702,"gt_obj_labels": [37,77],"gt_obj_bboxes": [[0,129],[144,134],[49,342],[203,352]],"w": 500,"h": 375,"gt_img_name": "ILSVRC2012_val_00018661","amt_gt": 1}}],"accuracy": 0.99};
	}
	
	return that;
    }
    
    return vg;
    
}(VG || {}));
