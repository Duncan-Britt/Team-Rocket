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
       id_user INTEGER,
       name_pokemon VARCHAR,
       FOREIGN KEY (id_user) REFERENCES Users(id),
       FOREIGN KEY (name_pokemon) REFERENCES Pokemon(name)       
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
       Pokemon_Name VARCHAR,
       Transaction_Id INTEGER,
       Giver_Id INTEGER,
       Receiver_Id INTEGER,
       FOREIGN KEY (Pokemon_Name) REFERENCES Pokemon(name),
       FOREIGN KEY (Transaction_Id) REFERENCES Pending_Transactions(id),
       FOREIGN KEY (Giver_Id) REFERENCES Users(id),
       FOREIGN KEY (Receiver_Id) REFERENCES Users(id)
);

