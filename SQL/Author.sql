/*
Creating the author table which store the 
details of the author of the blog
*/
create table author
(
    id serial primary key,
    email text not null unique,
    name text not null
);
insert into author (email,name) values ('21bcs138@ietdavv.edu.in','Manan Balwani');