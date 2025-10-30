import mongoose from "mongoose"
import User from "../Model/user.js"
import dotenv from "dotenv"
dotenv.config();

const createInitialAdmin = async () => {
    try {
        const adminCount = await User.countDocuments({ role: 'Admin' });
        if (adminCount === 0) {
            const initialAdmin = new User({
                username: 'admin',
                password: 'adminpassword', // इसे बाद में Login Page पर hash किया जाएगा
                role: 'Admin',
                name: 'System Admin'
            });
            await initialAdmin.save();
            console.log('✅ Initial Admin User Created: admin/adminpassword');
        }
    } catch (error) {
        console.error('Failed to create initial admin user:', error);
    }
};

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected.');
        createInitialAdmin(); 
        
        console.log("Admin registered");
    })