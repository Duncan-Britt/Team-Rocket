// Depends on shared_functions.js

document.addEventListener("DOMContentLoaded", () => {
    const search_button = document.getElementById("search_button");
    const search_input_field = document.getElementById("search_input_field");    
    const pokemon_container = document.getElementById("pokemon-container");
    const login_data_element = document.getElementById("is-logged-in");
    const form = document.forms[0];
    const radios = form.elements["type-choice"];
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
        const type = radios.value;
        
        const name = search_input_field.value.toLowerCase();
        while (pokemon_container.firstChild) {
            pokemon_container.removeChild(pokemon_container.firstChild);
        }
        let pkmn = [];

        if(type != null && type != "none") {

            const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();

            let i = 0;
            while(i < data.pokemon.length) {
                if(name === "") {
                    pkmn.push(data.pokemon[i].pokemon.name)
                }
                else if (name === data.pokemon[i].pokemon.name) {
                    pkmn.push(name);
                }
                i ++;
            }
        }
        else {
            pkmn.push(name);
        }

        if (pkmn.length === 0) {
            pokemon_container.appendChild(
                elt('p', { style: "color: red" }, "Pokemon not found.")
            );
            return;
        }

        i = 0;
        while(i < pkmn.length) {
            let pokemon_card = await make_pokemon_card(pkmn[i]);
            if (!pokemon_card) {
                pokemon_container.appendChild(
                    elt('p', { style: "color: red" }, "Pokemon not found.")
                );
                return;
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
            i ++;
        }

        // for(mon in pkmn) {
        //     pokemon_container.appendChild(
        //                 elt('p', { style: "color: black" }, mon)
        //             );
        //     let pokemon_card = await make_pokemon_card(name);
        //     if (!pokemon_card) {
        //         pokemon_container.appendChild(
        //             elt('p', { style: "color: red" }, "Pokemon not found.")
        //         );
        //         return;
        //     }

        //     pokemon_container.appendChild(pokemon_card);
        //     if (is_logged_in) {
        //         pokemon_container.appendChild(
        //             elt('form', {
        //                 action: "/add",
        //                 method: "post",
        //                 class: "reg-form",                                        
        //             }, "",
        //                 elt('input', {
        //                     type: 'hidden',
        //                     name: "pokemon",
        //                     value: name,
        //                 }, ""),
        //                 elt('button', {
        //                     type: "submit",
        //                     class: "btn btn-primary",
        //                 }, "Add to collection")
        //             )
        //         );
        //     } else {
        //         pokemon_container.appendChild(
        //             elt('form', {
        //                 action: "/add",
        //                 method: "post",
        //                 class: "reg-form",
        //                 hidden: null,
        //             }, "",
        //                 elt('input', {
        //                     type: 'hidden',
        //                     name: "pokemon",
        //                     value: name,
        //             }, ""),
        //                 elt('button', {
        //                     type: "submit",
        //                     class: "btn btn-primary",
        //                 }, "Add to collection")
        //             )
        //         );
        //     }
        // }
        
        // if (!pokemon_card) {
        //     pokemon_container.appendChild(
        //         elt('p', { style: "color: red" }, "Pokemon not found.")
        //     );
        //     return;
        // }
        
        // while (pokemon_container.firstChild) {
        //     pokemon_container.removeChild(pokemon_container.firstChild);
        // }
        // pokemon_container.appendChild(pokemon_card);
        // if (is_logged_in) {
        //     pokemon_container.appendChild(
        //         elt('form', {
        //             action: "/add",
        //             method: "post",
        //             class: "reg-form",                                        
        //         }, "",
        //             elt('input', {
        //                 type: 'hidden',
        //                 name: "pokemon",
        //                 value: name,
        //             }, ""),
        //             elt('button', {
        //                 type: "submit",
        //                 class: "btn btn-primary",
        //             }, "Add to collection")
        //            )
        //     );
        // } else {
        //     pokemon_container.appendChild(
        //         elt('form', {
        //             action: "/add",
        //             method: "post",
        //             class: "reg-form",
        //             hidden: null,
        //         }, "",
        //             elt('input', {
        //                 type: 'hidden',
        //                 name: "pokemon",
        //                 value: name,
        //             }, ""),
        //             elt('button', {
        //                 type: "submit",
        //                 class: "btn btn-primary",
        //             }, "Add to collection")
        //            )
        //     );
        // }
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
            res_list.push(mon.pokemon.name);
        }
        return res_list;
    }
    else {
        //if name is specified, search pokemon of type
        let found = null;
        for(let mon in pkmn_list) {
            if(mon.pokemon.name === name) {
                found = name;
            }
        }
        if(found) {
            return name;
        }
        else {
            return null;
        }
    }
};
