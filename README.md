# annotation-UIs

This repository contains image annotation UIs used for various projects at Stanford University.

Authors: Olga Russakovsky (olga@cs.stanford.edu) and Justin Johnson

## Annotating images on Amazon Machanical Turk

The simplest backend to use with these templates is [simple-amt](https://github.com/jcjohnson/simple-amt)

The entry point for the UIs is all_actions.html

**Important**: make sure to put in absolute rather than relative paths (in all_actions.html and for image paths), e.g.,

//image-net.org/path/to/you/file

## References

If you find the UIs useful in your research, please cite:

### whats_the_point

    @article{Bearman15,
	author = {Amy Bearman and Olga Russakovsky and Vittorio Ferrari and Li Fei-Fei},
	title = {What's the point: Semantic segmentation with point supervision},
	journal = {ArXiv e-prints},
	eprint = {1506.02106}, 
	year = {2015}
    }

Project page: [http://vision.stanford.edu/whats_the_point/](http://vision.stanford.edu/whats_the_point/)



