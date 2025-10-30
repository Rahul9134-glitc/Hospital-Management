
import Settings from "../Model/settings.js";

export const loadSettings = async (req, res, next) => {
    try {
        // Find the single settings document using the fixed ID
        let settings = await Settings.findById('hospitalSettings');

        // If settings document is not found (first time running the app), 
        // create one with default values defined in the model.
        if (!settings) {
            console.log("No existing settings found. Creating default settings document.");
            // Note: The model's default values will be applied here.
            settings = await Settings.create({ _id: 'hospitalSettings' });
        }

        // Make the settings available in all views (EJS templates) 
        // and throughout the request lifecycle via res.locals.
        res.locals.settings = settings;

        // Pass control to the next middleware/route handler
        next();

    } catch (error) {
        console.error("ERROR in loadSettings middleware:", error);
        // Even if there's an error, we allow the request to proceed, 
        // possibly with a fallback or error handler later.
        next(error); 
    }
};

// Don't forget to export!
// export default loadSettings; // (If you use the structure above)