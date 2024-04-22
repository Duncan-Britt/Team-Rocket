// Depends on shared_functions.js

document.addEventListener("DOMContentLoaded", () => {    
    const radios = document.querySelectorAll('.radio-group > label > input[type="radio"][name="option"]');    
    const trade_button = document.getElementById('trade-btn');
    const pokemon_container = document.getElementById('pokemon-container');
    let selected_username = '';
    
    radios.forEach(radio => {        
        radio.addEventListener('change', async (e) => {
            radios.forEach(radio => {
                radio.parentElement.classList.remove('checked');
            });            
            
            if (e.target.checked) {
                e.target.parentElement.classList.add('checked');
                const username = e.target.value;
                selected_username = username;
                const response = await fetch(`/collection/${username}`);
                if (!response.ok) {
                    // TODO
                    return;
                }
                const pokemon_counts_assoc = await response.json();
                let card_elements = [];
                for (const pokemon_name in pokemon_counts_assoc) {
                    const count = pokemon_counts_assoc[pokemon_name]; // user has this many cards
                    card_elements.push(await make_pokemon_card_with_count(pokemon_name, count));
                }
                
                while (pokemon_container.firstChild) {
                    pokemon_container.removeChild(pokemon_container.firstChild);
                }
                
                for (const pokemon_card_element of card_elements) {
                    console.log(pokemon_card_element);
                    pokemon_container.appendChild(pokemon_card_element);
                }              
            }
        });
    });
    
    let event = new Event('change', { 'bubbles': true, 'cancelable': true });
    radios[0].focus();
    radios[0].setAttribute('checked', true);
    radios[0].dispatchEvent(event);

    trade_button.addEventListener('click', () => {
        window.location.href = '/trade/' + selected_username;
    });
});
