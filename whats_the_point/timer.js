var VG = (function(vg) {
    vg.Timer = function() {
	var that = (this === vg ? {} : this);
	var start_t = 0;
	var total_t = 0;

	that.start = function() {
	    start_t = new Date().getTime();
	}

	that.stop = function() {
	    if (start_t > 0) {
		total_t += new Date().getTime()-start_t;
		start_t = 0;
	    }
	}

	that.total = function () {
	    if (start_t > 0)
		return total_t + new Date().getTime()-start_t;
	    else
		return total_t;
	}
	
	return that;
    }
    
  return vg;

}(VG || {}));
