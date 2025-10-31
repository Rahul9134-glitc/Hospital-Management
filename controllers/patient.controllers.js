import Patient from "../model/patient.js";

export const getAllPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find({});
        
        res.render('patients/index', {
            pageTitle: 'All Patients',
            patients: patients
        });
    } catch (error) {

        next(error); 
    }
};

export const renderNewPatientForm = (req, res) => {
    res.render('patients/new', {
        pageTitle: 'Add New Patient'
    });
};

export const createPatient = async (req, res, next) => {
    try {
        const newPatient = new Patient(req.body); 
        await newPatient.save();
        res.redirect('/patients'); 
        
    } catch (error) {
        error.statusCode = 400; 
        next(error);
    }
};

export const getPatient = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const patient = await Patient.findById(id); 

        if (!patient) {
            const error = new Error('Patient not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('patients/show', {
            pageTitle: `Patient: ${patient.name}`,
            patient
        });

    } catch (error) {
        if (error.kind === 'ObjectId') {
             error.statusCode = 404;
             error.message = 'Invalid patient ID format.';
        }
        next(error); 
    }
};

export const deletePatient = async(req,res,next)=>{
    try{
        const {id}= req.params;

        const DeletedPatient = await Patient.findByIdAndDelete(id);

        if (!DeletedPatient) {
            const error = new Error('Patient not found for deletion.');
            error.statusCode = 404;
            return next(error);
        }
        res.redirect('/patients');
    }
    catch{
        if (error.kind === 'ObjectId') {
             error.statusCode = 400;
             error.message = 'Invalid patient ID format.';
        }
        next(error);
    }
}

export const renderEditPatientForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id);

        if (!patient) {
            const error = new Error('Patient not found for editing.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('patients/edit', {
            pageTitle: `Edit: ${patient.name}`,
            patient
        });
    } catch (error) {
         if (error.kind === 'ObjectId') {
             error.statusCode = 404;
             error.message = 'Invalid patient ID format.';
        }
        next(error); 
    }
};

export const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // findByIdAndUpdate: {new: true} नया अपडेटेड ऑब्जेक्ट रिटर्न करेगा, 
        // {runValidators: true} सुनिश्चित करता है कि स्कीमा में सेट validators चलें
        const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedPatient) {
            const error = new Error('Patient not found for updating.');
            error.statusCode = 404;
            return next(error);
        }
        
        // अपडेट के बाद विवरण पेज पर रीडायरेक्ट करें
        res.redirect(`/patients/${updatedPatient._id}`); 
        
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
};