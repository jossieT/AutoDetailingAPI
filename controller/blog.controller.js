const blogService = require('../services/blog.service');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const { userService } = require('../services');

const createBlog = catchAsync(async (req, res) => {
    // Handle image upload
    let uploadedImage = null;
    if (req.file) {
        uploadedImage = req.file.path; // Cloudinary URL
        req.body.image = uploadedImage;
    }

    
    // Find admin user and set as author
    const adminUser = await userService.findAdminUser();
    if (!adminUser) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Admin user not found'
        });
    }
    req.body.author = adminUser._id;
    
    const blog = await blogService.createBlog(req.body);
    res.status(httpStatus.CREATED).json({
        status: 'success',
        data: blog
    });
});

const getAllBlogs = catchAsync(async (req, res) => {
    const blogs = await blogService.getAllBlogs();
    res.status(httpStatus.OK).json({
        status: 'success',
        data: blogs
    });
});

const getBlogById = catchAsync(async (req, res) => {
    const blog = await blogService.getBlogById(req.params.id);
    res.status(httpStatus.OK).json({
        status: 'success',
        data: blog
    });
});

const updateBlogById = catchAsync(async (req, res) => {
    // Handle image upload for updates
    if (req.file) {
        req.body.image = req.file.path;
    }

    // Structure the localized content for update
    const updateData = {};
    
    if (req.body['title[en]'] || req.body['title[am]']) {
        updateData.title = {
            ...(req.body['title[en]'] && { en: req.body['title[en]'] }),
            ...(req.body['title[am]'] && { am: req.body['title[am]'] })
        };
    }
    
    if (req.body['content[en]'] || req.body['content[am]']) {
        updateData.content = {
            ...(req.body['content[en]'] && { en: req.body['content[en]'] }),
            ...(req.body['content[am]'] && { am: req.body['content[am]'] })
        };
    }

    if (req.body.image) {
        updateData.image = req.body.image;
    }

    const blog = await blogService.updateBlogById(req.params.id, updateData);
    res.status(httpStatus.OK).json({
        status: 'success',
        data: blog
    });
});

const deleteBlogById = catchAsync(async (req, res) => {
    await blogService.deleteBlogById(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};