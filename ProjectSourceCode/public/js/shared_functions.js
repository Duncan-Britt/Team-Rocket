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

async function make_pokemon_card_with_count(name, count) {    
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    const img_url = data.sprites.front_default;
    const stats = data.stats;    
    const hp = stats[0].base_stat;
    const attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    // const types_string = data.types.map(obj => obj.type.name).join(', ');
    const types = data.types.map(obj => obj.type.name);
    const get_one_type = types[0];

    return elt('div', {class: `card pokemon-card ${get_one_type}`, width: "18rem", style: "" }, "",
               elt('li', {class: 'counter'}, `${count}`),
               elt('img', {className: "card-img-top", src: img_url, alt:"Card image cap" }, ""),
               elt ('div', {class : "card-body"}, '',
                    
                    elt('h5', {class: 'card-title', id:'pokemon_name'}, capitalize(name)),
                    elt('p', {class: 'card-text type'}, `Type(s): ${types.join(', ')}`)
                   ),
               elt ('ul', {class : "list-group list-group-flush", id: 'pokemon_description'}, '', 
               elt('li', { class: 'list-group-item stats' }, `Hitpoints: ${hp}`),
               elt('li', { class: 'list-group-item stats' }, `Attack: ${attack}`),
               elt('li', { class: 'list-group-item stats' }, `Defense: ${defense}`),
               elt('li', { class: 'list-group-item stats' }, `Special Attack: ${special_attack}`),
               elt('li', { class: 'list-group-item stats' }, `Special Defense: ${special_defense}`),
               elt('li', { class: 'list-group-item stats' }, `Speed: ${speed}`),
                   )
              );
}

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
               elt('table', {}, "",
                   elt('tbody', {}, "",
                       elt('tr', {}, "",
                           elt('td', { colspan: 2 }, "",
                                elt('img', { src: img_url }))),
                       elt('tr', {}, "",
                           elt('td', {}, capitalize(name))),                    
                       elt('tr', {}, "",
                           elt('td', {}, `Attack:`),
                           elt('td', {}, `${attack}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Defense:`),
                           elt('td', {}, `${defense}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Hitpoints:`),
                           elt('td', {}, `${hp}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Special Attack:`),
                           elt('td', {}, `${special_attack}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Special Defense:`),
                           elt('td', {}, `${special_defense}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Speed:`),
                           elt('td', {}, `${speed}`)),
                       elt('tr', {}, "",
                           elt('td', {}, `Type(s):`),
                           elt('td', {}, `${types_string}`)))));
}
