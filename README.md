# annotation-UIs

This repository contains image annotation UIs used for various projects at Stanford University.

Authors: [Olga Russakovsky](http://cs.cmu.edu/~orussako) (olga@cs.stanford.edu) and [Justin Johnson](http://cs.stanford.edu/people/jcjohns/)

### Entrypoint

The entry point for the UIs is all_actions.html. You can open it in your browser to see a set of sample tasks and check out the UIs.

### Annotating images on Amazon Machanical Turk

The simplest backend to use with these templates is [simple-amt](https://github.com/jcjohnson/simple-amt)

**Important**: make sure to put in absolute rather than relative paths, e.g.,

//image-net.org/path/to/you/file

Search for 'absolute' in the code -- most places should be marked with comments. You'll need to do it in
- best_of_both_world/all_actions.html
- best_of_both_worlds/instructions.html
- best_of_both_worlds/task_header.js
- whats_the_point/all_actions.html
- all image paths

### References

If you find the UIs useful in your research, please cite:

**best_of_both_worlds**

Project page: http://ai.stanford.edu/~olga/best_of_both_worlds

	@inproceedings{RussakovskyCVPR15,
	author = {Olga Russakovsky and Li-Jia Li and Li Fei-Fei}, 
	title = {Best of both worlds: human-machine collaboration for object annotation},	
	booktitle = {CVPR},
	year = {2015}
	} 

**whats_the_point**

Project page: http://vision.stanford.edu/whats_the_point

    @article{Bearman15,
    author = {Amy Bearman and Olga Russakovsky and Vittorio Ferrari and Li Fei-Fei},
    title = {What's the point: Semantic segmentation with point supervision},
    journal = {ArXiv e-prints},
    eprint = {1506.02106}, 
    year = {2015}
    }

