document.addEventListener("DOMContentLoaded", () => {
    const button_element_accept = document.getElementById('accept-trade-btn');
    const button_element_decline = document.getElementById('decline-trade-btn');
    const url_components = window.location.href.split('/');    
    const transaction_id = url_components[url_components.length-1];
    
    button_element_decline.addEventListener('click', async () => {
        const response = await fetch('/decline/' + transaction_id, { method: 'POST' });
        window.location.href = '/pending';
    });

    if (button_element_accept) {
        button_element_accept.addEventListener('click', async () => {
            const response = await fetch('/accept/' + transaction_id, { method: 'POST' });
            window.location.href = '/pending';
        });
    }    
});
