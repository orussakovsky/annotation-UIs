var VG = (function(vg) {

    vg.SampleInput = function() {
	var that = (this === vg ? {} : this);

	that.get = function(index) {
	    if (!index) { 
		// IMPORTANT: before submitting to AMT, make sure all image_urls are absolute paths, e.g.,
		//     "image_url": "//image-net.org/path/to/images/"
		//
		return {"questions": [{"img_id": "2011_000269","image_url": "pascal_images/2011_000269.jpg"},{"img_id": "2010_004385","image_url": "pascal_images/2010_004385.jpg"},{"img_id": "2011_000068","image_url": "pascal_images/2011_000068.jpg"},{"img_id": "2010_003526","image_url": "pascal_images/2010_003526.jpg","gt": {"bbox": {"x": 115,"y": 130,"w": 224,"h": 245},"num_min": 1,"num_max": 1}},{"img_id": "2010_005016","image_url": "pascal_images/2010_005016.jpg"}],"accuracy": 0.85,"object_name": "bird","object_plural": "birds"};
	    }

	}
	
	return that;
    }
    
    return vg;
    
}(VG || {}));
