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
import MongoStore from "connect-mongo";
import sendEmail from "./utils/EmailServices.js";
import { get404 , get500 } from "./controllers/error.controllers.js";

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
app.set('trust proxy', 1);


// Session Middleware
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
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

app.get("/test-email", async (req, res) => {
  await sendEmail({
    email: "test@example.com",
    subject: "Mailtrap Test Success 🎉",
    message: "<h3>Mailtrap is working perfectly on Render!</h3>",
  });
  res.send("✅ Email sent! Check your Mailtrap inbox.");
});


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