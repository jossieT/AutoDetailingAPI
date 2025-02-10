const Blog = require('../model/blog.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const createBlog = async (blogData) => {
    const blog = new Blog(blogData);
    return await blog.save();
};

const getAllBlogs = async () => {
    return await Blog.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 }); // Latest blogs first
};

const getBlogById = async (id) => {
    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    return blog;
};

const updateBlogById = async (id, updateData) => {
    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    // Update only provided fields while preserving existing translations
    return blog;
};

const deleteBlogById = async (id) => {
    const blog = await Blog.findById(id);
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    return await blog.deleteOne({ _id: id });
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};