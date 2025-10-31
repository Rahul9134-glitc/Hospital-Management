
import express from "express";
import dotenv from "dotenv";
import Dbconnection from "./db/Dbconnection.js";
import errorHandler from "./middleware/errorHandler.js";
import PatientRoutes from "./routes/Patient.routes.js";
import DocterRoutes from "./routes/Docter.routes.js";
import BilingRoutes from "./routes/billing.routes.js"
import methodOverride from "method-override";
import AppointmentRoutes from "./routes/Appointment.routes.js";
import MainRoutes from "./routes/main.routes.js"
import session from "express-session";
import { isAuth } from "./middleware/isAuth.js";
import UserRoutes from "./routes/user.routes.js";
import { loadSettings } from "./middleware/loadSettings.js"; 
import SettingsRoutes from "./routes/settings.routes.js"
import flash from "connect-flash"
import ServicesRoutes from "./routes/services.routes.js"
import { get404 , get500 } from "./controllers/error.controllers.js";
import User from "./Model/user.js";
dotenv.config();
Dbconnection();

const app = express();
const port = process.env.PORT || 5000;


app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(loadSettings);


// Session Middleware
app.use(session({
    secret: process.env.SECRET || 'A_TEMPORARY_SECRET_PLEASE_SET_IN_DOTENV', // Fallback for safety
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(flash());

app.use((req, res, next) => {
    if (req.flash) {
        res.locals.messages = {
            success: req.flash('success'),
            error: req.flash('error'),
            info: req.flash('info')
        };
    } else {
        res.locals.messages = {};
    }
    
    next();
});



app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || {};
    res.locals.pageTitle = res.locals.pageTitle || res.locals.settings.hospitalName || 'Hospital Management System';
    next();
});


// --- Routes ---
app.use("/" ,  MainRoutes);
app.use("/patients" ,isAuth, PatientRoutes); 
app.use("/doctors" , isAuth, DocterRoutes);
app.use("/appointments" , isAuth, AppointmentRoutes);
app.use("/billing" ,isAuth, BilingRoutes);
app.use("/users" , isAuth,UserRoutes);
app.use("/settings" , SettingsRoutes);
app.use("/services" , ServicesRoutes);

app.use(get404);
app.use(get500);

app.use((req, res, next) => { 
    const error = new Error(`Can't find ${req.originalUrl} on this server!`);
    error.statusCode = 404;
    next(error); 
});

app.use(errorHandler);


app.listen(port , function(){
    console.log("Server is listening on ", port);
})