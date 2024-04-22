const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const path = require('path');
const pgPromise = require('pg-promise');
const pgp = pgPromise();
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const axios = require('axios');
// const Pokedex = require('pokedex-promise-v2');
// const P = new Pokedex();
const flash = require('express-flash');
const { constants } = require('fs');
app.use(express.static(__dirname + '/'));

// import express from 'express'; // I changed several of these imports to use the import syntax instead of require to support ESM modules (Jason Hunter)
// const app = express();
// // import handlebars from 'handlebars'; 
// import exphbs from 'express-handlebars'; 
// import path from 'path'; 
// import pgPromise from 'pg-promise'; 
// const pgp = pgPromise(); // To connect to the Postgres DB from the node server
// // const bodyParser = import('body-parser'); 
// import session from 'express-session'; // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
// import bcryptjs from 'bcryptjs'; // To hash passwords / changed this to use bcryptjs instead of bycrypt (Jason Hunter)
// const axios = import('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.


// import dotenv from 'dotenv'; // To read the .env file
// dotenv.config(); // To read the .env file

// import Pokedex from 'pokedex-promise-v2'; // To interact with the PokéAPI (Jason Hunter)
// const P = new Pokedex();

// import flash from 'express-flash';

// const hbs = exphbs.create({ 
//     extname: 'hbs',
//     layoutsDir: new URL('.', import.meta.url).pathname + '/views/layouts', // changed these two lines to use the import.meta.url syntax for ESM modules (Jason Hunter)
//     partialsDir: new URL('.', import.meta.url).pathname + '/views/partials',
// });
const hbs = exphbs.create({ 
    extname: 'hbs',
    layoutsDir: path.join(__dirname, '/views/layouts'), // Adjusted to use __dirname for CommonJS modules
    partialsDir: path.join(__dirname, '/views/partials'), // Adjusted to use __dirname for CommonJS modules
});


// database configuration
const dbConfig = {
    host: 'db', // the database serves
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test database connection
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
// app.set('views', path.join(new URL('.', import.meta.url).pathname, 'views')); // also changed this line to use ESM syntax (Jason Hunter)
app.set('views', path.join(__dirname, 'views'));
app.use(express.json()); // specify the usage of JSON for parsing request body / changed this to use express.json() instead of bodyParser.json() (Jason Hunter)
app.use(express.static('public')); // specify the usage of static files

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,        
    })
);
app.use(flash());

app.use(
    express.urlencoded({ // changed this to use express.urlencoded() instead of bodyParser.urlencoded() (Jason Hunter)
        extended: true,
    })
);

app.get('/', (req, res) => {    
    res.render('pages/home', {
        userLoggedIn: req.session.user_id,
        flash_messages: req.flash('create-account-success')
            .concat(req.flash('login-success'))
            .concat(req.flash('logout-success')),
    });
});

async function retrive_dat(name) {    
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

    const dat_stuff = {img_url, hp, attack, defense, special_attack, special_defense, speed, types_string};

    return dat_stuff;

}

app.get('/search', async (req, res) => {
    try {
        const results = await axios({
            url: `https://pokeapi.co/api/v2/pokemon`,
            method: 'GET',
            dataType: 'json',
            headers: {
              'Accept-Encoding': 'application/json',
            }
        });
          
        var pokemons = [];
        if (results && results.data.results && results.data.results) {
            pokemons = results.data.results;
        }
        
        const poke_stats = results.results;

        let n = pokemons.length;
        var data_search_card = new Array();
        
        for (let i = 0; i < n; i++)
        {
            data_search_card[i] = await fetch_pokemon_info(pokemons[i].name);
        }        

        res.render('pages/search', {
            flash_messages: req.flash('pokemon-added'),
            userLoggedIn: req.session.user_id,
            results: data_search_card,
        });
    } catch(error) {
        console.log(error);
        res.render('pages/search', {
                flash_messages: req.flash('pokemon-added'),
                userLoggedIn: req.session.user_id,
                message: "error",
        });
    }        
    
  });
  

// route for the collections page
app.get('/collections', (req, res) => {
    res.render('pages/collections', {
        userLoggedIn: req.session.user_id,
        flash_messages: req.flash('create-account-success')
            .concat(req.flash('login-success'))
            .concat(req.flash('logout-success')),
    });
});

async function fetch_pokemon_info(pokemon_name) {    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
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
        const types = data.types.map(obj => obj.type.name);
        const types_string = types.join(', ');

        const first_type = types[0];

        return {
            name: capitalize(pokemon_name),
            img_url,        
            hp,
            attack,
            defense,
            special_attack,
            special_defense,
            speed,
            types_string,
            first_type,
        };
    } catch (err) {
        console.error(err);
        return {};
    }
}

async function fetch_detailed_pokemon_info(pokemon_name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const img_url = data.sprites.front_default;
    const img_back_url = data.sprites.back_default;
    const img_shiny_url = data.sprites.front_shiny;
    const img_shiny_back_url = data.sprites.back_shiny;
    const img_female_url = data.sprites.front_female;
    const img_back_female_url = data.sprites.back_female;
    const img_shiny_female_url = data.sprites.front_shiny_female;
    const img_shiny_back_female_url = data.sprites.back_shiny_female;
    const stats = data.stats;    
    const hp = stats[0].base_stat;
    const attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    const types_string = data.types.map(obj => obj.type.name).join(', ');
    const abilities = data.abilities.map(obj => obj.ability.name).join(', ');
    const base_experience = data.base_experience;
    const height = data.height;
    const weight = data.weight;
    const moves = data.moves.map(obj => obj.move.name).join(', ');


    return {
        name: capitalize(pokemon_name),
        img_url,
        img_back_url,
        img_shiny_url,
        img_shiny_back_url,
        img_female_url,
        img_back_female_url,
        img_shiny_female_url,
        img_shiny_back_female_url,        
        hp,
        attack,
        defense,
        special_attack,
        special_defense,
        speed,
        types_string,
        abilities,
        base_experience,
        height,
        weight,
        moves,
    };
}

async function db_query_pokemon_of_user_id(id) {
    const sql_select_cards = `
SELECT Pokemon.name FROM Pokemon
INNER JOIN Users_Pokemon ON Users_Pokemon.name_pokemon = Pokemon.name
INNER JOIN Users ON Users_Pokemon.id_user = Users.id
WHERE Users.id = $1;`;

    return (await db.any(sql_select_cards, [id])).map(p => p.name);
}

async function db_query_pokemon_of_user_name(username) {
    const sql_select_cards = `
SELECT Pokemon.name FROM Pokemon
INNER JOIN Users_Pokemon ON Users_Pokemon.name_pokemon = Pokemon.name
INNER JOIN Users ON Users_Pokemon.id_user = Users.id
WHERE username = $1;`;

    return (await db.any(sql_select_cards, [username])).map(p => p.name);
}

async function db_query_pokemon_of_user_id_with_amounts(id) {
    const sql_select_cards = `
SELECT Pokemon.name, Users_Pokemon.amount_pokemon FROM Pokemon
INNER JOIN Users_Pokemon ON Users_Pokemon.name_pokemon = Pokemon.name
INNER JOIN Users ON Users_Pokemon.id_user = Users.id
WHERE Users.id = $1;`;

    return (await db.any(sql_select_cards, [id]));
}

async function db_query_pokemon_of_user_name_with_amounts(username) {
    const sql_select_cards = `
SELECT Pokemon.name, Users_Pokemon.amount_pokemon FROM Pokemon
INNER JOIN Users_Pokemon ON Users_Pokemon.name_pokemon = Pokemon.name
INNER JOIN Users ON Users_Pokemon.id_user = Users.id
WHERE username = $1;`;

    return (await db.any(sql_select_cards, [username]));
}

app.get('/collections', async (req, res) => {
    if(!req.session.user_id)
    {
        res.redirect('/login');
    }
    try {               
        const pokemons_your = await get_users_collection_by_user_id(req.session.user_id);
                
        res.render('pages/collections', { 
            pokemon: pokemons_your,
            userLoggedIn: req.session.user_id,
            flash_messages: req.flash('create-account-success')
                .concat(req.flash('login-success'))
                .concat(req.flash('logout-success')),
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).send('Error fetching collection');
    }
});

app.get('/collection/:username', async (req, res) => {    
    const username = req.params.username;
    try {        
        const pokemons = await db_query_pokemon_of_user_name_with_amounts(username);       
        let distinct_pokemon_counts_assoc = {};
        for (const pokemon of pokemons) {
            distinct_pokemon_counts_assoc[pokemon.name] = pokemon.amount_pokemon;
        }
        res.json(distinct_pokemon_counts_assoc);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'There has been an error. Please try again later.',
            error: true,
        });        
    }  
});

app.get('/pending/:id', async (req, res) => {    
    const id_pending_transaction = req.params.id;
    const { id_user_requested } = await db.one('SELECT id_user_requested FROM Pending_Transactions WHERE id = $1;', [id_pending_transaction]);
           
    const sql_select_transaction_cards = `SELECT pokemon_name, giver_id, receiver_id, amount_transferred
                                          FROM Transaction_Card WHERE transaction_id = $1`;
    const transacted_cards = await db.any(sql_select_transaction_cards, [id_pending_transaction]);    
    // Get the username of the trading partner
    let other_user_id;    
    if (transacted_cards[0].giver_id != req.session.user_id) {
        other_user_id = transacted_cards[0].giver_id;
    } else {
        other_user_id = transacted_cards[0].receiver_id;
    }
    const other_username_obj = await db.one('SELECT username FROM Users WHERE id = $1', [other_user_id]);
    const other_username = other_username_obj.username;    
    
    let pokemons_other = await get_users_collection_by_user_id(other_user_id);
    let pokemons_your = await get_users_collection_by_user_id(req.session.user_id);

    let pokemon_get = [];
    let pokemon_give = [];
    for (const transacted_card of transacted_cards) {
        const pokemon_info = await fetch_pokemon_info(transacted_card.pokemon_name);
        if (pokemon_info) {
            pokemon_info.count = transacted_card.amount_transferred;
            if (transacted_card.giver_id == req.session.user_id) {
                pokemon_give.push(pokemon_info);
            } else {
                pokemon_get.push(pokemon_info);
            }          
        } else {
            throw new Error('Failed to fetch pokemon info');
        }
    }      
    
    res.render('pages/overview-pending.hbs', {
        userLoggedIn: req.session.user_id,
        flash_messages: req.flash('header-flash'),
        authorized_to_approve: id_user_requested == req.session.user_id,
        get: {
            pokemon: pokemon_get
        },
        give: {
            pokemon: pokemon_give
        },
        other: {
            username: other_username,
            pokemon: pokemons_other,
        },
        your: {
            pokemon: pokemons_your,
        },
    });
});

app.get('/pending', async (req, res) => {
    // TODO Take this opportunity to validate pending transactions based on the users current collection.
    //      If a transaction is no longer valid, remove it from the database and don't display it.
    const sql_incoming = `SELECT id, id_user_initiated FROM Pending_Transactions WHERE id_user_requested = $1`;
    const sql_outgoing = `SELECT id, id_user_requested FROM Pending_Transactions WHERE id_user_initiated = $1`;
    const data_incoming = await db.any(sql_incoming, [req.session.user_id]);
    const data_outgoing = await db.any(sql_outgoing, [req.session.user_id]);    

    let pending_trades_incoming = [];    
    for (let i = 0; i < data_incoming.length; i++) {
        const { username } = await db.one('SELECT username FROM Users WHERE id = $1', [data_incoming[i].id_user_initiated]);
        pending_trades_incoming.push({ username, id: data_incoming[i].id });
    }
    
    let pending_trades_outgoing = [];
    for (let i = 0; i < data_outgoing.length; i++) {
        const { username } = await db.one('SELECT username FROM Users WHERE id = $1', [data_outgoing[i].id_user_requested]);
        pending_trades_outgoing.push({ username, id: data_outgoing[i].id });
    }
    
    res.render('pages/pending', {
        userLoggedIn: req.session.user_id,
        flash_messages: req.flash('header-flash'),
        pending_trades_incoming,
        pending_trades_outgoing,
    });
});

// route for the trade page
app.get('/trade', async (req, res) => {
    if(!req.session.user_id)
    {
        res.redirect('/login');
    }  
    const sql_select_usernames = `
SELECT id, username FROM Users;`;
    try {
        const datas = await db.any(sql_select_usernames, []);
        const usernames = datas.filter(user => user.id != req.session.user_id).map(user => user.username);
        res.render('pages/trade', {
            userLoggedIn: req.session.user_id,
            usernames: usernames,
            flash_messages: req.flash('header-flash'),
        });
    } catch(error) {
        req.flash('pokemon-added', {
            message: 'There has been an error. Please try again later.',
            error: true,
        });
        res.redirect('/');
    }    
});

function capitalize(string) {
    return string.slice(0,1).toUpperCase() + string.slice(1);
}

async function db_get_user_id(username) {
    const sql = `SELECT id FROM Users WHERE username = $1`;
    const [ { id } ] = await db.any(sql, [username]);    
    return id;
}

function simulate_transaction(pokemon_yours_initial, pokemon_others_initial, pokemon_get, pokemon_give) {
    // returns [null, null] in the event that a transaction is invalid
    const yours = JSON.parse(JSON.stringify(pokemon_yours_initial));
    const others = JSON.parse(JSON.stringify(pokemon_others_initial));    
    
    for (const pokemon_info of pokemon_get) {
        const your_pokemon = yours.find(p => p.name == pokemon_info.name);
        if (your_pokemon) {
            your_pokemon.count += pokemon_info.count;
        } else {
            yours.push(Object.assign({}, pokemon_info));
        }
        const others_index = others.findIndex(p => p.name == pokemon_info.name);
        
        if (others_index == -1) {
            // throw new Error('Simulating invalid transaction.');            
            return [null, null];
        }
        const new_count = others[others_index].count - pokemon_info.count;
        if (new_count < 0) {
            // throw new Error('Simulating invalid transaction.');
            return [null, null];
        }

        if (new_count == 0) {
            // others.splice(others_index, 1);
            others[others_index].count = new_count;
        } else {
            others[others_index].count = new_count;
        }
    }

    for (const pokemon_info of pokemon_give) {
        const idx = yours.findIndex(p => p.name == pokemon_info.name);
        if (idx == -1) {
            // throw new Error("Simulating invalid transaction. You can't give pokemon you don't have");
            return [null, null];
        }
        
        const new_count = yours[idx].count - pokemon_info.count;
        if (new_count < 0) {
            // throw new Error("Simulating invalid transaction. You don't have enough pokemon to give that many");
            return [null, null];
        }

        if (new_count == 0) {
            // yours.splice(idx, 1);
            yours[idx].count = new_count;
        } else {
            yours[idx].count = new_count;
        }
               
        const other_pokemon = others.find(p => p.name == pokemon_info.name);
        if (other_pokemon) {
            other_pokemon.count += pokemon_info.count;
        } else {
            others.push(Object.assign({}, pokemon_info));
        }     
    }

    return [yours, others];
}

app.post('/accept/:id', async (req, res) => {
    // Verify that the user logged in is the user with the credentials to accept the trade
    const transaction_id = req.params.id;    
    const { id_user_requested } = await db.one('SELECT id_user_requested FROM Pending_Transactions WHERE id = $1;', [transaction_id]);
    if (id_user_requested != req.session.user_id) {
        req.flash('header-flash', {
            message: 'There has been an error.',
            error: true,
        });
        
        res.status(403).json({
            message: "Unable to create transaction",
            error: true,            
        });
        
        return;
    }
    
    try {
        // Need to validate that the transaction is still valid.
        // There may have been other transactions since the request was made rendering it invalid.
        const sql_select_transaction_cards = `SELECT pokemon_name, giver_id, receiver_id, amount_transferred
                                              FROM Transaction_Card WHERE transaction_id = $1`;
        const transacted_cards = await db.any(sql_select_transaction_cards, [transaction_id]);

        let other_user_id;
        if (transacted_cards[0].giver_id != req.session.user_id) {
            other_user_id = transacted_cards[0].giver_id;
        } else {
            other_user_id = transacted_cards[0].receiver_id;
        }        
        
        let pokemons_other = await get_users_collection_by_user_id(other_user_id);
        let pokemons_your = await get_users_collection_by_user_id(req.session.user_id);
        pokemons_other.forEach(p => {
            p.name = p.name.toLowerCase();
        });
        pokemons_your.forEach(p => {
            p.name = p.name.toLowerCase();
        });

        let pokemon_get = [];
        let pokemon_give = [];
        for (const transacted_card of transacted_cards) {
            if (transacted_card.giver_id == req.session.user_id) {
                pokemon_give.push({ name: transacted_card.pokemon_name, count: transacted_card.amount_transferred });
            } else {
                pokemon_get.push({ name: transacted_card.pokemon_name, count: transacted_card.amount_transferred });
            }            
        }
        
        const [ after_transaction_pokemon_yours, // This function validates the transaction. 
                after_transaction_pokemon_others ] = simulate_transaction(pokemons_your, pokemons_other, pokemon_get, pokemon_give);
        

        // Checking if the transaction was valid
        if (!after_transaction_pokemon_others || !after_transaction_pokemon_yours) {
            req.flash('header-flash', {
                message: 'The transaction is no longer valid',
                error: true,
            });
            res.json({
                message: 'Transaction denied',
                error: false,
            });
        } else { // Valid transaction
            const result = db.tx(async t => {
                // Update Users_Pokemon for both parties of the transaction
                // If the amount of a pokemon drops to 0, delete a row from Users_Pokemon
                // Otherwise, decrement amount_pokemon accordingly
                const sql_update_users_pokemon = `INSERT INTO Users_Pokemon (id_user, name_pokemon, amount_pokemon)
                                                  VALUES ($1, $2, $3) 
                                                  ON CONFLICT (id_user, name_pokemon)
                                                  DO UPDATE SET amount_pokemon = EXCLUDED.amount_pokemon;`;
                const sql_delete_from_users_pokemon = `DELETE FROM Users_Pokemon WHERE id_user = $1 AND name_pokemon = $2`;
                
                for (let i = 0; i < after_transaction_pokemon_yours.length; i++) {
                    const pokemon_info = after_transaction_pokemon_yours[i];
                    if (pokemon_info.count == 0) {
                        await t.none(sql_delete_from_users_pokemon, [req.session.user_id, pokemon_info.name]);
                    } else {
                        await t.none(sql_update_users_pokemon, [req.session.user_id, pokemon_info.name, pokemon_info.count]);
                    }
                    
                }
                for (let i = 0; i < after_transaction_pokemon_others.length; i++) {
                    const pokemon_info = after_transaction_pokemon_others[i];
                    if (pokemon_info.count == 0) {
                        await t.none(sql_delete_from_users_pokemon, [other_user_id, pokemon_info.name]);
                    } else {
                        await t.none(sql_update_users_pokemon, [other_user_id, pokemon_info.name, pokemon_info.count]);
                    }
                }
                
                // Finally, delete the transaction
                const sql_delete_transaction = `DELETE FROM Pending_Transactions WHERE id = $1`;
                await t.none(sql_delete_transaction, [transaction_id]);
            });
            req.flash('header-flash', {
                message: 'Trade accepted.',
                error: false,
            });
            res.json({
                message: 'Transaction complete',
                error: false,
            });        
        }                    
    } catch (err) {
        console.error(err);
        req.flash('header-flash', {
            message: 'There has been an error.',
            error: true,
        });
        
        res.status(500).json({
            message: "Unable to create transaction",
            error: true,            
        });
    }    
});

app.post('/decline/:id', async (req, res) => {
    const transaction_id = req.params.id;
    const sql = `DELETE FROM Pending_Transactions WHERE id = $1`;
    try {
        await db.none(sql, [transaction_id]);
        req.flash('header-flash', {
            message: 'Trade declined.',
            error: false,
        });
        res.json({
            message: 'Transaction deleted',
            error: false,
        });
    } catch(err) {
        console.error(err);
        req.flash('header-flash', {
            message: 'There has been an error.',
            error: true,
        });
        
        res.status(500).json({
            message: "Unable to create transaction",
            error: true,            
        });
    }    
});

app.post('/trade/:username', async (req, res) => {
    const username_trade_partner = req.params.username;
    const trade_data = req.body;

    // First we need to create a new entry in the Pending_Transactions table
    // - to do this, I need to is of the requested user
    const id_user_initiated = req.session.user_id;
    const id_user_requested = await db_get_user_id(username_trade_partner);
    
    const sql_insert_transaction = `
        INSERT INTO Pending_Transactions (id_user_initiated, id_user_requested)
        VALUES                           ($1, $2)
        RETURNING id`;
    
    try {
        const result = db.tx(async t => {
            let id_pending_transaction;
            const results = await t.any(sql_insert_transaction, [id_user_initiated, id_user_requested]);
            id_pending_transaction = results[0].id;
            // Then, we need to create a new entry in Transaction_Card for every pokemon in trade data.
            const sql = `INSERT INTO Transaction_Card (transaction_id, pokemon_name, amount_transferred, giver_id, receiver_id)
                         VALUES                       ($1, $2, $3, $4, $5)`;
            for (let i = 0; i < trade_data.give.length; i++) {
                const pokemon_info = trade_data.give[i];               
                const pokemon_name = pokemon_info[0];
                const amount_transferred = pokemon_info[1];
                const giver_id = id_user_initiated;
                const receiver_id = id_user_requested;                               
                await t.none(sql, [id_pending_transaction, pokemon_name, amount_transferred, giver_id, receiver_id]);
            }
            for (let i = 0; i < trade_data.get.length; i++) {
                const pokemon_info = trade_data.get[i];                
                const pokemon_name = pokemon_info[0];
                const amount_transferred = pokemon_info[1];
                const giver_id = id_user_requested;
                const receiver_id = id_user_initiated;
                await t.none(sql, [id_pending_transaction, pokemon_name, amount_transferred, giver_id, receiver_id]);
            }
        });

        req.flash('header-flash', {
            message: 'Requested trade!',
            error: false,
        });
        
        res.json({
            status: 'success',
            message: 'Trade request received and processed.'
        });
    } catch (err) {
        console.error(err);
        req.flash('header-flash', {
            message: 'There has been an error. Please try again later.',
            error: true,
        });
        
        res.status(500).json({
            message: "Unable to create transaction",
            error: true,            
        });        
        return;
    }    
});

async function get_users_collection_by_user_id(user_id) {    
    const pokemon_data = await db_query_pokemon_of_user_id_with_amounts(user_id);    
    
    let pokemons = [];
    for (const pokemon of pokemon_data) {
        const pokemon_info = await fetch_pokemon_info(pokemon.name);
        if (pokemon_info) {
            pokemon_info.count = pokemon.amount_pokemon;
            pokemons.push(pokemon_info);
        } else {
            throw new Error('Failed to fetch pokemon info');
        }
    }
    return pokemons;
}

async function get_users_collection_by_username(username) {
    const pokemon_data = await db_query_pokemon_of_user_name_with_amounts(username);       
    
    let pokemons = [];
    for (const pokemon of pokemon_data) {
        const pokemon_info = await fetch_pokemon_info(pokemon.name);
        if (pokemon_info) {
            pokemon_info.count = pokemon.amount_pokemon;
            pokemons.push(pokemon_info);
        } else {
            throw new Error('Failed to fetch pokemon info');
        }
    }
    return pokemons;
}

// The purpose of this page is to allow the user to specify the cards they want to trade with a partner
// and request the trade.
app.get('/trade/:username', async (req, res) => {
    if(!req.session.user_id)
    {
        res.redirect('/login');
    }      
    const other_username = req.params.username;    
    try {        
        let pokemons_other = await get_users_collection_by_username(other_username);        
        let pokemons_your = await get_users_collection_by_user_id(req.session.user_id);
        
        res.render('pages/request-trade', {
            userLoggedIn: req.session.user_id,
            your: { pokemon: pokemons_your },
            other: { username: other_username, pokemon: pokemons_other },
        });
    } catch(error) {
        console.error(error);
        req.flash('pokemon-added', { // pokemon-added isn't meaningful in this case.
            message: 'There has been an error. Please try again later.',
            error: true,
        });
        res.redirect('/');
    }    
});

app.get('/register', (req, res) => {
    res.render('pages/register', { flash_messages: req.flash('create-account-error') });
});

app.post('/add', async (req, res) => {    
    const pokemon_name = req.body.pokemon;
    const sql_insert_pokemon = `
INSERT INTO Pokemon (name)
SELECT              $1
WHERE NOT EXISTS (
SELECT name FROM Pokemon WHERE name = $1
);`;

//     const sql_insert_users_pokemon = `
// INSERT INTO Users_Pokemon (id_user, name_pokemon)
    // VALUES                    ($1, $2);`;
    const sql_insert_users_pokemon = `INSERT INTO Users_Pokemon (id_user, name_pokemon, amount_pokemon)
                                      VALUES ($1, $2, 1) 
                                      ON CONFLICT (id_user, name_pokemon)
                                      DO UPDATE SET amount_pokemon = Users_Pokemon.amount_pokemon + 1;`;
    
    try {
        await db.any(sql_insert_pokemon, [pokemon_name]);
        await db.any(sql_insert_users_pokemon, [req.session.user_id, pokemon_name]);
        req.flash('pokemon-added', {
            message: `${pokemon_name} added to your collection.`,
            error: false,
        });
        res.redirect('/search');
    } catch(err) {
        req.flash('pokemon-added', {
            message: 'There has been an error. Please try again later.',
            error: true,
        });
        res.redirect('/search');
    }        
});

app.post('/register', async (req, res) => {    
    const password_hash = await bcryptjs.hash(req.body.password, 10);
    const sql = `
INSERT INTO Users (email, username, password)
VALUES            ($1, $2, $3);`;
    try {
        await db.any(sql, [req.body.email, req.body.username, password_hash]);
        req.flash('create-account-success', {
            message: 'Account created! Please login.',
            error: false,
        });
        res.redirect('/');
    } catch(err) {
        req.flash('create-account-error', {
            message: 'There was an error creating your account. Please try again later.',
            error: true,
        });
        res.redirect('/register');        
    }
});

app.get('/login', (req, res) => {
    res.render('pages/login', { flash_messages: req.flash('invalid-credentials') });
});

app.get('/logout', (req, res) => {
    if(!req.session.user_id)
    {
        res.redirect('/login');
    }  
    req.session.user_id = null;
    req.session.save();
    req.flash('logout-success', {
        message: 'You have been logged out.',
        error: false,
    });
    res.redirect('/');
});

function login_is_email(login_string) {    
    const email_regex = /\S+@\S+\.\S+/;
    return email_regex.test(login_string);
}

app.post('/login', async (req, res) => {
    const password_hash = await bcryptjs.hash(req.body.password, 10);
    let sql;
    if (login_is_email(req.body.login)) {
        sql = `
SELECT id, password FROM Users WHERE email = $1`;
    } else {
        sql = `
SELECT id, password FROM Users WHERE username = $1`;
    }
    let user;
    try {
        const users = await db.any(sql, [req.body.login]);
        if (users.length === 1) {
            user = users[0];
            bcryptjs.compare(req.body.password, user.password, (err, matched) => {
                if (err) {
                    req.flash('invalid-credentials', {
                        message: 'There has been an error. Please try again later.',
                        error: true,
                    });
                    res.redirect('/login');
                } else if (matched) {
                    req.flash('login-success', {
                        message: 'You are now logged in.',
                        error: false,
                    });
                    req.session.user_id = user.id;
                    req.session.save();
                    res.redirect('/collections');
                } else { // Incorrect password
                    req.flash('invalid-credentials', {
                        message: 'Invalid Login Credentials',
                        error: true,
                    });
                    res.redirect('/login');
                }        
            });            
        } else { // No user found with that email or password (or multiple! That shouldn't be able to happen);
            req.flash('invalid-credentials', {
                message: 'Invalid Login Credentials',
                error: true,
            });
            res.redirect('/login');
        }        
    } catch(err) {
        req.flash('invalid-credentials', {
            message: 'There has been an error. Please try again later.',
            error: true,
        });
        res.redirect('/login');
    }      
});

app.get('/search', (req, res) => {
    const query = `
    SELECT DISTINCT Pokemon.id, Pokemon.name, Users.id = $1 
        FROM Pokemon 
        JOIN Users_Pokemon on Pokemon.id = Users_Pokemon.id_pokemon
        JOIN Users on Users_Pokemon.id_user = Users.id
        WHERE Users.id = $1;`;

    db.any(query, [req.session.user_id])
        .then(pokemon => {
            res.render('pages/collections', {
                pokemon,
                //do API calls here?
            });
        })
        .catch(pokemon => {
            res.render('pages/collections', {
                pokemon: [],
                error: true,
                message: err.message,
            });
        });
});

// route to display more detailed pokemon information
app.get('/pokemon/:name', (req,res) => {
    const pokemon_name = req.params.name.toLowerCase();
        fetch_detailed_pokemon_info(pokemon_name)
        .then((pokemon_info) => {            
            res.render('pages/pokemon', {
                pokemon: pokemon_info,
                userLoggedIn: req.session.user_id,
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: 'There has been an error. Please try again later.',
                error: true,
            });        
        });
});

module.exports = app;
app.listen(3000);
console.log('Server is listening on port 3000');
