
import Settings from "../Model/settings.js";

export const loadSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findById('hospitalSettings');

        if (!settings) {
            console.log("No existing settings found. Creating default settings document.");
            settings = await Settings.create({ _id: 'hospitalSettings' });
        }
        res.locals.settings = settings;
        next();

    } catch (error) {
        console.error("ERROR in loadSettings middleware:", error);
       
        next(error); 
    }
};
