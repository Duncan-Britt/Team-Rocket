CREATE TABLE IF NOT EXISTS Users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pokemon (
       id SERIAL PRIMARY KEY,
       name VARCHAR UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Users_Pokemon (
       id_user INTEGER,
       id_pokemon INTEGER,
       FOREIGN KEY (id_user) REFERENCES Users(id),
       FOREIGN KEY (id_pokemon) REFERENCES Pokemon(id),
       PRIMARY KEY (id_user, id_pokemon)
);

CREATE TABLE IF NOT EXISTS Pending_Transactions (
       id SERIAL PRIMARY KEY,
       id_user_initiated INTEGER,
       id_user_requested INTEGER,
       FOREIGN KEY (id_user_initiated) REFERENCES Users(id),
       FOREIGN KEY (id_user_requested) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Transaction_Card (
       id SERIAL PRIMARY KEY,
       Pokemon_Id INTEGER,
       Transaction_Id INTEGER,
       Giver_Id INTEGER,
       Receiver_Id INTEGER,
       FOREIGN KEY (Pokemon_Id) REFERENCES Pokemon(id),
       FOREIGN KEY (Transaction_Id) REFERENCES Pending_Transactions(id),
       FOREIGN KEY (Giver_Id) REFERENCES Users(id),
       FOREIGN KEY (Receiver_Id) REFERENCES Users(id)
);

