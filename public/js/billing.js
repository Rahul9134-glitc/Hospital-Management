// public/js/billing.js

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const taxRateInput = document.getElementById('taxRate');
    let itemIndex = 0; // Item index को track करने के लिए

    // Initial calculation on page load
    calculateTotal(); 

    // Function to create a new item row
    const createNewItemRow = (index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'row item-row mb-3 gx-2 align-items-center border-bottom pb-2';
        itemRow.innerHTML = `
            <div class="col-6">
                <label class="form-label small">Description</label>
                <input type="text" class="form-control" name="items[${index}][description]" required>
            </div>
            <div class="col-2">
                <label class="form-label small">Qty</label>
                <input type="number" class="form-control item-qty" name="items[${index}][quantity]" value="1" min="1" required oninput="calculateTotal()">
            </div>
            <div class="col-2">
                <label class="form-label small">Unit Price (₹)</label>
                <input type="number" class="form-control item-price" name="items[${index}][unitPrice]" value="0" min="0" required oninput="calculateTotal()">
            </div>
            <div class="col-2 text-end d-flex justify-content-between align-items-center">
                <div>
                    <label class="form-label small">Total</label>
                    <p class="mb-0 fw-bold item-total">₹0.00</p>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-item-btn" onclick="removeItem(this)">X</button>
            </div>
        `;
        return itemRow;
    };

    // Event listener for Add Item button
    addItemBtn.addEventListener('click', () => {
        itemIndex++;
        const newItemRow = createNewItemRow(itemIndex);
        itemsContainer.appendChild(newItemRow);
        // नए इनपुट पर भी total कैलकुलेट करने का event लगाएँ
        newItemRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateTotal);
        });
    });
    
    // Initial rows पर भी event listener लगाएँ
    itemsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
});

// Function to remove an item row (Global Function for onclick)
window.removeItem = (button) => {
    button.closest('.item-row').remove();
    calculateTotal(); // Row हटने के बाद total को अपडेट करें
};


// Function to calculate all totals (Global Function for oninput)
window.calculateTotal = () => {
    let subTotal = 0;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        const total = qty * price;
        subTotal += total;

        // Display individual item total
        row.querySelector('.item-total').textContent = `₹${total.toFixed(2)}`;
    });

    const taxAmount = subTotal * taxRate;
    const grandTotal = subTotal + taxAmount;

    // Display final totals
    document.getElementById('subTotalDisplay').textContent = `₹${subTotal.toFixed(2)}`;
    document.getElementById('taxAmountDisplay').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('grandTotalDisplay').textContent = `₹${grandTotal.toFixed(2)}`;
};