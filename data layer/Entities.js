/*
This file has all the entities related to project
It is DTO for the project which includes getter setter
of each entity
*/

//Company is an entity
class Company
{
    //Initialize values of an object
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }
    
    // Getter and Setter of the company
    setId(id)
    {
        this.id = id;
    }
    getId()
    {
        return this.id;
    }
    setName(name)
    {
        this.name = name;
    }
    getName()
    {
        return this.name;
    }
}

//Author entity for storing the author data
class Author
{
    //Initialise Author
    constructor(id,email,name)
    {
        this.id = id;
        this.email = email;
        this.name = name;
    }
    
    //Getter and Setter of the Author
    setId(id)
    {
        this.id = id;
    }
    getId()
    {
        return this.id;
    }
    setEmail(email)
    {
        this.email = email;
    }
    getEmail()
    {
        return this.email;
    }
    setName(name)
    {
        this.name = name;
    }
    getName()
    {
        return this.name;
    }
}

//This is the blog class
class Blog
{
    //Initialising blog class
    constructor(id,company,content,selectionStatus,author,role,date)
    {
        this.id = id;
        this.company = company;
        this.content = content;
        this.selectionStatus = selectionStatus;
        this.author = author;
        this.role = role;
        this.date = date;
    }
    
    //Getter and Setter for blog class
    setId(id)
    {
        this.id = id;
    }
    getId()
    {
        return this.id;
    }
    setCompany(company)
    {
        this.company = company;
    }
    getCompany()
    {
        return this.company;
    }
    setContent(content)
    {
        this.content = content;
    }
    getContent()
    {
        return this.content;
    }
    setSelectionStatus(selectionStatus)
    {
        this.selectionStatus = selectionStatus;
    }
    getSelectionStatus()
    {
        return this.selectionStatus;
    }
    setAuthor(author)
    {
        this.author = author;
    }
    getAuthor()
    {
        return this.author;
    }
    getRole()
    {
        return this.role;
    }
    setRole(role)
    {
        this.role = role;
    }
    getDate()
    {
        return this.date;
    }
    setDate(date)
    {
        this.date = date;
    }
}

//This is company request class which helps to add request for a company
class CompanyRequest
{
    //Initialising the class
    constructor(name,author)
    {
        this.name = name;
        this.author = author;
    }

    //Getter Setter of the request entity
    getName()
    {
        return this.name;
    }
    setName(name)
    {
        this.name = name;
    }
    getAuthor()
    {
        return this.author;
    }
    setAuthor(author)
    {
        return this.author = author;
    }
    setCount(count)
    {
        this.count = count;
    }
    getCount()
    {
        return this.count;
    }
}

//This is the DTO for user which helps for transferring data
//for login and logout
class User
{
    constructor(id,email,password)
    {
        this.id = id;
        this.email = email;
        this.password = password;
    }
    getId()
    {
        return this.id;
    }
    setId(id)
    {
        this.id = id;
    }
    getEmail()
    {
        return this.email;
    }
    setEmail(email)
    {
        this.email = email;
    }
    getPassword()
    {
        return this.password;
    }
    setPassword(password)
    {
        this.password = password
    }
    getName()
    {
        return this.name;
    }
    setName(name)
    {
        this.name = name;
    }
    getRole()
    {
        return this.role;
    }
    setRole(role)
    {
        this.role = role;
    }
}

//Exporting entitiies
module.exports = { Company, Author, Blog, CompanyRequest, User };