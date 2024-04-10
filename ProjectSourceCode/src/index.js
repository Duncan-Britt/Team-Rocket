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

// route for the trade page
app.get('/trade', (req, res) => {
    res.render('pages/trade', { userLoggedIn: req.session.user_id });
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
