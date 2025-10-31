import User from "../model/user.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.render('users/index', {
            pageTitle: 'User Management',
            users: users,
            success: req.session.success,
            error: req.session.error
        });
        req.session.success = null;
        req.session.error = null;
    } catch (error) {
        next(error);
    }
};

export const getNewUserForm = (req, res) => {
    res.render('users/new', {
        pageTitle: 'Add New User',
    });
};

export const createUser = async (req, res, next) => {
    try {
        const { username, password, name, role } = req.body;

        if (!username || !password || !name || !role) {
            req.session.error = 'All fields are required.';
            return req.session.save(() => res.redirect('/users/new'));
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.session.error = 'Username already taken.';
            return req.session.save(() => res.redirect('/users/new'));
        }

        const newUser = new User({ username, password, name, role });
        await newUser.save();
        
        req.session.success = `${role} user ${name} created successfully!`;
        req.session.error = null;
        res.redirect('/users');
        
    } catch (error) {
        if (error.code === 11000) { 
             req.session.error = 'Username already exists.';
             return req.session.save(() => res.redirect('/users/new'));
        }
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            req.session.error = 'User not found.';
            return req.session.save(() => res.redirect('/users'));
        }
        
        if (deletedUser.role === 'Admin' && req.session.user.id.toString() === id) {
             req.session.error = 'Cannot delete your own admin account.';
             return req.session.save(() => res.redirect('/users'));
        }

        req.session.success = `User ${deletedUser.name} deleted successfully.`;
        req.session.error = null;
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};