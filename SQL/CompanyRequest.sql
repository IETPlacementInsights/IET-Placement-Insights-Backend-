create table company_request
(
    name varchar(100) not null,
    author_id int not null,
    primary key(name,author_id),
    foreign key (author_id) references author(id)
);