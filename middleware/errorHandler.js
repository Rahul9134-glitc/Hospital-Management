const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    console.error(err.stack);

    res.status(statusCode).render('error', {
        error: {
            status: statusCode,
            message: err.message || 'Something went wrong on the server.',
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        },
        pageTitle: `Error ${statusCode}` 
    });
};

export default errorHandler;