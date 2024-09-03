create table company_request
(
    name text,
    author_id int,
    primary key(name,author_id),
    foreign key author_id references author(id),
);
insert into company_request values('Z Scaler',1);