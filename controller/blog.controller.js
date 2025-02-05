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
    } else if (req.body.image) {
        uploadedImage = req.body.image;
    }
    
    // Find admin user
    const adminUser = await userService.findAdminUser();
    if (!adminUser) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Admin user not found'
        });
    }
    
    // Set author as admin
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
    if (!blog) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: 'error',
            message: 'Blog not found'
        });
    }
    res.status(httpStatus.OK).json({
        status: 'success',
        data: blog
    });
});

const updateBlogById = catchAsync(async (req, res) => {
    // Handle image upload for updates
    if (req.file) {
        req.body.image = req.file.path;
    } else if (!req.body.image) {
        // Keep existing image if no new image is provided
        const existingBlog = await blogService.getBlogById(req.params.id);
        if (existingBlog) {
            req.body.image = existingBlog.image;
        }
    }

    const blog = await blogService.updateBlogById(req.params.id, req.body);
    if (!blog) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: 'error',
            message: 'Blog not found'
        });
    }
    res.status(httpStatus.OK).json({
        status: 'success',
        data: blog
    });
});

const deleteBlogById = catchAsync(async (req, res) => {
    const blog = await blogService.deleteBlogById(req.params.id);
    if (!blog) {
        return res.status(httpStatus.NOT_FOUND).json({
            status: 'error',
            message: 'Blog not found'
        });
    }
    res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Blog deleted successfully'
    });
});

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};