create table user
(
    id int auto_increment primary key,
    email varchar(200) unique not null,
    name varchar(100) not null,
    password varchar(100) not null,
    role varchar(10) not null 
);
