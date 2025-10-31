export const isAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};

export const isAdmin = (req, res, next) => {
    // Check if user is logged in AND their role is 'Admin'
    if (req.session.user && req.session.user.role === 'Admin') {
        next(); // User is Admin, allow access
    } else {
        // Not Admin, deny access
        const error = new Error('Access Denied. Only Administrators can perform this action.');
        error.statusCode = 403; // Forbidden
        // Redirect to dashboard or login
        res.redirect('/'); 
    }
};