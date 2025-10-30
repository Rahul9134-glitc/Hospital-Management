export const get404 = (req, res, next) => {
    res.status(404).render('errors/404', {
        pageTitle: 'Page Not Found',
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user // Pass user for header context
    });
};

export const get500 = (error, req, res, next) => {
    // Log the detailed error for debugging purposes (optional but recommended)
    console.error(error.stack); 
    
    res.status(500).render('errors/500', {
        pageTitle: 'Server Error',
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user,
        errorMessage: process.env.NODE_ENV === 'production' ? 'Something went wrong on the server. Please try again later.' : error.message
    });
};