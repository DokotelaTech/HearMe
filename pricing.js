const toggle = document.getElementById('price-toggle');
const premiumPrice = document.getElementById('premium-price');

toggle.addEventListener('change', () => {
    if (toggle.checked) {
        // Yearly Price
        premiumPrice.innerHTML = "R1799.99<span>/year</span>";
    } else {
        // Monthly Price
        premiumPrice.innerHTML = "R179<span>/month</span>";
    }
});