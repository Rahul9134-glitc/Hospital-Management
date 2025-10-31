import Patient from "../Model/patient.js";
import Doctor from "../Model/docter.js";
import sendEmail from "../utils/EmailServices.js";
import Appointment from "../Model/appointment.js";

export const createAppointment = async (req, res, next) => {
    try {
        const newAppointment = new Appointment(req.body); 
        await newAppointment.save();

        const patientRecord = await Patient.findById(req.body.patient);
        const doctorRecord = await Doctor.findById(req.body.doctor);

        if (patientRecord && doctorRecord) {
            
            const subject = 'Appointment Confirmation: Hospital Management System';
            const appointmentDetails = `
                <p>Dear ${patientRecord.name},</p>
                <p>Your appointment has been successfully scheduled.</p>
                <ul>
                    <li>Doctor: Dr. ${doctorRecord.name} (${doctorRecord.specialization})</li>
                    <li>Date: ${newAppointment.date.toDateString()}</li>
                    <li>Time: ${newAppointment.timeSlot}</li>
                    <li>Reason: ${newAppointment.reason}</li>
                </ul>
                <p>Thank you.</p>
            `;

            await sendEmail({
                email: patientRecord.email,
                subject: subject,
                message: appointmentDetails
            });

            await sendEmail({
                email: doctorRecord.email,
                subject: 'New Appointment Booked',
                message: `<p>A new appointment has been booked with you by patient ${patientRecord.name}.</p>`
            });
        }

        res.redirect('/appointments'); 
        
    } catch (error) {
        error.statusCode = 400; 
        next(error);
    }
};


export const getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.find({})
            .populate('patient', 'name') 
            .populate('doctor', 'name specialization'); 
        
        res.render('appointments/index', {
            pageTitle: 'All Appointments',
            appointments: appointments
        });
    } catch (error) {
        next(error); 
    }
};

export const renderNewAppointmentForm = async (req, res, next) => {
    try {
        const patients = await Patient.find({}).select('name email'); 
        const doctors = await Doctor.find({}).select('name specialization');

        res.render('appointments/new', {
            pageTitle: 'Book New Appointment',
            patients: patients,
            doctors: doctors
        });
    } catch (error) {

        next(error);
    }
};

export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, { status: status }, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedAppointment) {
            const error = new Error('Appointment not found for status update.');
            error.statusCode = 404;
            return next(error);
        }
        
        res.redirect(`/appointments/${updatedAppointment._id}`); 
        
    } catch (error) {
        error.statusCode = 400; 
        next(error);
    }
};

export const getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email contact')
            .populate('doctor', 'name specialization email');

        if (!appointment) {
            const error = new Error('Appointment not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('appointments/show', {
            pageTitle: `Appointment: ${appointment._id}`,
            appointment: appointment
        });

    } catch (error) {
        if (error.kind === 'ObjectId') error.statusCode = 404;
        next(error); 
    }
};