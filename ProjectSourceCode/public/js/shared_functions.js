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
                           elt('td', { colspan: 2 }, `${count}`)),
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
