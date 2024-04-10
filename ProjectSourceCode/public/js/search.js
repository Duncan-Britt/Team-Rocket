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
        const name = search_input_field.value;
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

async function make_pokemon_card(name) {    
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    const img_url = data.sprites.front_default;
    const stats = data.stats;
    name = data.name; // <== maybe i don't need this
    const hp = stats[0].base_stat;
    const attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    const types_string = data.types.map(obj => obj.type.name).join(', ');

    return elt('div', {}, "",
                elt('ul', {}, "",
                    elt('li', {}, "",
                        elt('img', { src: img_url })),
                    elt('li', {}, "",
                        elt('p', {}, capitalize(name))),                    
                    elt('li', {}, "",
                        elt('p', {}, `Attack: ${attack}`)),
                    elt('li', {}, "",
                        elt('p', {}, `Hitpoints: ${hp}`)),
                    elt('li', {}, "",
                        elt('p', {}, `Special Attack: ${special_attack}`)),
                    elt('li', {}, "",
                        elt('p', {}, `Special Defense: ${special_defense}`)),
                    elt('li', {}, "",
                        elt('p', {}, `Speed: ${speed}`)),                    
                    elt('li', {}, "",
                        elt('p', {}, `Type(s): ${types_string}`)),                    
                   )
              );
}

function capitalize(string) {
    return string.slice(0,1).toUpperCase() + string.slice(1);
}

function elt(name, attrs, text, ...children) {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of children) {
        dom.appendChild(child);
    }
    if (text) {
        dom.innerText = text;
    }
    return dom;
}


