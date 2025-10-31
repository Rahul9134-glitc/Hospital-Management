import Settings from "../Model/settings.js";
const SETTINGS_ID = 'hospitalSettings';

export const getSettings = async (req, res, next) => {
    try {
        // Since loadSettings middleware has already ensured a document exists,
        // we can directly use res.locals.settings
        const settingsData = res.locals.settings;

        res.render('settings/index', {
            pageTitle: 'System Settings',
            settings: settingsData // Pass the current settings to the view
        });
    } catch (error) {
        console.error("Error rendering settings page:", error);
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        // Get data from the form body
        const { hospitalName, tagline, address, phone, email, defaultCurrency } = req.body;
        
        // Prepare the update object
        const updateData = {
            hospitalName,
            tagline,
            address,
            phone,
            email,
            defaultCurrency
            // logoUrl update logic can be added later if file upload is implemented
        };

        // Find the settings document by its fixed ID and update it.
        // { upsert: true, new: true, setDefaultsOnInsert: true } ensures:
        // 1. If document is NOT found, create it (upsert: true)
        // 2. Return the new/updated document (new: true)
        // 3. Apply default values to fields not provided when inserting (setDefaultsOnInsert: true)
        const updatedSettings = await Settings.findByIdAndUpdate(
            SETTINGS_ID,
            { $set: updateData }, // Use $set to update only provided fields
            { 
                upsert: true, 
                new: true, 
                runValidators: true,
                setDefaultsOnInsert: true
            } 
        );

        if (!updatedSettings) {
             throw new Error("Settings update failed unexpectedly.");
        }

        // After successful update, reload settings globally for the next request cycle
        // Although the loadSettings middleware will handle this on the next page load, 
        // updating the session immediately provides a better UX.
        // We rely on the loadSettings middleware to fetch the current data on the next request.

        req.flash('success', 'Hospital settings updated successfully!');
        res.redirect('/settings'); // Redirect back to the settings page
        
    } catch (error) {
        console.error("Error updating settings:", error);
        req.flash('error', error.message || 'Failed to update settings.');
        res.redirect('/settings');
    }
};