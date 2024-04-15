document.addEventListener("DOMContentLoaded", () => {
    const search_button = document.getElementById("search_button");
    const search_input_field = document.getElementById("search_input_field");
    const pokemon_container = document.getElementById("pokemon-container");
    const login_data_element = document.getElementById("is-logged-in");
    const is_logged_in = login_data_element.dataset.isloggedin == "true" ? true : false;
    // pokemon_container.style.backgroundImage = "url('ProjectSourceCode\public\js\background.jpeg')";
    // pokemon_container.style.backgroundColor = "red";
    // pokemon_container.style.backgroundSize = "60px 40px";

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

document.addEventListener('DOMContentLoaded', function() {
    // JavaScript code here
    // Create a <style> element
    const styleElement = document.createElement('style');

    // Define your CSS rules as a string
    const cssText = `
      /* CSS styles for the card */
      .Pokemon_card_Container {
        max-width: 200px;
        margin: 10px;
        background-color: #ff0000;
      }

      .Pokemon_card_Body-body {
        padding: 10px;
      }

      .Pokemon_card_Title-title {
        font-size: 18px;
      }
    `;

    // Set the CSS text of the <style> element
    styleElement.textContent = cssText;

    // Append the <style> element to the <head> of the document
    document.head.appendChild(styleElement);

    // Your other JavaScript code (e.g., make_pokemon_card function) goes here
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
    let attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    const types_string = data.types.map(obj => obj.type.name).join(', ');
    // if (attack == '55') { attack = '50'; }
    const Pokemon_card_Container = document.createElement('div'); //this creates a div element 
    //for the bootstrap card
    Pokemon_card_Container.classList.add('Pokemon_card');
    const Pokemon_card_Body = document.createElement('div'); //card body element
    Pokemon_card_Body.classList.add('card-body');
    const Pokemon_card_Title = document.createElement('h3'); //card time element with h3 heading
    Pokemon_card_Title.classList.add('card-title');
    Pokemon_card_Title.textContent = capitalize(name);

    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img-top');
    cardImage.src = img_url;
    cardImage.alt = 'Pokemon Image';

    // List group
    const Pokemon_Attributes = document.createElement('ul');
    Pokemon_Attributes.classList.add('list-group', 'list-group-flush');

    // List items
    const Attack = createListItem('Attack', attack);
    const Hitpoints = createListItem('Hitpoints', hp);
    const Special_Attack = createListItem('Special Attack', special_attack);
    const Special_Defense = createListItem('Special Defense', special_defense);
    const Speed = createListItem('Speed', speed);
    const Types = createListItem('Type(s)', types_string);

    // Append list items to list group
    [Attack, Hitpoints, Special_Attack, Special_Defense, Speed, Types].forEach(item => {
        Pokemon_Attributes.appendChild(item);
    });

    // Append elements to card body
    Pokemon_card_Body.appendChild(Pokemon_card_Title);
    Pokemon_card_Body.appendChild(Pokemon_Attributes);

    // Append elements to card container
    Pokemon_card_Container.appendChild(cardImage);
    Pokemon_card_Container.appendChild(Pokemon_card_Body);

    return Pokemon_card_Container;


    // return container.firstChild;
    // return elt('div', {}, "",
    //             elt('ul', {}, "",
    //                 elt('li', {}, "",
    //                     elt('img', { src: img_url })),
    //                 elt('li', {}, "",
    //                     elt('p', {}, capitalize(name))),                    
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Attack: ${attack}`)),
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Hitpoints: ${hp}`)),
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Special Attack: ${special_attack}`)),
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Special Defense: ${special_defense}`)),
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Speed: ${speed}`)),                    
    //                 elt('li', {}, "",
    //                     elt('p', {}, `Type(s): ${types_string}`)),                    
    //                )
    //           );
}

function createListItem(label, value) {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = `${label}: ${value}`;
    return listItem;
}
function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
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


