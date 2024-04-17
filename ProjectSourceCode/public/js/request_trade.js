// depends on ./shared_functions.js

class Deck {
    constructor(dom_container) {        
        this.dom = dom_container;
        this.cards = {};
        Array.from(dom_container.children).forEach(dom_card => {            
            this.cards[dom_card.dataset.name] = Object.assign({}, dom_card.dataset);
        });
    }

    sends_cards_to(other_deck) {
        this.recipient = other_deck;
        
        const dom_cards = this.dom.children;
        for (let i = 0; i < dom_cards.length; i++) {
            const dom_card = dom_cards[i];
            dom_card.addEventListener('click', e => {
                this.send_card(dom_card.dataset.name);
            });
        }
    }

    send_card(name) {        
        // Possible states:
        // - the card being sent is the last one of it's kind, count: 1
        // - there are multiple cards, count: 2+
        // - for now I'm assuming count: 0 is impossible
        const dom_card = this.dom.querySelector(`.pokemon-card[data-name="${name}"]`);
        let sent_card = Object.assign({}, this.cards[name]);
        delete sent_card.count;
        
        if (this.cards[name].count >= 2) {
            this.cards[name].count -= 1;                        
            dom_card.dataset.count -= 1;
            const dom_table = dom_card.firstElementChild;
            const dom_tbody = dom_table.firstElementChild;
            const dom_tr = dom_tbody.firstElementChild;
            const dom_td = dom_tr.firstElementChild;
            dom_td.innerText = this.cards[name].count;            
        } else if (this.cards[name].count == 1) {
            delete this.cards[name];
            dom_card.remove();
        } else {
            throw new Error('Logic error in deck.send_card()');
        }
                
        this.recipient.receive(sent_card);
    }

    receive(card_info) {
        // Possible states:
        // - the card being received is already in the deck
        // - the card being received is new to the deck
        const name = card_info.name;
        if (this.cards[name]) {
            this.cards[name].count += 1;
            const dom_card = this.dom.querySelector(`.pokemon-card[data-name="${name}"]`);
            dom_card.dataset.count = this.cards[name].count;
            const dom_table = dom_card.firstElementChild;
            const dom_tbody = dom_table.firstElementChild;
            const dom_tr = dom_tbody.firstElementChild;
            const dom_td = dom_tr.firstElementChild;            
            dom_td.innerText = this.cards[name].count;
        } else {
            this.cards[name] = card_info;
            const card = this.cards[name];
            card.count = 1;
            const dom_card = elt('div', {
                class: "pokemon-card",
                "data-count": card.count,
                "data-img_url": card.img_url,
                "data-name": card.name,
                "data-attack": card.attack,
                "data-defense": card.defense,
                "data-hp": card.hp,
                "data-special_attack": card.special_attack,
                "data-special_defense": card.special_defense,
                "data-speed": card.speed,
                "data-types_string": card.types_string,
            }, "",               
                                     elt('table', {}, "",
                                         elt('tbody', {}, "",
                                             elt('tr', {}, "",
                                                 elt('td', { colspan: 2 }, `${card.count}`)),
                                             elt('tr', {}, "",
                                                 elt('td', { colspan: 2 }, "",
                                                     elt('img', { src: card.img_url }))),
                                             elt('tr', {}, "",
                                                 elt('td', {}, card.name)),                    
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Attack:`),
                                                 elt('td', {}, `${card.attack}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Defense:`),
                                                 elt('td', {}, `${card.defense}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Hitpoints:`),
                                                 elt('td', {}, `${card.hp}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Special Attack:`),
                                                 elt('td', {}, `${card.special_attack}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Special Defense:`),
                                                 elt('td', {}, `${card.special_defense}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Speed:`),
                                                 elt('td', {}, `${card.speed}`)),
                                             elt('tr', {}, "",
                                                 elt('td', {}, `Type(s):`),
                                                 elt('td', {}, `${card.types_string}`)))));          
            this.dom.appendChild(dom_card);
            dom_card.addEventListener('click', e => {
                this.send_card(dom_card.dataset.name);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const container_element_yours = document.querySelector('#your-pokemon .pokemon-container');
    const container_element_others = document.querySelector('#their-pokemon .pokemon-container');
    const container_element_get = document.querySelector('#get .pokemon-container');
    const container_element_give = document.querySelector('#give .pokemon-container');

    const deck_give = new Deck(container_element_give);
    const deck_get = new Deck(container_element_get);
    const deck_yours = new Deck(container_element_yours);
    const deck_others = new Deck(container_element_others);
    
    deck_yours.sends_cards_to(deck_give);
    deck_others.sends_cards_to(deck_get);
    deck_give.sends_cards_to(deck_yours);
    deck_get.sends_cards_to(deck_others);

    const request_button_element = document.getElementById('request-trade-btn');
    request_button_element.addEventListener('click', async () => {        
        const url_components = window.location.href.split('/');
        const username_trade_partner = url_components[url_components.length-1];
        
        const trade_data = {
            give: deck_give.cards,
            get: deck_get.cards,
        };
        const cards_give = [];
        for (const pokemon in deck_give.cards) {
            cards_give.push([pokemon.toLowerCase(), deck_give.cards[pokemon].count]);
        }
        const cards_get = [];
        for (const pokemon in deck_get.cards) {
            cards_get.push([pokemon.toLowerCase(), deck_get.cards[pokemon].count]);
        }
        
        const response = await fetch('/trade/' + username_trade_partner, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ give: cards_give, get: cards_get })
        });
        
        window.location.href = '/trade';
    });
});

