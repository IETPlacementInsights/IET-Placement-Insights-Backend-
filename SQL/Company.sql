/*
Creating the company table that stores the companies
that visited the campus for the recruitments
*/
create table company
(
    id serial primary key,
    name text unique
);
insert into company (name) values ('Carwale');