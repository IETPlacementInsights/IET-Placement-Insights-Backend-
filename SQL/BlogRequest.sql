/*
This table is used to store the blogs which are considered
for moderation.
*/
create table blog_request
(
    id int auto_increment primary key,
    company_id int not null,
    author_id int not null,
    role text not null,
    date date not null,
    content text not null,
    selection_status boolean not null,
    foreign key (company_id) references company(id),
    foreign key (author_id) references author(id)
);