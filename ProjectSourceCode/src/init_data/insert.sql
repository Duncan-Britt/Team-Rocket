ALTER TABLE Pokemon
ADD COLUMN number INTEGER,
ADD COLUMN type_1 VARCHAR,
ADD COLUMN type_2 VARCHAR,
ADD COLUMN total INTEGER,
ADD COLUMN hp INTEGER,
ADD COLUMN attack INTEGER,
ADD COLUMN defense INTEGER,
ADD COLUMN sp_atk INTEGER,
ADD COLUMN sp_def INTEGER,
ADD COLUMN speed INTEGER,
ADD COLUMN generation INTEGER,
ADD COLUMN legendary BOOLEAN;


INSERT INTO Pokemon (id, name, type_1, type_2, total, hp, attack, defense, sp_atk, sp_def, speed, generation, legendary)
VALUES 
(1, 'Bulbasaur', 'Grass', 'Poison', 318, 45, 49, 49, 65, 65, 45, 1, FALSE),
(2, 'Ivysaur', 'Grass', 'Poison', 405, 60, 62, 63, 80, 80, 60, 1, FALSE),
(3, 'Venusaur', 'Grass', 'Poison', 525, 80, 82, 83, 100, 100, 80, 1, FALSE),
(4, 'Charmander', 'Fire', NULL, 309, 39, 52, 43, 60, 50, 65, 1, FALSE),
(5, 'Charmeleon', 'Fire', NULL, 405, 58, 64, 58, 80, 65, 80, 1, FALSE),
(6, 'Charizard', 'Fire', 'Flying', 534, 78, 84, 78, 109, 85, 100, 1, FALSE),
(7, 'CharizardMega Charizard X', 'Fire', 'Dragon', 634, 78, 130, 111, 130, 85, 100, 1, FALSE),
(8, 'CharizardMega Charizard Y', 'Fire', 'Flying', 634, 78, 104, 78, 159, 115, 100, 1, FALSE);
