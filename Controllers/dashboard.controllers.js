
import Patient from '../Model/patient.js';
import Appointment from '../Model/appointment.js';
import Billing from '../Model/billing.js';
import User from '../Model/user.js';
import Doctor from '../Model/docter.js';

const today = new Date();
today.setHours(0, 0, 0, 0);

// Get the start of the current month
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

// Get the start of 6 months ago (for Chart data)
const sixMonthsAgo = new Date();
// Note: setMonth(getMonth() - 5) fetches the current month + 5 previous months = 6 months data
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); 
sixMonthsAgo.setDate(1); // Start from the 1st day of that month
sixMonthsAgo.setHours(0, 0, 0, 0);


export const getDashboardData = async (req, res, next) => {
    try {
        // --- 1. Fetching all necessary counts and sums concurrently (for efficiency) ---
        
        const [
            totalPatients,
            totalAppointments,
            totalInvoices,
            doctorCount,
            userCount, // Total Staff/Admin Accounts
            todayAppointments,
            monthlyPaidRevenueResult,
            totalPendingRevenueResult,
            monthlyRevenueData
        ] = await Promise.all([
            // Total Counts
            Patient.countDocuments(),
            Appointment.countDocuments(),
            Billing.countDocuments(),
            Doctor.countDocuments(),
            User.countDocuments(),
            
            // Today's Statistics
            Appointment.countDocuments({ date: { $gte: today } }),
            
            // Current Month Paid Revenue
            Billing.aggregate([
                {
                    $match: {
                        status: 'Paid',
                        createdAt: { $gte: startOfMonth }
                    }
                },
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
            ]),
            
            // Total Pending Revenue
            Billing.aggregate([
                { $match: { status: 'Pending' } },
                { $group: { _id: null, totalPending: { $sum: '$grandTotal' } } }
            ]),
            
            // Monthly Revenue Chart Data (पिछले 6 महीनों का Data)
            Billing.aggregate([
                {
                    $match: {
                        status: 'Paid',
                        createdAt: { $gte: sixMonthsAgo } 
                    }
                },
                {
                    $group: {
                        // YYYY-MM format में ग्रुप करें
                        _id: { 
                            year: { $year: "$createdAt" }, 
                            month: { $month: "$createdAt" } 
                        },
                        monthlyRevenue: { $sum: '$grandTotal' }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 } // समय के अनुसार sort करें
                }
            ])
        ]);

        // --- 2. Data Processing for Statistics ---
        
        const monthlyPaidRevenue = monthlyPaidRevenueResult.length > 0 
                                 ? monthlyPaidRevenueResult[0].totalRevenue 
                                 : 0;

        const totalPendingRevenue = totalPendingRevenueResult.length > 0 
                                  ? totalPendingRevenueResult[0].totalPending 
                                  : 0;
        
        // --- 3. Data Processing for Chart.js (Frontend के लिए format करना) ---

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueLabels = [];
        const revenueValues = [];
        
        // पिछले 6 महीनों के लिए labels तैयार करें (भले ही revenue 0 हो)
        for (let i = 0; i < 6; i++) {
            const date = new Date(sixMonthsAgo);
            date.setMonth(date.getMonth() + i);
            const monthKey = { year: date.getFullYear(), month: date.getMonth() + 1 };
            
            // Label: Mar 24, Apr 24, etc.
            revenueLabels.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`);
            
            // उस महीने का data ढूंढें, अगर नहीं है तो 0 सेट करें
            const dataPoint = monthlyRevenueData.find(d => 
                d._id.year === monthKey.year && d._id.month === monthKey.month
            );
            revenueValues.push(dataPoint ? dataPoint.monthlyRevenue.toFixed(2) : 0);
        }

        // --- 4. Render View ---
        
        res.render('dashboard/index', {
            pageTitle: 'Hospital Dashboard',
            
            stats: {
                totalPatients,
                totalAppointments,
                totalInvoices,
                doctorCount,
                userCount,
                todayAppointments,
                monthlyPaidRevenue,
                totalPendingRevenue
            },
            
            // Chart Data भेजें
            chartData: {
                labels: revenueLabels,
                revenue: revenueValues
            }
        });

    } catch (error) {
        console.error("Dashboard data fetching failed:", error);
        next(error);
    }
};