import Billing from "../Model/billing.js";
import Patient from "../Model/patient.js";
import PDFDocument from "pdfkit";
import Service from "../Model/services.js";


export const getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await Billing.find({})
            .populate('patient', 'name contact'); // Patient का नाम और contact लाओ

        res.render('billing/index', {
            pageTitle: 'All Invoices',
            invoices: invoices
        });
    } catch (error) {
        next(error); 
    }
};


export const renderNewInvoiceForm = async (req, res, next) => {
    try {
        const patients = await Patient.find({}).select('name contact');
        
        // Fetch only active services
        const services = await Service.find({ isActive: true }).sort({ name: 1 });

        res.render('billing/new', {
            pageTitle: 'Create New Invoice',
            patients: patients,
            services: services,
        });
    } catch (error) {
        next(error);
    }
};

export const createInvoice = async (req, res, next) => {
    try {
        // req.body.items should now be an array of { serviceId: '...', quantity: X }
        const { patient, items, taxRate = 0.05 } = req.body;
        
        // 1. Fetch Service Details from the database for verification and correct pricing
        const serviceIds = items.map(item => item.serviceId);
        const servicesData = await Service.find({ '_id': { $in: serviceIds }, isActive: true });
        const serviceMap = new Map(servicesData.map(s => [s._id.toString(), s]));

        let subTotal = 0;
        const processedItems = [];

        // 2. Process items and calculate totals using verified data
        for (const item of items) {
            const service = serviceMap.get(item.serviceId);
            const quantity = parseInt(item.quantity) || 0;

            if (service && quantity > 0) {
                const unitPrice = service.price; // Use price from DB, not client!
                const total = unitPrice * quantity;
                subTotal += total;

                processedItems.push({
                    description: service.name, // Use service name from DB
                    quantity: quantity,
                    unitPrice: unitPrice,
                    total: total
                });
            } else if (!service) {
                // Skip inactive/non-existent services, or add error handling if required
                console.warn(`Service ID ${item.serviceId} not found or inactive.`);
            }
        }

        // Error check if no valid items were found
        if (processedItems.length === 0) {
             req.flash('error', 'Invoice must contain at least one valid service item.');
             return res.redirect('/billing/new');
        }

        // 3. Calculate Tax and Grand Total
        const calculatedTaxRate = parseFloat(taxRate);
        const taxAmount = subTotal * calculatedTaxRate;
        const grandTotal = subTotal + taxAmount;

        // 4. Create and Save Invoice
        const newInvoice = new Billing({
            patient: patient,
            items: processedItems,
            subTotal: subTotal,
            taxRate: calculatedTaxRate,
            taxAmount: taxAmount,
            grandTotal: grandTotal,
            status: 'Pending'
        });

        await newInvoice.save();
        req.flash('success', `Invoice created successfully for patient ${patient}.`);
        res.redirect(`/billing/${newInvoice._id}`); 

    } catch (error) {
        console.error("Error creating invoice:", error);
        req.flash('error', 'Error creating invoice. Please check the data.');
        // If there's a validation error, redirect back to the form
        if (error.name === 'ValidationError') {
            return res.redirect('/billing/new');
        }
        error.statusCode = 400; 
        next(error);
    }
};


export const getInvoice = async (req, res, next) => {
    try {
        const invoice = await Billing.findById(req.params.id)
            .populate('patient', 'name contact address'); // Patient की पूरी जानकारी लाओ

        if (!invoice) {
            const error = new Error('Invoice not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.render('billing/show', {
            pageTitle: `Invoice #${invoice._id.toString().substring(18).toUpperCase()}`,
            invoice: invoice
        });

    } catch (error) {
        if (error.kind === 'ObjectId') {
             error.statusCode = 404;
             error.message = 'Invalid Invoice ID format.';
        }
        next(error); 
    }
};


export const updateInvoiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod } = req.body; 

        const updatedInvoice = await Billing.findByIdAndUpdate(id, 
            { status: status, paymentMethod: paymentMethod || null }, // paymentMethod ऑप्शनल है
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            const error = new Error('Invoice not found for status update.');
            error.statusCode = 404;
            return next(error);
        }
        
        res.redirect(`/billing/${updatedInvoice._id}`); 
        
    } catch (error) {
        error.statusCode = 400; 
        next(error);
    }
};

export const mockPaymentUpdate = async (req, res, next) => {
    try {
        const { invoiceId } = req.body;
        
        const updatedInvoice = await Billing.findByIdAndUpdate(invoiceId, {
            status: 'Paid',
            paymentMethod: 'Mock Online Payment (Test)'
        }, { new: true });

        if (!updatedInvoice) {
            const error = new Error('Invoice not found for payment update.');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({ 
            status: 'success', 
            message: 'Payment simulated and invoice updated to Paid.',
            invoice: updatedInvoice
        });

    } catch (error) {
        console.error("Mock Payment Update Failed:", error);
        res.status(500).json({ status: 'error', message: 'Failed to simulate payment.' });
    }
};

export const generatePdfInvoice = async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await Billing.findById(invoiceId).populate('patient');

        if (!invoice) {
            const error = new Error('Invoice not found.');
            error.statusCode = 404;
            return next(error);
        }

        res.setHeader('Content-Type', 'application/pdf');
        // Set filename for download
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice._id.toString().substring(18).toUpperCase()}.pdf"`);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Pipe the PDF document to the response stream
        doc.pipe(res);

        // --- PDF Content Generation ---

        // 1. Header (Hospital Info)
        doc.fontSize(20).text('Hospital Invoice', { align: 'center' }).moveDown(0.5);
        doc.fontSize(10).text('Hospital Management System').moveDown(0.2);
        doc.text('123 Health Street, City, State - 400001').moveDown(1);

        // 2. Invoice Details
        doc.fontSize(12).text(`Invoice #: ${invoice._id.toString().substring(18).toUpperCase()}`).moveDown(0.5);
        doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`).moveDown(0.5);
        doc.text(`Status: ${invoice.status}`).moveDown(1);
        
        // 3. Billed To (Patient Info)
        doc.fontSize(14).text('Billed To:', { underline: true }).moveDown(0.3);
        doc.fontSize(10).text(`Patient: ${invoice.patient.name}`);
        doc.text(`Contact: ${invoice.patient.contact}`);
        doc.text(`Address: ${invoice.patient.address}`).moveDown(1);

        // 4. Items Table Header
        const tableTop = doc.y;
        const itemCodeX = 50;
        const descriptionX = 100;
        const qtyX = 350;
        const priceX = 420;
        const totalX = 500;

        doc.fillColor('#333');
        doc.text('Description', descriptionX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Unit Price', priceX, tableTop, { width: 60, align: 'right' });
        doc.text('Total', totalX, tableTop, { width: 60, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#ccc');

        // 5. Items Table Rows
        let position = tableTop + 25;
        invoice.items.forEach((item, index) => {
            doc.text(item.description, descriptionX, position);
            doc.text(item.quantity.toString(), qtyX, position);
            doc.text(`₹${item.unitPrice.toFixed(2)}`, priceX, position, { width: 60, align: 'right' });
            doc.text(`₹${item.total.toFixed(2)}`, totalX, position, { width: 60, align: 'right' });
            position += 20;
        });

        doc.moveDown(2);
        
        // 6. Totals Summary
        const totalSummaryY = doc.y;
        const totalLabelX = 400;
        const totalValueX = 500;
        
        doc.fontSize(10);
        doc.text('Sub Total:', totalLabelX, totalSummaryY);
        doc.text(`₹${invoice.subTotal.toFixed(2)}`, totalValueX, totalSummaryY, { width: 60, align: 'right' });
        
        doc.text(`Tax (${(invoice.taxRate * 100).toFixed(0)}%):`, totalLabelX, totalSummaryY + 15);
        doc.text(`₹${invoice.taxAmount.toFixed(2)}`, totalValueX, totalSummaryY + 15, { width: 60, align: 'right' });
        
        doc.fontSize(12).fillColor('#000').font('Helvetica-Bold');
        doc.text('GRAND TOTAL:', totalLabelX - 50, totalSummaryY + 30);
        doc.text(`₹${invoice.grandTotal.toFixed(2)}`, totalValueX, totalSummaryY + 30, { width: 60, align: 'right' });

        doc.moveDown(3);

        // 7. Footer/Notes
        doc.fontSize(10).fillColor('#555').font('Helvetica');
        doc.text('Thank you for your business.', 50, doc.y);
        doc.text(`Payment Method: ${invoice.paymentMethod || 'N/A'}`, 50, doc.y + 15);

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error("PDF generation failed:", error);
        res.status(500).send('Failed to generate PDF invoice.');
        next(error);
    }
};

