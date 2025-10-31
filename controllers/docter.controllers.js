import Doctor from "../model/docter.js";

export const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find({});
        res.render('doctors/index', {
            pageTitle: 'All Doctors',
            doctors: doctors
        });
    } catch (error) {
        next(error); 
    }
};

export const renderNewDoctorForm = (req, res) => {
    res.render('doctors/new', {
        pageTitle: 'Add New Doctor'
    });
};

export const createDoctor = async (req, res, next) => {
    try {
        const newDoctor = new Doctor(req.body); 
        await newDoctor.save();
        res.redirect('/doctors');
    }
    catch (error) {
        error.statusCode = 400; 
        next(error);
    }
}

export const getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id); 

        if (!doctor) {
            const error = new Error('Doctor not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('doctors/show', {
            pageTitle: `Doctor: ${doctor.name}`,
            doctor
        });

    } catch (error) {
        if (error.kind === 'ObjectId') {
             error.statusCode = 404;
             error.message = 'Invalid doctor ID format.';
        }
        next(error); 
    }
};

export const renderEditDoctorForm = async (req, res, next) => {
    try {
        const {id} = req.params;
        const doctor = await Doctor.findById(id);

        if (!doctor) {
            const error = new Error('Doctor not found for editing.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('doctors/edit', {
            pageTitle: `Edit: ${doctor.name}`,
            doctor
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             error.statusCode = 404;
             error.message = 'Invalid doctor ID format.';
        }
        next(error); 
    }
};

export const updateDoctor = async (req, res, next) => {
    try {
        const {id} = req.params;
        const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedDoctor) {
            const error = new Error('Doctor not found for updating.');
            error.statusCode = 404;
            return next(error);
        }
        
        res.redirect(`/doctors/${updatedDoctor._id}`); 
        
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
};

export const deleteDoctor = async (req, res, next) => {
    try {
        const {id} = req.params;
        const deletedDoctor = await Doctor.findByIdAndDelete(id);

        if (!deletedDoctor) {
            const error = new Error('Doctor not found for deletion.');
            error.statusCode = 404;
            return next(error);
        }
        
        res.redirect('/doctors'); 

    } catch (error) {
        if (error.kind === 'ObjectId') {
             error.statusCode = 400;
             error.message = 'Invalid doctor ID format.';
        }
        next(error); 
    }
};