const express = require('express');
const blogController = require('../controller/blog.controller');
const validate = require('../middlewares/validate');
const blogValidation = require('../validations/blog.validation');
const router = express.Router();

router.post('/', validate(blogValidation.createBlogSchema), blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.get('/:id', validate(blogValidation.getBlogSchema), blogController.getBlogById);
router.put('/:id', validate(blogValidation.updateBlogSchema), blogController.updateBlogById);
router.delete('/:id', validate(blogValidation.deleteBlogSchema), blogController.deleteBlogById);

module.exports = router;