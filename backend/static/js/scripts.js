// Common JavaScript functionality for SwiftCRM

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Auto-close alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        });
    }, 5000);

    // Enable tooltips everywhere
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Enable popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

    // Handle dynamic form inputs for order items
    const addItemButton = document.getElementById('addItemButton');
    if (addItemButton) {
        addItemButton.addEventListener('click', function() {
            const itemContainer = document.getElementById('orderItems');
            const itemCount = itemContainer.children.length;
            
            const newItem = document.createElement('div');
            newItem.className = 'row g-3 mb-3 order-item';
            newItem.innerHTML = `
                <div class="col-md-5">
                    <input type="text" class="form-control" name="product_name[]" placeholder="Product Name" required>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" name="quantity[]" placeholder="Qty" min="1" required>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control" name="price[]" placeholder="Price" step="0.01" min="0" required>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            itemContainer.appendChild(newItem);
            
            // Add event listener to the remove button
            const removeButton = newItem.querySelector('.remove-item');
            removeButton.addEventListener('click', function() {
                itemContainer.removeChild(newItem);
                updateTotalAmount();
            });
            
            // Add event listeners to quantity and price inputs for calculating totals
            const quantityInput = newItem.querySelector('input[name="quantity[]"]');
            const priceInput = newItem.querySelector('input[name="price[]"]');
            
            quantityInput.addEventListener('input', updateTotalAmount);
            priceInput.addEventListener('input', updateTotalAmount);
        });
    }
    
    // Handle existing remove buttons for order items
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const item = button.closest('.order-item');
            item.parentNode.removeChild(item);
            updateTotalAmount();
        });
    });
    
    // Add event listeners to existing quantity and price inputs
    const quantityInputs = document.querySelectorAll('input[name="quantity[]"]');
    const priceInputs = document.querySelectorAll('input[name="price[]"]');
    
    quantityInputs.forEach(input => input.addEventListener('input', updateTotalAmount));
    priceInputs.forEach(input => input.addEventListener('input', updateTotalAmount));
    
    // Calculate total amount for order forms
    function updateTotalAmount() {
        const orderItems = document.querySelectorAll('.order-item');
        let total = 0;
        
        orderItems.forEach(function(item) {
            const quantity = parseFloat(item.querySelector('input[name="quantity[]"]').value) || 0;
            const price = parseFloat(item.querySelector('input[name="price[]"]').value) || 0;
            total += quantity * price;
        });
        
        const totalAmountInput = document.getElementById('total_amount');
        if (totalAmountInput) {
            totalAmountInput.value = total.toFixed(2);
        }
    }
    
    // Initialize total calculation on page load
    updateTotalAmount();
    
    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('.delete-confirm');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                event.preventDefault();
            }
        });
    });
});
