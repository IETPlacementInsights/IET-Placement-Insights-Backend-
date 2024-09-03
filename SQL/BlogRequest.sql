/*
This table is used to store the blogs which are considered
for moderation.
*/
create table blog_request
(
    id serial primary key,
    company_id int not null,
    author_id int,
    role text,
    date date,
    content text not null,
    selection_status boolean not null,
    foreign key (company_id) references company(id)
    foreign key (author_id) references author(id)
);
/*
Inserting an entry to this table
*/
insert into blog_request (company_id,content,selection_status) values (1,'This is a sample blog which is requested to moderator for testing purposes',true);