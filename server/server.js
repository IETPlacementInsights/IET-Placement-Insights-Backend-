/*
This file is the server file which accepts request
and send response to the front end
The response structure is : 
for Success : 
{
    "success" : true,
    "result" : RESULT {This part is optional}
}
for Failure : 
{
    "success" : false,
    "error" : {ERROR MESSAGE AS A STRING}
}
*/

//Loading pre requisites for the server
var express = require('express');
var app = express();
var Entities = require('./../data layer/Entities');
var Manager = require('./../data layer/Manager');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var bodyParser = require('body-parser');
var path = require('path');
var encrypter = require('./../utilities/Encryption');
var session = require('express-session');
//Informing the server that data will be coming in the JSON Format
//app.use(express.json());//MiddleWare
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views",path.join(__dirname,"./../../Frontend/views/company"));
app.use(bodyParser.urlencoded({"extended" : true}));
app.use(session({
    "secret" : "IET Placement Insights",
    "resave" : false,
    "saveUninitialized" : false
}));
//Function to check whether session is present or not
function checkSession(request)
{
    if(request.session)
    {
        if(!request.session.user)
            return false;
        if(request.session.user.email && request.session.user.email != null && request.session.user.role && request.session.user.role != null)
            return true;
    }
    return false;
}

//These API's are for testing purpose only
app.get("/", (request,response)=>
{
    response.render("index.ejs");
});
app.get("/about", (request,response)=>
{
    response.render("about.ejs");
});

//Session creation and destroy code starts here
app.post("/login", async (request,response)=>
{
    try
    {
        var manager = new Manager.User();
        var email = request.body.email;
        var user = await manager.getUserByEmail(email);
        var password = user.getPassword();
        var pass = request.body.password;
        if(await encrypter.comparePassword(password,pass) == false)
        {
            response.send("Unauthorised User");
            return;
        }
        request.session.user = user;
        response.send("Logged in");
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
app.post("/logout", (request,response)=>
{
    request.session.destroy((error)=>
    {
        if(error)
            response.send("Cannot log out of the session");
    });
    response.send("Logged out of the session");
});
//Session destroy code ends here

//User service starts here
app.post("/user/add", async (request,response)=>
{
    try
    {
        var email = request.body.email;
        var name = request.body.name;
        var password = await encrypter.encryptPassword(request.body.password);
        var user = new Entities.User(0,email,password);
        user.setName(name);
        user.setRole("author");
        var manager = new Manager.User();
        await manager.add(user);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
app.post("/user/update", async (request,response)=>
{
    try
    {
        var email = request.body.email;
        var password = await encrypter.encryptPassword(request.body.password);
        var user = new Entities.User(-1,email,password);
        var manager = new Manager.User();
        await manager.update(user);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//User service ends here
//Company Services Starts Here
//This service helps to get all companies from databse
app.get("/company/getAll",async (request,response)=>
{
    try
    {
        var manager = new Manager.Company();
        var companies = await manager.getAll();
        response.send({"success" : true, "result" : companies});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service helps to delete an existing company's data from database
app.delete("/company/delete", async (request,response)=>
{
    if(checkSession(request) == false || request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var id = request.body.id;
        var manager = new Manager.Company();
        await manager.delete(id);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//Company Service Ends Here


//Blog Service Starts Here

//This service gives all the blogs related to company id
app.get("/blog/getAll/:companyId",async (request,response)=>
{
    try
    {
        var companyId = request.params.companyId;
        var manager = new Manager.Blog();
        var blogs = await manager.getByCompanyId(companyId);
        response.send({"success" : true, "result" : blogs});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service deletes a blog
app.delete("/blog/delete", async (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var id = request.body.id;
        //Validation that the owner of the blog is deleting the blog
        var manager = new Manager.Blog(); 
        await manager.delete(id);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false,"error" : err.message});
    }
});

//Blog service ends Here


//CompanyRequest service starts here

//This service gets all requests
app.get("/company/request/getAll", async (request,response)=>
{
    if(checkSession(request) == false || request.session.user.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var manager = new Manager.CompanyRequest();
        var requests = await manager.getAll();
        response.send({"success" : true, "result" : requests});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service adds a request
app.post("/company/request/add", async (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var name = request.body.name;
        var authorName = request.body.author_name;
        var authorEmail = request.body.author_email;
        var authr = new Entities.Author(0,authorEmail,authorName);
        var manager = new Manager.Author();
        
        //Checking whether author exist or not
        var author = await manager.getByEmail(authr.getEmail());
        if(author == null)
        {
            //If does not exist adding the author
            author = await manager.add(new Entities.Author(0,authr.email,authr.name));
        }
        var companyRequest = new Entities.CompanyRequest(name,author);
        manager = new Manager.CompanyRequest();
        await manager.add(companyRequest);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false,"error" : err.message});
    }
});

//This service accepts the request
app.post("/company/request/accept", async (request,response)=>
{
    if(checkSession(request) == false && request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var name = request.body.name;
        var manager = new Manager.CompanyRequest();
        var company = await manager.accept(name);
        response.send({"success" : true, "result" : company});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, err : err.message});
    }
});

//This service rejects the request
app.post("/company/request/reject", async (request,response)=>
{
    if(checkSession(request) == false && request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var name = request.body.name;
        var manager = new Manager.CompanyRequest();
        await manager.reject(name);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, err : err.message});
    }
});
    
//CompanyRequest service ends here

//BlogRequest service starts here
//This method displays all the requests for the blogs
app.get("/blog/request/getAll", async (request,response)=>
{
    if(checkSession(request) == false && request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var manager = new Manager.BlogRequest();
        var blogRequests = await manager.getAll();
        response.send({"success" : true, "result" : blogRequests});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//This method adds a request for the blog
app.post("/blog/request/add", async (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var content = request.body.content;
        var selectionStatus = request.body.selection_status;
        var role = request.body.role;
        var companyId = request.body.company_id;
        var authorName = request.body.author_name;
        var authorEmail = request.body.author_email;    
        var author = await new Manager.Author().getByEmail(authorEmail)
        if(author == null)
        {
            author = await new Manager.Author().add(new Entities.Author(-1,authorEmail,authorName));
        }
        var blog = new Entities.Blog(-1,new Entities.Company(companyId,""),content,selectionStatus,author,role,"");
        var manager = new Manager.BlogRequest();
        await manager.add(blog);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//This service helps admin to accept a blog
app.post("/blog/request/accept", async (request,response)=>
{
    if(checkSession(request) == false && request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
       var id = request.body.id;
       var manager = new Manager.BlogRequest();
       var blog = await manager.accept(id);
       response.send({"success" : true, "result" : blog});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//This service helps to reject the request for the blog
app.post("/blog/request/reject", async (request,response)=>
{
    if(checkSession(request) == false && request.session.role != "admin")
    {
        response.send("You are not authorized");
        return;
    }
    try
    {
        var id = request.body.id;
        var manager = new Manager.BlogRequest();
        await manager.reject(id);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//BlogRequest service ends here
    
//We define the port number on which server is needed to be started
//Also if port is occupied then we display the error
app.listen(5050,(err)=>
{
    if(err)
    {
        console.log(err);
        return;
    }
    //else we display this
    console.log("Server Started on PORT : 5050");
});


/*
These are the Part of the apis which are not in use
These API's are updated and their functionalities are changed.
//This service updates the blog
app.put("/blog/update", async (request,response)=>
{
    try
    {
        var id = request.body.id;
        var content = request.body.content;
        var selectionStatus = request.body.selectionStatus;
        var manager = new Manager.Blog();
        var blog = new Entities.Blog(id,null,content,selectionStatus,null,null);
        await manager.update(blog);
        response.send({"success": true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message})
    }
});

//This service adds a blog
app.post("/blog/add",async (request,response)=>
{
    try
    {
        var authorEmail = request.body.authorEmail;
        var authorName = request.body.authorName;
        var content = request.body.content;
        var selectionStatus = request.body.selectionStatus;
        var companyId = request.body.companyId;
        var role = request.body.role;
        var company = new Entities.Company(companyId,"");
        var manager = new Manager.Author();
        var author = await manager.getByEmail(authorEmail);
        if(author == null)
        {
            author = await manager.add(new Entities.Author(0,authorEmail,authorName));
        }
        manager = new Manager.Blog();
        var blog = await manager.add(new Entities.Blog(0,company,content,selectionStatus,author,role));
        response.send({"success" : true, "result" : blog});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service helps to update data of an existing company in database
app.put("/company/update",async (request,response)=>
{
    try
    {
        var name = request.body.name;
        var id = request.body.id;
        var company = new Entities.Company(id,name);
        var manager = new Manager.Company();
        await manager.update(company);
        response.send({"success" : true});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service helps to add company to database
app.post("/company/add",async (request,response)=>
{
    try
    {
        var name = request.body.name;
        var company = new Entities.Company(-1,name);
        var manager = new Manager.Company();
        company = await manager.add(company); 
        response.send({"success" : true, "result" : company});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
*/