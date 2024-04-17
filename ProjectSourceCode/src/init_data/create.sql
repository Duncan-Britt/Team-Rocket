CREATE TABLE IF NOT EXISTS Users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pokemon (
       name VARCHAR PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Users_Pokemon (
       id_user INTEGER NOT NULL,
       name_pokemon VARCHAR NOT NULL,
       amount_pokemon INTEGER DEFAULT 1,
       PRIMARY KEY (id_user, name_pokemon),
       FOREIGN KEY (id_user) REFERENCES Users(id),
       FOREIGN KEY (name_pokemon) REFERENCES Pokemon(name),
       CHECK (amount_pokemon >= 1)
);

CREATE TABLE IF NOT EXISTS Pending_Transactions (
       id SERIAL PRIMARY KEY,
       id_user_initiated INTEGER NOT NULL,
       id_user_requested INTEGER NOT NULL,
       FOREIGN KEY (id_user_initiated) REFERENCES Users(id),
       FOREIGN KEY (id_user_requested) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Transaction_Card (
       id SERIAL PRIMARY KEY,
       pokemon_name VARCHAR NOT NULL,
       transaction_id INTEGER NOT NULL,
       giver_id INTEGER NOT NULL,
       receiver_id INTEGER NOT NULL,
       amount_transferred INTEGER DEFAULT 1,
       FOREIGN KEY (pokemon_name) REFERENCES Pokemon(name),
       FOREIGN KEY (transaction_id) REFERENCES Pending_Transactions(id) ON DELETE CASCADE,
       FOREIGN KEY (giver_id) REFERENCES Users(id),
       FOREIGN KEY (receiver_id) REFERENCES Users(id),
       CHECK (amount_transferred >= 1)
);

