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

// route for the search page
app.get('/search', (req, res) => { 
    res.render('pages/search', {
        flash_messages: req.flash('pokemon-added'),
        userLoggedIn: req.session.user_id,
    });
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
    const types_string = data.types.map(obj => obj.type.name).join(', ');

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

app.get('/collection/:username', async (req, res) => {    
    const username = req.params.username;    
    try {
        const pokemons = await db_query_pokemon_of_user_name(username);
        let distinct_pokemon_counts_assoc = {};
        for (const pokemon of pokemons) {        
            distinct_pokemon_counts_assoc[pokemon] ||= 0;
            distinct_pokemon_counts_assoc[pokemon] += 1;
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

// route for the trade page
app.get('/trade', async (req, res) => {
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

// The purpose of this page is to allow the user to specify the cards they want to trade with a partner
// and request the trade.
app.get('/trade/:username', async (req, res) => {    
    const other_username = req.params.username;    
    try {
        const pokemon_names_other = await db_query_pokemon_of_user_name(other_username);
        const pokemon_names_your = await db_query_pokemon_of_user_id(req.session.user_id);
        
        let distinct_pokemon_counts_assoc_other = {};
        for (const pokemon of pokemon_names_other) {        
            distinct_pokemon_counts_assoc_other[pokemon] ||= 0;
            distinct_pokemon_counts_assoc_other[pokemon] += 1;
        }
        let distinct_pokemon_counts_assoc_your = {};
        for (const pokemon of pokemon_names_your) {        
            distinct_pokemon_counts_assoc_your[pokemon] ||= 0;
            distinct_pokemon_counts_assoc_your[pokemon] += 1;
        }
        
        let pokemons_other = [];
        for (const name in distinct_pokemon_counts_assoc_other) {
            const pokemon_info = await fetch_pokemon_info(name);            
            if (pokemon_info) {
                pokemon_info.count = distinct_pokemon_counts_assoc_other[name];
                pokemons_other.push(pokemon_info);
            } else {
                throw new Error('Failed to fetch pokemon info');
            }
        }
        let pokemons_your = [];
        for (const name in distinct_pokemon_counts_assoc_your) {
            const pokemon_info = await fetch_pokemon_info(name);            
            if (pokemon_info) {
                pokemon_info.count = distinct_pokemon_counts_assoc_your[name];
                pokemons_your.push(pokemon_info);
            } else {
                throw new Error('Failed to fetch pokemon info');
            }
        }
        
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

    const sql_insert_users_pokemon = `
INSERT INTO Users_Pokemon (id_user, name_pokemon)
VALUES                    ($1, $2);`;
    
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

// can be used to specify an interval of pokemon to be fetched
// const interval = 
// {
// limit: 10,
// offset: 34
// }

// P.getPokemonsList()
// .then((response) => {
//     console.log(response);
// })

// P.getPokemonColorByName("black")
// .then((response) => {
//   console.log(response);
// })
// .catch((error) => {
//   console.log('There was an ERROR: ', error);
// });

// P.getTypeByName("ground")
// .then((response) => {
//   console.log(response);
// })
// .catch((error) => {
//   console.log('There was an ERROR: ', error);
// });

// export default app;
module.exports = app;
app.listen(3000);
console.log('Server is listening on port 3000');
