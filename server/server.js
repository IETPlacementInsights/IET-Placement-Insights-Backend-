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

//Getting Entities and Manager from data layer
var Entities = require('./../data layer/Entities');
var Manager = require('./../data layer/Manager');

//Getting pre requisites for EJS
var ejs = require('ejs');
var ejsMate = require('ejs-mate');

//Getting body-parser for getting data in request
var bodyParser = require('body-parser');

//Getting path library
var path = require('path');

//Getting library for encryption of user passwords
var encrypter = require('./../utilities/Encryption');

//Getting session for maintaining sessions at server side
var session = require('express-session');

var flash = require('connect-flash');

//Setting the view engine
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

//Telling the path of EJS Files
app.set("views",path.join(__dirname,"./../../Frontend/views/company"));

//Declaring about data will be in urencoded form
app.use(bodyParser.urlencoded({"extended" : true}));

//Adding the static path for frontend
app.use(express.static(path.join(__dirname,"./../../Frontend/public")));  // To join current file i.e server.js to custom css/js files directory

//Using the session in server
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

app.use(flash());

// Middleware to flash messages
app.use((request,response,next) => {
    response.locals.good = request.flash("good");
    response.locals.bad = request.flash("bad");

    response.locals.path = "/blog/add";
    response.locals.path2 = request.path;

    // console.log(good, "RS");
    // console.log(request.flash("good"));    
    
    next();
});

//This API is for rendering the index.ejs file on the client side
app.get("/", (request,response)=>
{
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("index.ejs");
});
app.get("/login", (request,response)=>
{
    var error = "";
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }    

    response.render("login.ejs", {error});
});

app.get("/company/add", (request,response)=>
{
    if(checkSession(request) == false)
    {
        var error = "";
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("login.ejs", {error});
        return;
    } 
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("addCompany.ejs");
});

app.get("/blog/add",async (request,response)=>
{
    // console.log(request.path, "-1");

    if(checkSession(request) == false)
    {
        var error = "";
        response.locals.flag = checkSession(request);    
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        
        response.locals.path = "/blog/add";
        // console.log(request.path, "0");
        // response.redirect("/blog/add");
        response.render("login.ejs", {error});
        return;
    }

    var manager = new Manager.Company();
    var companies = await manager.getAll();
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }

    // console.log(request.path, "1");
    // response.redirect("/blog/add");
    // response.redirect(request.path);

    response.render("addBlog.ejs", {companies});
});

app.get("/company/add",async (request,response)=>
{
    if(checkSession(request) == false)
    {
        var error = "";
        response.locals.flag = checkSession(request);    
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }            
        response.render("login.ejs", {error});
        return;
    }
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("addCompany.ejs");
});
    
app.get("/user/add", (request,response)=>
{
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("addUser.ejs", {error : ""});
});


//This API is for rendering the about us page on client side
app.get("/about", (request,response)=>
{
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("about.ejs");
});

//Session creation and destroy code starts here
//This API will check for login credentials of the user and create a session
//if they are valid else return login page again
app.post("/login", async (request,response)=>
{
    if(checkSession(request) == true)
    {
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }

        response.render("index.ejs");
        return;
    }    
    try
    {
        var manager = new Manager.User();
        var email = request.body.email;
        var user = await manager.getUserByEmail(email);
        if(user == null)
        {
            var error = "Incorrect Username or Password";
            response.locals.flag = checkSession(request);
            response.locals.user = null;
            if(response.locals.flag == true)
            {
                response.locals.user = request.session.user;
            }
            response.render("login.ejs", {error});
            return;
        }
        var password = user.getPassword();
        var pass = request.body.password;
        if(await encrypter.comparePassword(password,pass) == false)
        {
            var error = "Incorrect Username or Password";

            response.locals.flag = checkSession(request);
            response.locals.user = null;
            if(response.locals.flag == true)
            {
                response.locals.user = request.session.user;
            }

            request.flash("bad", error);
            response.locals.bad = request.flash("bad");
            console.log(request.flash("bad"));
            
            response.render("login.ejs");
            return;
        }
        request.session.user = user;
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
            // request.flash("good", "You logged in successfully");
        }

        // showing flash message at top of page when user logged in
        // request.flash("good") ---> User successfully logged in
        // request.flash("bad") ---> Login issue with user

        request.flash("good", "Welcome to IET-PlacementInsights!!!");
        
        // storing request.flash("good") in local variable so that we can access this good variable in flash.ejs
        response.locals.good = request.flash("good");  

        // console.log(request.flash("good"));
        // console.log(response.locals.good);
        // console.log(success);

        // console.log(request.path);
        // console.log(request.originalUrl);
        // console.log(request.baseUrl);
        // console.log(request.session.redirectUrl);

        // response.redirect(request.path);

        // console.log(request.locals.path);
        // console.log(request.locals.path2);

        // response.redirect("/blog/add");

        // console.log(request.locals.path);
        // if(response.locals.path == "/blog/add"){
        //     console.log(request.locals.path);
        //     response.redirect(request.locals.path);
        // }

        response.render("index.ejs");
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This is the logout API which will destory the current session of the user
app.get("/logout", (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }

        response.render("index.ejs");
        return;
    }

    request.flash("good", "You logged out successfully!!!");
    response.locals.good = request.flash("good");

    request.session.destroy((error)=>
    {
        if(error)
        {
            console.log(error);
        }
    });

    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }
    response.render("index.ejs");
    // response.redirect("/");
});
//Session destroy code ends here

//User service starts here
//This API is for creating a user for website
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
        user = await manager.add(user);
        request.session.user = user;
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        request.flash("good", "Welcome to IET-PlacementInsights!!!");
        
        // storing request.flash("good") in local variable so that we can access this good variable in flash.ejs
        response.locals.good = request.flash("good");
        response.render("index.ejs");
    }
    catch(err)
    {
        console.log(err);
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        var error = err.message;

        request.flash("bad",error);
        response.locals.bad = request.flash("bad");

        response.render("addUser.ejs");

        //response.send({"success" : false, "error" : err.message});
    }
});

app.get("/user/update", (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("login.ejs");
        return;
    }
    response.locals.flag = checkSession(request);
    response.locals.user = null;
    if(response.locals.flag == true)
    {
        response.locals.user = request.session.user;
    }

    response.render("changePasswordPage.ejs");
});

//This API is for updating the password of the user
app.post("/user/update", async (request,response)=>
{    
    try
    {
        var email = request.session.user.email;
        var oldPassword = request.body.oldPassword;
        var newPassword = request.body.newPassword;
        var confirmPassword = request.body.confirmPassword; 
        if(newPassword != confirmPassword)
        {
            response.locals.flag = checkSession(request);
            response.locals.user = null;
         
            if(response.locals.flag == true)
            {
                response.locals.user = request.session.user;
            }

            request.flash("bad","Password doesn't match");
            response.locals.bad = request.flash("bad");

            response.render("changePasswordPage.ejs");
        }
        if(await encrypter.comparePassword(request.session.user.password,oldPassword) == false)
        {
            //Add a flash incorrect old password
            response.locals.flag = checkSession(request);
            response.locals.user = null;
            if(response.locals.flag == true)
            {
                response.locals.user = request.session.user;
            }

            request.flash("bad","Old password is incorrect!!!");
            response.locals.bad = request.flash("bad");

            response.render("changePasswordPage.ejs");
        }

        var password = await encrypter.encryptPassword(newPassword);
        var user = new Entities.User(-1,email,password);
        var manager = new Manager.User();
        await manager.update(user);

        request.session.user.password = password;
        response.locals.flag = checkSession(request);
        response.locals.user = null;

        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }

        response.render("index.ejs");
        //response.send({"success" : true});
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
        //response.send({"success" : true, "result" : companies});
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("companyList.ejs", {companies});
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
        var mngr = new Manager.Company();
        var company = await mngr.getCompanyById(companyId);
        var blogs = await manager.getByCompanyId(companyId);
        //response.send({"success" : true, "result" : blogs});
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("blogShow.ejs", {blogs,company});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
app.get("/blog/getAll", async (request,response)=>
{
    try
    {
        var manager = new Manager.Blog();
        var blogs = await manager.getAll();
        response.send({"success" : true, "result" : blogs});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});

//This service deletes a blog
app.post("/blog/delete", async (request,response)=>
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
        var companyId = request.body.companyId;
        var blogs = await manager.getByCompanyId(companyId);
        var mngr = new Manager.Company();
        var company = await mngr.getCompanyById(companyId);
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("blogShow.ejs", {blogs,company});
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
        var companyRequests = await manager.getAll();
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("companyRequest.ejs", {companyRequests});
        //response.send({"success" : true, "result" : requests});
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
        var authorName = request.session.user.name;
        var authorEmail = request.session.user.email;
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
        
        request.flash("good", "Your company request added successfully!!!");
        response.locals.good = request.flash("good");        

        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("index.ejs");
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
        var companyRequests = await manager.getAll();
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("companyRequest.ejs", {companyRequests});
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
        var companyRequests = await manager.getAll();
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("companyRequest.ejs", {companyRequests});
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
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("blogRequest.ejs", {blogRequests});
        //response.send({"success" : true, "result" : blogRequests});
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
        var authorName = request.session.user.name;
        var authorEmail = request.session.user.email;    
        var author = await new Manager.Author().getByEmail(authorEmail)
        if(author == null)
        {
            author = await new Manager.Author().add(new Entities.Author(-1,authorEmail,authorName));
        }

        var blog = new Entities.Blog(-1,new Entities.Company(companyId,""),content,selectionStatus,author,role,"");
        var manager = new Manager.BlogRequest();
        await manager.add(blog);

        request.flash("good", "Your blog request added successfully!!!");
        response.locals.good = request.flash("good");    

        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }

        // response.send({"success" : true});
        response.render("index.ejs");
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
       var blogRequests = await manager.getAll();
       response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
       response.render("blogRequest.ejs", {blogRequests});
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
        var blogRequests = await manager.getAll();
        response.locals.flag = checkSession(request);
        response.locals.user = null;
        if(response.locals.flag == true)
        {
            response.locals.user = request.session.user;
        }
        response.render("blogRequest.ejs", {blogRequests});
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
//BlogRequest service ends here

//Like service starts here
app.post("/like", async (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.send("You are not authorised");
    }
    try
    {
        var blogId = request.body.blog_id;
        var userId  = request.session.user.id;
        var url = request.body.url;
        var manager = new Manager.Like();
        var like = new Entities.Like(userId,blogId);
        await manager.add(like);
        response.redirect(url);     
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false, "error" : err.message});
    }
});
app.post("/dislike", async (request,response)=>
{
    if(checkSession(request) == false)
    {
        response.send("You are unauthorised");
    }
    try
    {
        var userId = request.session.user.id;
        var blogId = request.body.blog_id;
        var url = request.body.url;
        var like = new Entities.Like(userId,blogId);
        var manager = new Manager.Like();
        await manager.delete(like);
        response.redirect(url);
    }
    catch(err)
    {
        console.log(err);
        response.send({"success" : false,"error" : err.message});
    }
});
//Like service ends here

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