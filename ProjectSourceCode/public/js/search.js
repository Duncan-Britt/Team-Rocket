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
        const pokemon_card = await make_pokemon_card_local(name);
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

async function make_pokemon_card_local(name) {    
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

 return elt('div', {class: "container"}, "", 
            elt('div', {class: "row"}, "", 
                elt('div', {class: "col-md-4", style: "margin-top:20px; margin-bottom:20px;"}, "",
                    elt('div', {class: "card pokemon-card", width: "18rem", style: "background-image: url('/images/orange_bg.jpg')" }, "",
                            elt('img', {className: "card-img-top", src: img_url, alt:"Card image cap" }, ""),
                            elt ('div', {class : "card-body"}, '', 
                                elt('h5', {class: 'card-title', id:'pokemon_name'}, capitalize(name)),
                                elt('p', {class: 'card-text type'}, `Type(s): ${types_string}`)
                            ),
                            elt ('ul', {class : "list-group list-group-flush", id: 'pokemon_description'}, '', 
                                elt('li', {class: 'list-group-item stats'}, `Hitpoints: ${hp}    Attack: ${attack}    Speed:${speed}   `),
                                elt('li', {class: 'list-group-item stats'}, `Special Attack: ${special_attack} \n Special Defense: ${special_defense}`)
                            )
                        )
                    )
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


