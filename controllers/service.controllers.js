import Service from "../model/services.js";

export const getServices = async (req, res, next) => {
    try {
        const services = await Service.find().sort({ name: 1 });

        res.render('services/list', {
            pageTitle: 'Service Management',
            services: services,
            editing: false, 
            service: {}
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        next(error);
    }
};

export const createService = async (req, res, next) => {
    const { name, code, price, category, description } = req.body;
    try {
        const newService = new Service({
            name,
            code,
            price: parseFloat(price),
            category,
            description
        });
        
        await newService.save();

        req.flash('success', `Service "${name}" added successfully.`);
        res.redirect('/services');
    } catch (error) {
        console.error("Error creating service:", error);
        const errorMessage = error.message.includes('duplicate key error') 
                             ? 'Error: Service Name or Code already exists.' 
                             : error.message;

        req.flash('error', errorMessage);
        res.redirect('/services');
    }
};

export const getEditService = async (req, res, next) => {
    try {
        const serviceId = req.params.id;
        const service = await Service.findById(serviceId);

        if (!service) {
            req.flash('error', 'Service not found.');
            return res.redirect('/services');
        }

        const services = await Service.find().sort({ name: 1 }); 

        res.render('services/list', { 
            pageTitle: 'Edit Service',
            services: services,
            editing: true,
            service: service
        });
    } catch (error) {
        console.error("Error fetching service for edit:", error);
        req.flash('error', 'Error loading service details.');
        res.redirect('/services');
    }
};

export const updateService = async (req, res, next) => {
    const serviceId = req.body.serviceId;
    const { name, code, price, category, description, isActive } = req.body;
    
    // Checkbox values come as 'on' or undefined, convert to boolean
    const activeStatus = isActive === 'on';

    try {
        const updatedService = await Service.findByIdAndUpdate(serviceId, {
            name,
            code,
            price: parseFloat(price),
            category,
            description,
            isActive: activeStatus
        }, { new: true, runValidators: true }); 

        if (!updatedService) {
            req.flash('error', 'Service not found for update.');
            return res.redirect('/services');
        }

        req.flash('success', `Service "${updatedService.name}" updated successfully.`);
        res.redirect('/services');
    } catch (error) {
        console.error("Error updating service:", error);
        const errorMessage = error.message.includes('duplicate key error') 
                             ? 'Error: Service Name or Code already exists.' 
                             : error.message;
        
        req.flash('error', errorMessage);
        res.redirect(`/services/edit/${serviceId}`); 
    }
};


export const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the service by ID and remove it from the database
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            req.flash('error', 'Service not found or already deleted.');
            return res.redirect('/services');
        }

        req.flash('success', `Service "${deletedService.name}" has been successfully deleted.`);
        res.redirect('/services');

    } catch (error) {
        // Handle MongoDB/Mongoose errors
        req.flash('error', 'An error occurred while deleting the service.');
        next(error); 
    }
};