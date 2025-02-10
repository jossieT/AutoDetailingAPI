const express = require('express');
const blogController = require('../controller/blog.controller');
const validate = require('../middlewares/validate');
const blogValidation = require('../validations/blog.validation');
const { authenticate, adminAuth } = require('../middlewares/auth');
const { uploadBlogImages } = require('../middlewares/multer');
const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Blogs
 *   description: Blog management APIs
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the blog post
 *         content:
 *           type: string
 *           description: The content of the blog post
 *         image:
 *           type: string
 *           description: URL of the blog post image
 *         author:
 *           type: string
 *           description: The ID of the user who wrote the blog post
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Server error
 * 
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog post by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog post not found
 *   
 *   put:
 *     summary: Update a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 *   
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */

// Create a new blog post (admin only)
router.post('/', 
 
    uploadBlogImages.single('image'),
    validate(blogValidation.createBlogSchema), 
    blogController.createBlog
);

// Get all blog posts (public)
router.get('/', blogController.getAllBlogs);

// Get a blog post by ID (public)
router.get('/:id', validate(blogValidation.getBlogSchema), blogController.getBlogById);

// Update a blog post (admin only)
router.patch('/:id', 
    //authenticate, 
    //adminAuth, 
    uploadBlogImages.single('image'),
    validate(blogValidation.updateBlogSchema), 
    blogController.updateBlogById
);

// Delete a blog post (admin only)
router.delete('/:id',  validate(blogValidation.deleteBlogSchema), blogController.deleteBlogById);

module.exports = router;