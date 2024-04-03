import express from 'express'; // I changed several of these imports to use the import syntax instead of require to support ESM modules (Jason Hunter)
const app = express();
// import handlebars from 'handlebars'; 
import exphbs from 'express-handlebars'; 
import path from 'path'; 
import pgPromise from 'pg-promise'; 
const pgp = pgPromise(); // To connect to the Postgres DB from the node server
// const bodyParser = import('body-parser'); 
import session from 'express-session'; // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
import bcryptjs from 'bcryptjs'; // To hash passwords / changed this to use bcryptjs instead of bycrypt (Jason Hunter)
const axios = import('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
// import dotenv from 'dotenv'; // To read the .env file
// dotenv.config(); // To read the .env file

import Pokedex from 'pokedex-promise-v2'; // To interact with the PokéAPI (Jason Hunter)
const P = new Pokedex();

const hbs = exphbs.create({ 
    extname: 'hbs',
    layoutsDir: new URL('.', import.meta.url).pathname + '/views/layouts', // changed these two lines to use the import.meta.url syntax for ESM modules (Jason Hunter)
    partialsDir: new URL('.', import.meta.url).pathname + '/views/partials',
});

// database configuration
const dbConfig = {
    host: 'db', // the database server
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
app.set('views', path.join(new URL('.', import.meta.url).pathname, 'views')); // also changed this line to use ESM syntax (Jason Hunter)
app.use(express.json()); // specify the usage of JSON for parsing request body / changed this to use express.json() instead of bodyParser.json() (Jason Hunter)

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    express.urlencoded({ // changed this to use express.urlencoded() instead of bodyParser.urlencoded() (Jason Hunter)
        extended: true,
    })
);

app.get('/', (req, res) => {    
    res.render('pages/home');
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


// ---------- Main Site Page Routes ----------
// ---- home.hbs ----
app.get('/', (req,res) => {
    res.render('pages/home');
});

// ---- login.hbs ----
app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', (req, res) => {
    //implement logging in
});

// Authentication middleware, required for login
// const auth = (req, res, next) => {
//     if (!req.session.user) {
//       return res.redirect('/login');
//     }
//     next();
//   };
  
//   app.use(auth);

// ---- register.hbs ----
app.get('/register', (req, res) => {
    res.render('pages/reigster');
});

app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    
    //insert username, email, password into 
    var insq = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) returning *;';
      
    db.one(insq, [req.body.username, req.body.email, hash])
        .then(data => {
            res.render('pages/login');
        })
        .catch(err => {
            console.log(err);
            res.render('pages/register');
        });
  });

// ---- account.hbs ----
app.get('/account', (req, res) => {
    res.render('pages/account');
    //pass relevant user info to account page via render
});

// ---- discover.hbs ----
app.get('/discover', (req, res) => {
    res.render('pages/discover');
    // basic discover page, add search functionality (via GET calls)
});

// ---- logout.hbs ----
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('pages/logout');
});

app.listen(3000);
console.log('Server is listening on port 3000');
