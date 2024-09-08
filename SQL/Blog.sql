/*
Creating table blog which helps to store the experience
of the students and is connected to company table
*/
create table blog
(
    id int auto_increment unique,
    company_id int not null,
    author_id int not null,
    role text not null,
    date date not null,
    content text not null,
    selection_status boolean not null,
    foreign key (company_id) references company(id),
    foreign key (author_id) references author(id),
    primary key (company_id,author_id)
);