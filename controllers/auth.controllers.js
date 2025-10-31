import User from "../model/user.js";
import bcrypt from "bcryptjs";


export const getLoginForm = (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', { 
        pageTitle: 'Admin Login',
        error: req.session.error // Check for previous login error
    });
    req.session.error = null; // Clear error after displaying
};


export const postLogin = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.session.error = 'Invalid username or password.';
            return req.session.save(() => {
                res.redirect('/login');
            });
        }

        const isMatch = await user.comparePassword(password);
        
        if (isMatch) {
            req.session.user = {
                id: user._id,
                name: user.name,
                role: user.role
            };
            req.session.isLoggedIn = true;
            
            return req.session.save(() => {
                res.redirect('/');
            });
            
        } else {
            req.session.error = 'Invalid username or password.';
            return req.session.save(() => {
                res.redirect('/login');
            });
        }

    } catch (error) {
        console.error("Login process error:", error);
        next(error);
    }
};

export const postLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/login');
    });
};