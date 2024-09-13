/*
This file has the queries for the databaSe to
perform CRUD operations for each entity.
This file is DAO File for each entity of the project.

It has dependency 
    ./Connector.js 
    ./Entities.js
    ./../utilities/Email.js
*/

//Getting prerequisites for writing Data Access Objects
const connector = require('./Connector');
const Entities = require('./Entities');
const email = require('./../utilities/Email');

//DAO for Company
class Company
{
    //This method gives all the companies present in the database
    async getAll()
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select * from company`;
            var companies = [];    
            var [resultSet] = await connection.query(query);
            resultSet.map((row)=>
            {
                //Object of type company from entities
                var company = new Entities.Company(row.id, row.name);
                companies.push(company);
            });
            return companies;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get companies");
        }
        finally
        {
            connection.release();
        }
    }
    
    //This method adds a company to the database
    async add(company)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            var connection = await pool.getConnection();
            
            //Checking whether company already exist in database
            var query = `select id from company where lower(name) = '${company.getName().toLowerCase()}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
                throw Error(`Company ${company.name} already exists`);
            
            //Inserting the company in the database
            query = `insert into company (name) values ('${company.getName()}')`;
            var [resultSet] = await connection.query(query);
            var id = resultSet.insertId;
            company.setId(id);
            
            //Sending the company object with id at 
            //which company is added to the server
            return company;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot add company");
        }
        finally
        {
            connection.release();
        }
    }

    //This method updates an exisiting company to the database
    async update(company)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking whether the company is present or not
            var query = `select name from company where id = ${company.getId()}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`Company Id ${company.getId()} does not exist`);
            }
            query = `select id from company where lower(name) = '${company.getName().toLowerCase()}'`;
            [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
            {
                throw Error(`Company with name ${company.getName()} already exist`);
            }
            
            //Updating the company
            query = `update company set name = '${company.getName()}' where id = ${company.getId()}`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot update company");
        }
        finally
        {
            connection.release();
        }
    }

    //This method deletes an existing company from the database
    async delete(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking whether company exist
            var query = `select name from company where id = ${id}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`Company Id ${id} does not exist`);
            }

            //Test that whether a blog is assigned to this company
            var blog = new Blog();
            if(await blog.getByCompanyId(id).length > 0)
            {
                throw Error(`Some blogs exist for the company id ${id}`);
            }

            //Deleting the company
            query = `delete from company where id = ${id}`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot delete company");
        }
        finally
        {
            connection.release();
        }
    }

    /*
    This method is not used at the server end
    It is used to check whether company id is
    present in the database.
    */
    async companyExist(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select name from company where id = ${id}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
                return false;
            return true;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot check for the company");
        }
        finally
        {
            connection.release();
        }
    }
}


//This class has DAO for the author of the blog
class Author
{
    //This method helps to add author
    async add(author)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Check whether email is already assigned to the author
            var query = `select id from author where email = '${author.getEmail()}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
            {
                throw Error(`Author ${author.getName()} already exist`);
            }

            //Adding the author to the database
            query = `insert into author (email,name) values ('${author.getEmail()}','${author.getName()}')`;
            [resultSet] = await connection.query(query);
            var id = resultSet.insertId;
            author.setId(id);
            
            /*
            Sending the id at which the author is added
            with all other data of the author.
            */
            return author;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot add author");
        }
        finally
        {
            connection.release();
        }
    }

    //This method updates the author
    async update(author)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking whether author is present
            var query = `select name from author where id = ${author.getId()}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`Author ${author.getName()} does not exist`);
            }

            //Checking whether the upated email is 
            //already assigned to other author
            query = `select name from author where email = '${author.getEmail()}' and id <> ${author.getId()}`;
            [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
            {
                throw Error(`Another user with email ${author.getEmail()} already exist`);
            }

            //Updating the author in database
            query = `update author set name = '${author.getName()}', email = '${author.getEmail()}' where id = ${author.getId()}`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot update author");
        }
        finally
        {
            connection.release();
        }
    }

    //This method deletes the author
    async delete(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking whether author exist or not
            var query = `select name from author where id = ${id}`;       
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`Author ${id} does not exist`);
            }

            //Deleting author from database
            query = `delete from author where id = ${id}`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot delete author");
        }
        finally
        {
            connection.release();
        }
    }

    /*
    This method helps to get author object from
    email of the author this method is not used in
    the server
    */
    async getByEmail(authorEmail)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking the author exist for an email
            var query = `select * from author where email = '${authorEmail}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                return null;
            }
            var row = resultSet[0];
            var author = new Entities.Author(row.id,row.email,row.name);     
            return author;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get author");
        }
        finally
        {
            connection.release();
        }
    }
}

//This is the DAO Class for the Blog
class Blog
{
    //Getting all the blogs with particular company id
    async getByCompanyId(companyId)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Validation for whether company exist
            var company = new Company();
            if(await company.companyExist(companyId) == false)
            {
                throw Error(`Company id ${companyId} does not exist`);
            }

            //Selecting blogs from database
            var query = `select author.name as author_name,author.email,blog.author_id, blog.id,blog.content,DATE_FORMAT(blog.date, '%D %M %Y') as date,blog.role,blog.selection_status,blog.company_id,company.name as company_name from author inner join blog on author.id = blog.author_id inner join company on blog.company_id = company.id where company.id = ${companyId}`;
            var [resultSet] = await connection.query(query);
            var blogs = [];
            resultSet.map((row)=>
            {    
                var blog = new Entities.Blog(row.id,new Entities.Company(row.company_id, row.company_name),row.content,row.selection_status,new Entities.Author(row.author_id,row.email,row.author_name),row.role);
                blog.setDate(row.date);
                blogs.push(blog);
            });
            //Sending blogs to the server
            return blogs;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get blogs");
        }
        finally
        {
            connection.release();
        }
    }

    //This function add the blog to the database
    async add(blog)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var company = new Company();
            //Using the company exist function to check whether company is their
            if(await company.companyExist(blog.getCompany().getId()) == false)
            {
                throw Error(`Company ${blog.getCompanyId()} does not exist`);
            }
            //Inserting the blog to the database
            var query = `insert into blog (company_id,content,selection_status,author_id,role,date) values (${blog.getCompany().getId()},'${blog.getContent()}',${blog.getSelectionStatus()},${blog.getAuthor().getId()}, '${blog.getRole()}',current_date())`;
            var [resultSet] = await connection.query(query);
            blog.setId(resultSet.insertId);
            
            //Returning blog object with the id at which blog is added 
            //to the server
            return blog;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot add blog");
        } 
        finally
        {
            connection.release();
        }
    }

    //This function deletes the blog
    async delete(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            
            //Checking whether the blog exist
            var query = `select selection_status from blog where id = ${id}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`Blog with id ${id} does not exist`);
            }

            //Deleting the blog from database
            query = `delete from blog where id = ${id}`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot delete Blog");
        }
        finally
        {
            connection.release();
        }
    }
}

//This is the DAO Class for Request
class CompanyRequest
{
    //This method gives all the request present in
    //the database
    async getAll()
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select distinct(name), count (author_id) as count from company_request group by name`;
            var [resultSet] = await connection.query(query);
            var requests = [];
            resultSet.map((row)=>
            {
                console.log(row);
                var request = new Entities.CompanyRequest(row.name,null);
                request.setCount(row.count);
                requests.push(request);
            });
            
            //Returning the requests from database to server
            return requests;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get requests");
        }
        finally
        {
            connection.release();
        }
    }

    //This function is used to add the request to database
    async add(request)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            //Check whether company exist in database
            var query = `select id from company where lower(name) = '${request.getName().toLowerCase()}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
            {
                throw Error(`Company ${request.getName()} already exist`);
            }
            //Check for author exist or not and add if it does not exist
            //then add request to database.
            query = `insert into company_request values ('${request.getName()}',${request.getAuthor().getId()})`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot add request");
        }
        finally
        {
            connection.release();
        }
    }

    //This function accepts the request
    async accept(name)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            //get all the authors who made same request.
            var query = `select author.name,author.email from company_request inner join author on author.id = company_request.author_id where lower(company_request.name) = '${name.toLowerCase()}'`;
            //send mail to all the authors
            var [resultSet] = await connection.query(query);
            var authors = [];
            resultSet.map((row)=>
            {
                var author = new Entities.Author(0,row.email,row.name);
                authors.push(author);
            });
            authors.map((author)=>
            {
                var content = '<table style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd;">';
                content = content+'<tr>';
                content = content+'<td>';
                content = content+`<p style="color: #555555; font-size: 16px;">Dear ${author.getName()},</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">We are pleased to inform you that your request to add your Recruitment Experience for the <strong>${name}</strong> to our platform has been successfully accepted and processed.</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">The ${name} Recruitment Experience(s) are now live on our platform and available for students to view. We appreciate your time and contribution towards our platform.</p>`;
                content = content+'<p style="color: #555555; font-size: 16px;">If you have any further requests or need additional assistance, please feel free to reach out to us.</p>';
                content = content+'<p style="color: #555555; font-size: 16px;">Thank you for your continued support.</p>';
                content = content+'<p style="color: #555555; font-size: 16px;">Best Regards,<br>IET-PlacementInsights</p>';
                content = content+'</td>';
                content = content+'</tr>';
                content = content+'</table>';
                var subject = `${name} Request Accepted`;
                //Sending mail to the people
                email.sendEmails(author.getEmail(),subject,content);
            });
            //add company to database
            var company = new Company();
            var comp = await company.add(new Entities.Company(0,name));
            
            //Deleting the request from the database
            query = `delete from company_request where lower(name) = '${name.toLowerCase()}'`;
            await connection.query(query);
            
            //Returning the company with id at which 
            //company is added
            return comp;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot accept request");
        }
        finally
        {
            connection.release();
        }
    }

    //This function rejects the request
    async reject(name)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            //get all the authors who made same request.
            var query = `select author.name,author.email from company_request inner join author on author.id = company_request.author_id where lower(company_request.name) = '${name.toLowerCase()}'`;
            //send mail to all the authors
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
                throw Error(`No request for company ${name}`);
            var authors = [];
            resultSet.map((row)=>
            {
                var author = new Entities.Author(0,row.email,row.name);
                authors.push(author);
            });
            authors.map((author)=>
            {
                var subject = `${name} Request Rejected`;
                var content = `<table style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd;">`
                content = content+`<tr>`;
                content = content+`<td>`;
                content = content+`<p style="color: #555555; font-size: 16px;">Dear ${author.getName()},</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">We regret to inform you that your request to add your Recruitment Experience for the <strong>${name}</strong> to our platform has been rejected. Unfortunately, it does not meet our current criteria or requirements.</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">We understand this may be disappointing, but we encourage you to review our guidelines and reach out if you believe there may have been an oversight or if you need further clarification.</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">We appreciate your understanding and hope to assist you better in the future.</p>`;
                content = content+`<p style="color: #555555; font-size: 16px;">Best Regards,<br>IET-PlacementInsights</p>`;
                content = content+`</td>`;
                content = content+`</tr>`;
                content = content+`</table>`;
                email.sendEmails(author.getEmail(),subject,content);  
            });

            //Deleting the request from the database
            query = `delete from company_request where lower(name) = '${name.toLowerCase()}'`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot reject request");
        }
        finally
        {
            connection.release();
        }
    }
}

//This class has DAO for adding the request for publishing
//the blog on the website
class BlogRequest
{
    async getAll()
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select author.name as author_name, author.id as author_id, author.email, company.id as company_id, company.name as company_name , blog_request.id, blog_request.content, blog_request.selection_status, blog_request.role,DATE_FORMAT(blog_request.date, '%D %M %Y') as date from author inner join blog_request on author.id = blog_request.author_id inner join company on company.id = blog_request.company_id`;
            var [resultSet] = await connection.query(query);
            var blogRequests = [];
            resultSet.map((row)=>
            {
                var blog = new Entities.Blog(row.id,new Entities.Company(row.company_id, row.company_name), row.content,row.selection_status,new Entities.Author(row.author_id,row.email,row.author_name),row.role,row.date);
                blogRequests.push(blog);
            });
            return blogRequests;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get Requests for the blogs");
        }
        finally
        {
            connection.release();
        }
    }
    async add(blog)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            if(await new Company().companyExist(blog.getCompany().getId()) == false)
            {
                throw Error(`Company id ${blog.getCompany().getId()} does not exist`);
            }
            var query = `insert into blog_request (content,selection_status,author_id, company_id,role,date) values ('${blog.getContent()}', ${blog.getSelectionStatus()}, ${blog.getAuthor().getId()}, ${blog.getCompany().getId()}, '${blog.getRole()}', current_date())`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot add request for blog");
        }
        finally
        {
            connection.release();
        }
    }
    async reject(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select author.name as author_name, author.email, company.name as company_name from author inner join blog_request on author.id = blog_request.author_id inner join company on blog_request.company_id = company.id where blog_request.id = ${id}`
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
                throw Error(`Cannot find request for blog of id : ${id}`)
            var row = resultSet[0];
            var author = new Entities.Author(-1,row.email,row.author_name);
            var company = new Entities.Company(0,row.company_name);
            var subject = `Blog Post Rejection`;
            var content = `<h2 style="color: #f44336;">Blog Post Submission - Rejected</h2>`
            content = content+`<p>Dear ${author.getName()},</p>`;
            content = content+`<p>Thank you for submitting your blog post for "<strong>${company.getName()} Interview Experience</strong>" for consideration on our website. After careful review, our editorial team has decided not to move forward with publishing your submission at this time.</p>`;
            content = content+`<p>Please know that this decision was made after thorough consideration, and we encourage you to continue writing and contributing to the community. We appreciate your interest in our platform and hope you will consider submitting future content.</p>`;
            content = content+`<p>If you have any questions or need feedback, please feel free to reach out to us.</p>`;
            content = content+`<p>Best regards,</p>`;
            content = content+`<p>IET-PlacementInsights<br>IETDAVV, Indore</p>`;
            query = `delete from blog_request where id = ${id}`;
            await connection.query(query);
            email.sendEmails(author.getEmail(),subject,content);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot reject request");
        }
        finally
        {
            connection.release();
        }
    }
    async accept(id)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select author.name as author_name, author.email, author.id as author_id, blog_request.content, blog_request.selection_status, blog_request.date, blog_request.role, company.id as company_id, company.name as company_name from author inner join blog_request on author.id = blog_request.author_id inner join company on blog_request.company_id = company.id where blog_request.id = ${id}`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
                throw Error(`Blog request for id ${id} does not exist`);
            var row = resultSet[0];
            var company = new Entities.Company(row.company_id,row.company_name);
            var author = new Entities.Author(row.author_id,row.email,row.author_name);
            var blog = new Entities.Blog(0,company,row.content,row.selection_status,author,row.role,row.date);
            var subject = `Blog Post Acceptance`;
            var content = `<h2 style="color: #4CAF50;">Blog Post Submission - Accepted</h2>`;
            content = content+`<p>Dear ${author.getName()},</p>`;
            content = content+`<p>We are pleased to inform you that your blog post submission for "<strong>${company.getName()} Interview Experience</strong>" has been accepted for publication on our website.</p>`;
            content = content+`<p>Our editorial team has reviewed your submission and found it to be a valuable contribution to our readers.</p>`;
            content = content+`<p>If you have any questions or would like to discuss further details, feel free to reach out to us.</p>`;
            content = content+`<p>Thank you for your contribution!</p>`;
            content = content+`<p>Best regards,</p>`;
            content = content+`<p>IET-PlacementInsights<br>IETDAVV, Indore</p>`;
            var blogManager = new Blog();
            var blog = await blogManager.add(blog);
            var query = `delete from blog_request where id = ${id}`;
            await connection.query(query);
            email.sendEmails(author.getEmail(),subject,content);
            return blog;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot accept the request");
        }
        finally
        {
            connection.release();
        }
    }
}

//This is the DAO for the User to help for login and logout functionality
class User
{
    async getUserByEmail(email)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select * from user where email = '${email}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                return null;
            }
            var row = resultSet[0];
            var user = new Entities.User(row.id,row.email,row.password);
            user.setName(row.name);
            user.setRole(row.role);
            return user;
        }
        catch(err)
        {
            console.log(err);
            throw Error("Cannot get user");
        }
        finally
        {
            connection.release();
        }
    }
    async add(user)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            connection = await pool.getConnection();
            var query = `select name from user where email = '${user.getEmail()}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length > 0)
            {
                throw Error(`User with email ${user.getEmail()} already exist`);            
            }
            query = `insert into user (email,password,name,role) values('${user.getEmail()}', '${user.getPassword()}', '${user.getName()}', '${user.getPassword()}')`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Unable to add User");
        }
        finally
        {
            connection.release();
        }
    }
    async update(user)
    {
        var connection;
        try
        {
            var pool = await connector.getPool();
            var connection = await pool.getConnection();
            var query = `select email from user where email = '${user.getEmail()}'`;
            var [resultSet] = await connection.query(query);
            if(resultSet.length == 0)
            {
                throw Error(`User with email ${user.getEmail()} does not exist`);
            }
            query = `updte user set password = '${user.getPassword()}' where email = '${user.getEmail()}'`;
            await connection.query(query);
        }
        catch(err)
        {
            console.log(err);
            throw Error("Unable to update password");
        }
        finally
        {
            connection.release();
        }
    }
}
//Exporting Manager classes
module.exports = { Company, Author, Blog, CompanyRequest, BlogRequest, User };