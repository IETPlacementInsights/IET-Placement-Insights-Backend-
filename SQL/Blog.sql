/*
Creating table blog which helps to store the experience
of the students and is connected to company table
*/
create table blog
(
    id serial primary key,
    company_id int not null,
    author_id int,
    role text,
    date date,
    content text not null,
    selection_status boolean not null,
    foreign key (company_id) references company(id),
    foreign key (author_id) references author(id)
);
/*
Inserting a row to blog so as to test the table
*/
insert into blog (company_id,content,selection_status) values (1,'<h1> Carwale Interview Experience</h1>
<h2> Pre placement Talk </h2>
In pre placement talk they told about the company and told about the procedure of the interviews and told about the difficulty of the interviews and Online Assessment',true);