/*
Creating the author table which store the 
details of the author of the blog
*/
create table author
(
    id int auto_increment primary key,
    email varchar(200) not null unique,
    name varchar(100) not null
);