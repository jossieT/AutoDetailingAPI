const Blog = require('../model/blog.model');

const createBlog = async (blogData) => {
    const blog = new Blog(blogData);
    return await blog.save();
};

const getAllBlogs = async () => {
    return await Blog.find().populate('author', 'name email');
};

const getBlogById = async (id) => {
    return await Blog.findById(id).populate('author', 'name email');
};

const updateBlogById = async (id, updateData) => {
    return await Blog.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteBlogById = async (id) => {
    return await Blog.findByIdAndDelete(id);
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};