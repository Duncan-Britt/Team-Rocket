// Depends on shared_functions.js

document.addEventListener("DOMContentLoaded", () => {
    const search_button = document.getElementById("search_button");
    const search_input_field = document.getElementById("search_input_field");    
    const pokemon_container = document.getElementById("pokemon-container");
    const login_data_element = document.getElementById("is-logged-in");
    const is_logged_in = login_data_element.dataset.isloggedin == "true" ? true : false;
        
    
    search_input_field.addEventListener("keypress", (event) => {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            search_button.click();
        }
    });
    
    search_button.addEventListener("click", async () => {
        const name = search_input_field.value.toLowerCase();

        const pokemon_card = await make_pokemon_card(name);
        if (!pokemon_card) {
            pokemon_container.appendChild(
                elt('p', { style: "color: red" }, "Pokemon not found.")
            );
            return;
        }
        
        while (pokemon_container.firstChild) {
            pokemon_container.removeChild(pokemon_container.firstChild);
        }
        pokemon_container.appendChild(pokemon_card);
        if (is_logged_in) {
            pokemon_container.appendChild(
                elt('form', {
                    action: "/add",
                    method: "post",
                    class: "reg-form",                                        
                }, "",
                    elt('input', {
                        type: 'hidden',
                        name: "pokemon",
                        value: name,
                    }, ""),
                    elt('button', {
                        type: "submit",
                        class: "btn btn-primary",
                    }, "Add to collection")
                   )
            );
        } else {
            pokemon_container.appendChild(
                elt('form', {
                    action: "/add",
                    method: "post",
                    class: "reg-form",
                    hidden: null,
                }, "",
                    elt('input', {
                        type: 'hidden',
                        name: "pokemon",
                        value: name,
                    }, ""),
                    elt('button', {
                        type: "submit",
                        class: "btn btn-primary",
                    }, "Add to collection")
                   )
            );
        }
    });
});

async function find_pokemon_with_type(name, type) {
    // searches for a pokemon of the specified type and returns the corresponding 
    //   pokemon object; if name is null, returns a list of pokemon objects 
    //   corresponding to all with the specified type
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    let pkmn_list = data.pokemon;

    if(!name) {
        //if no name is specified, retrieve data for every pokemon of specified type
        let res_list = [];
        for(let mon in pkmn_list) {
            const mon_res = await fetch(mon.pokemon.url);
            if(!mon_res.ok) {
                return null;
            }
            const mon_data = await mon_res.json();
            res_list.push(mon_data);
        }
        return res_list;
    }
    else {
        //if name is specified, search pokemon of type
        let found = null;
        for(let mon in pkmn_list) {
            if(mon.pokemon.name === name) {
                found = mon.pokemon;
            }
        }
        if(found) {
            const m_res = await fetch(found.url);
            if(!m_res.ok) {
                return null;
            }
            const m_data = await m_res.json();
            return m_data;
        }
        else {
            return null;
        }
    }
};
