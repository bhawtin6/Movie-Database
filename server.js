const pug = require("pug");
const http = require("http");
const express = require ("express");
const bodyParser = require('body-parser');
const fs = require("fs");
const { toNamespacedPath } = require("path");
let app = express();

//track's logged in user's id
let curUser = 0;
let movies = [];
let users = [];
let sresults = []; 
let reccs = [];



let moviesfromfile = JSON.parse(fs.readFileSync("movie-data.json"));
moviesfromfile.forEach(m => {
    var newm = {
        id: movies.length,
        title: m.Title,
        duration: m.Runtime,
        genre: m.Genre,
        year: m.Year,
        plot: m.Plot,
        writers: m.Writer,
        directors: m.Director,
        actors: m.Actors,
        reviews: [],
        averageScore: -1,
        searchScore: 0
    }
    movies.push(newm);
})

movies.forEach(m => {
    
})




//temp list of users
users = [
    {
        id: 0,
        password: "0",
        name: "Bennett",
        //regular = 0, contributing = 1
        type: 1,
        followedActors: ["Corey Feldman", "Jack Nance", "Bob Logan"], //done by name
        followedUsers: [2], //done by id
        watched: [761, 1663, 699],
        reviews: [],
        notifs: [{id:0, dismissed: false, text: "Jerry has started following you"},{id:1, dismissed: false, text: "Bob Logan is in a new movie called Meatballs 4"}],
    },
    {
        id: 1,
        password: "123",
        name: "Jerry",
        type: 0,
        followedActors: ["Tom Hanks"],
        followedUsers: [0], //done by id
        watched: [1500, 400, 33],
        reviews: [],
        notifs: [],
    },
    {
        id: 2,
        password: "abc",
        name: "Taylor",
        type: 0,
        followedActors: ["Pat Proft"], 
        followedUsers: [1], //done by id
        watched: [100, 101, 102, 103, 104, 105],
        reviews: [],
        notifs: [],
    }]

//Express set up
app.set("view engine", "pug");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Route Handling

//home landing page
app.get("/", (req, res, next) => {
    res.render('pages/home', {users:users, curUser:curUser});
});

//page for signing in 
app.get("/signin/", (req, res, next) => {
    message = [];
    res.render('pages/signin', {curUser:curUser, users:users, message:message});
})

//handling a sign in 
app.post("/signin/", (req, res, next) => {
    message = [];
    success = 0;
    users.forEach(u => {
        if (u.name === req.body.uname){
            if (u.password === req.body.pword){
                curUser = u.id;
                success = 1;
            }
        }
    })
    if (success == 0){
        message.push("Login failed. Please try again.")
        res.render('pages/signin', {curUser:curUser, users:users, message:message});
    }
    else{
        res.redirect("http://localhost:3000/users/")
    }
})

app.post("/signin/signout/", (req, res, next) =>{
    curUser = -1;
    res.redirect("http://localhost:3000/signin/");
})

//page that allows user to sign up
app.get("/signup/", (req, res, next) => {
    let message = [];
    res.render('pages/signup', {curUser:curUser, users:users, message:message});
})

//handling a signup
app.post("/signup", (req, res, next) => {
    //create new user object
    //push to users
    //set curUser
    //send user to their profile. i want to do this part better
    uname = req.body.uname;
    pword = req.body.pword;
    taken = 0;
    if (uname.length < 1 || pword.length < 1){
        let message = [];
        message.push("You must enter a username and a password");
        res.render('pages/signup', {curUser:curUser, users:users, message:message});
        return;
    }
    users.forEach(u => {
        if (u.name === uname){
            taken = 1;
        }
    })
    if (taken){
        let message = [];
        message.push("That username is already taken. Please try a different username");
        res.render('pages/signup', {curUser:curUser, users:users, message:message});
    }
    else {
        newU = {
            id: users.length,
            password: pword,
            name: uname,
            type: 0,
            followedActors: [], 
            followedUsers: [], 
            watched: [],
            reviews: [],
        }
        users.push(newU);
        curUser = newU.id;
        res.redirect('http://localhost:3000/users/'+curUser);
    }
})

//page for searching
app.get("/search/", (req, res, next) => {
    res.render('pages/search');
})

//search results for when user clicks on a genre
app.get("/search/genre/:genre", (req, res, next) => {
    let genre = req.params.genre;
    console.log(genre)
    sresults = [];
    movies.forEach(m => {
        m.searchScore = 0;
        m.genre.forEach(g=>{
            if (g.toLowerCase()===genre.toLowerCase()) sresults.push(m);
        })
    })

    res.redirect("http://localhost:3000/searchresults/0");
})

//handling a search
app.post("/search/", (req, res, next) => {
    //use function to get search results by:
    //go through each of the movies
    //compare each movie to the parameters, assigning a score
    //return a list of x movies with top score
    
    //search criteria
    let title = req.body.title.toLowerCase().trim();
    let genre = req.body.genre.toLowerCase().trim();
    let actor = req.body.actor.toLowerCase().trim();
    //holds results
    sresults = [];
    //go through each movie
    movies.forEach(m => {
        //set score to 0
        m.searchScore = 0;
        //check if movie is valid
        if (m.title !== ""){
            //assign score
            //full title match =16pts
            if (m.title.toLowerCase() === title) m.searchScore += 16;
            //word match = 3 per word
            m.title.split(" ").forEach(x => {
                if (title.toLowerCase().split(" ").includes(x.toLowerCase())) m.searchScore += 3;
            })
            //genre match = 4 pts
            m.genre.forEach(g=>{
                if (g.toLowerCase()===genre) m.searchScore += 4;
            })
            //people match = 5 points
            m.actors.forEach(p => {
                if (p.toLowerCase()===actor) m.searchScore +=5;
            });
            m.directors.forEach(p => {
                if (p.toLowerCase()===actor) m.searchScore +=5;
            });
            m.writers.forEach(p => {
                if (p.toLowerCase()===actor) m.searchScore +=5;
            });
        }
        //if score is greater than 0, add to results array
        if (m.searchScore > 0) sresults.push(m)
    })

    //sort results array
    sresults.sort((a,b) => {
        return (b.searchScore-a.searchScore)
    })
    
    res.redirect("http://localhost:3000/searchresults/0");
})

app.get("/searchresults/:page", (req, res, next) =>{
    let page = parseInt(req.params.page);
    let results = [];
    let numresults = sresults.length;
    let min = Math.min((sresults.length)-20*page,20)
    for (let i = 0; i<min ; i++){
        results.push(sresults[i+20*page].id);     
    }
    res.render('pages/searchResults', {movies:movies, results:results, page:page, totalResults:sresults.length});
})

//viewing a given movie
app.get("/movie/:mid", (req, res, next) => {
    //get current movie id
    curMovie = req.params.mid;
    let total = 0;
    movies[curMovie].reviews.forEach(s => {
        total += s.score;
    });
    if (total !== 0) movies[curMovie].averageScore = total/movies[curMovie].reviews.length;
    else movies[curMovie].averageScore = "No ratings";

    //holds scoring results
    sresults = [];
    //go through every movie
    movies.forEach(m => {
        //set score to 0
        m.searchScore = 0;
        //verify movie is valid
        if (m.title !== ""){
            //compare genres, 5 pts for a match
            m.genre.forEach(g=>{
                movies[curMovie].genre.forEach(x=>{
                    if (x.toLowerCase() === g.toLowerCase()) m.searchScore += 5;
                }) 
            })
            //compare actors, 2 pts for a match
            m.actors.forEach(p => {
                movies[curMovie].actors.forEach(x=>{
                    if (x.toLowerCase() === p.toLowerCase()) m.searchScore += 2;
                }) 
            });
            //compare directors, 2 pts for a match
            m.directors.forEach(p => {
                movies[curMovie].directors.forEach(x=>{
                    if (x.toLowerCase() === p.toLowerCase()) m.searchScore += 2;
                }) 
            });
            //compare writers, 2 pts for a match
            m.writers.forEach(p => {
                movies[curMovie].writers.forEach(x=>{
                    if (x.toLowerCase() === p.toLowerCase()) m.searchScore += 2;
                }) 
            });
            //remove the currently viewed movie from the results
            if (parseInt(m.id) === parseInt(curMovie)) m.searchScore = 0;
        }
        //add movie to results array if its score > 0
        if (m.searchScore > 0) sresults.push(m)
        
    })
    //sort the results by descending score
    sresults.sort((a,b) => {
        return (b.searchScore-a.searchScore)
    })

    //fill similarMovies array best results for use
    let similarMovies = [];
    let num = Math.min(8,sresults.length)
    for (let i = 0; i <num ; i++){
        similarMovies.push(sresults[i]);
    }
    
    res.render('pages/movie', {movie:movies[req.params.mid], similarMovies:similarMovies, curUser:curUser, users:users});
});

//creating new movie
app.post("/movie/", (req, res, next) => {
    //create new movie object, based on req.body
    //checks will be done to ensure that all input data is valid
    //push that object onto movies array
    //probably render the movie page that was just created
    if (req.body.title === ""){
        let message = [];
        message.push("You must enter a Title")
        res.render("pages/contribute.pug", {users:users, curUser:curUser, message:message});
        return;
    }
    var genres = req.body.genres.split(",");
    for (let i = 0; i < genres.length ; i++){
        genres[i]=genres[i].trim();
    }
    var actors = req.body.actors.split(",");
    for (let i = 0; i < actors.length ; i++){
        actors[i]=actors[i].trim();
        users.forEach(u => {
            if (u.followedActors.includes(actors[i])){
                let s = actors[i] + " is starring in a new movie called " + req.body.title;
                let newnote = {
                    id: u.notifs.length,
                    dismissed: false,
                    text: s
                }
                u.notifs.push(newnote);
            }
        })
    }
    var directors = req.body.directors.split(",");
    for (let i = 0; i < directors.length ; i++){
        directors[i]=directors[i].trim();
        users.forEach(u => {
            if (u.followedActors.includes(directors[i])){
                let s = directors[i] + " is directing a new movie called " + req.body.title;
                let newnote = {
                    id: u.notifs.length,
                    dismissed: false,
                    text: s
                }
                u.notifs.push(newnote);
            }
        })
    }
    var writers = req.body.writers.split(",");
    for (let i = 0; i < writers.length ; i++){
        writers[i]=writers[i].trim();
        users.forEach(u => {
            if (u.followedActors.includes(writers[i])){
                let s = writers[i] + " wrote a new movie called " + req.body.title;
                let newnote = {
                    id: u.notifs.length,
                    dismissed: false,
                    text: s
                };
                u.notifs.push(newnote);
            }
        })
    }

    var newm = {
        id: movies.length,
        title: req.body.title,
        duration: req.body.duration,
        genre: genres,
        year: req.body.year,
        plot: req.body.plot,
        writers: writers,
        directors: directors,
        actors: actors,
        reviews: [],
        averageScore: -1,
        searchScore: 0
    }
    movies.push(newm);
    res.redirect('http://localhost:3000/movie/'+newm.id);
})

//viewing a given person (person meaning actor, writer or director)
app.get("/people/:pname", (req, res, next) => {
    p = req.params.pname;
    acted = []
    wrote = []
    directed = []
    listOfFrequenters = []
    movies.forEach(m => {
        let counted = 0;
        if (m.title !== ""){
            if (m.actors.includes(p)) {
                acted.push(m);
                console.log("m.actors: "+m.actors)
                m.actors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.directors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.writers.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                counted = 1;
            }    
            if (m.directors.includes(p)) {
                directed.push(m);
                m.actors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.directors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.writers.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                counted = 1;
            }
            if (m.writers.includes(p)) {
                wrote.push(m);
                m.actors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.directors.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                m.writers.forEach(a => {
                    if (a !== p && counted === 0) listOfFrequenters.push(a);
                })
                counted = 1;
            }
        }   
    });
    
    cnames = [];
    ccount = [];
    listOfFrequenters.forEach(p => {
        if (!cnames.includes(p)){
            cnames.push(p);
            ccount.push(1);
        }
        else{
            for (var i = 0 ; i < cnames.length ; i++){
                if (cnames[i] === p) {
                    ccount[i] += 1;
                    break;
                }
            }
        }
    })
    

    cobj = [];
    for (var i = 0 ; i <cnames.length ; i++){
        newcobj = {
            name: cnames[i],
            count: ccount[i]
        }
        cobj.push(newcobj);
    }
    
    
    cobj.sort((a,b) => {
        return (b.count - a.count)
    })
    
    var min = Math.min(cobj.length,7);
    let collabs = []; 
    for (var i = 0; i < min; i++){
        collabs.push(cobj[i]);
    }

    
    res.render('pages/people', {name:p, acted: acted, wrote: wrote, directed:directed, collabs:collabs});
});

//creating new actor
app.post("/people/", (req, res, next) => {
    var newm = {
        id: movies.length,
        title: "",
        duration: "",
        genre: "",
        year: "",
        plot: "",
        writers: "",
        directors: "",
        actors: req.body.name,
        reviews: [],
        averageScore: 0,
        searchScore: 0
    }
    movies.push(newm);
    res.redirect('http://localhost:3000/people/'+req.body.name);
})

//changing user type
app.post("/users/type/:uid", (req, res, next) =>{
    let uid = req.params.uid;
    users[uid].type = !(users[uid].type);
    res.redirect("http://localhost:3000/users/");
})

app.post("/users/notifs/:nid", (req, res, next) =>{
    let nid = parseInt(req.params.nid);
    users[curUser].notifs[nid].dismissed = true;
    res.redirect("http://localhost:3000/users/");
})

app.post("/users/watched/remove/:mid", (req, res, next) =>{
    let mid = parseInt(req.params.mid);
    const index = users[curUser].watched.indexOf(mid);
    if (index > -1) {
        users[curUser].watched.splice(index, 1);
    }
    res.redirect("http://localhost:3000/users/");
})

app.post("/users/followedUsers/remove/:uid", (req, res, next) =>{
    let uid = parseInt(req.params.uid);
    const index = users[curUser].followedUsers.indexOf(uid);
    if (index > -1) {
        users[curUser].followedUsers.splice(index, 1);
    }
    res.redirect("http://localhost:3000/users/");
})

app.post("/users/followedActors/remove/:pid", (req, res, next) =>{
    let pid = req.params.pid;
    const index = users[curUser].followedActors.indexOf(pid);
    if (index > -1) {
        users[curUser].followedActors.splice(index, 1);
    }
    res.redirect("http://localhost:3000/users/");
})

app.post("/users/watched/:mid", (req, res, next) =>{
    let mid = req.params.mid;
    if (!(users[curUser].watched.includes(mid))) users[curUser].watched.push(mid);
    res.redirect("http://localhost:3000/movie/"+mid);
})

app.post("/users/followedActors/:aname", (req, res, next) =>{
    let actor = req.params.aname;
    if (!(users[curUser].followedActors.includes(actor))) users[curUser].followedActors.push(actor);
    res.redirect("http://localhost:3000/people/"+actor);
})


app.post("/users/followedUsers/:uid", (req, res, next) => {
    uid = parseInt(req.params.uid);
    if (!(users[curUser].followedUsers.includes(uid))){
        users[curUser].followedUsers.push(uid);
        let s = users[curUser].name + " has started following you";
        let newnote = {
            id: users[uid].notifs.length,
            dismissed: false,
            text: s
        }
        users[uid].notifs.push(newnote);
    }
    res.redirect('http://localhost:3000/users/'+uid);
})

//viewing logged in user's profile
//I plan to add more personalized functionality, especially in regards to treated a user's own profile differently than viewing someone else's
app.get("/users/", (req, res, next) => {
    res.redirect('http://localhost:3000/users/'+curUser);
})

//viewing a given user's profile
app.get("/users/:uid", (req, res, next) => {
    //holds the search results
    sresults = []
    //get user id
    let uid = parseInt(req.params.uid);
    //array of strings representing actors
    peeps = [...users[uid].followedActors]
    //array of strings representing genres
    genrs = [];
    //for every movie the person has watched, add 
    //to the above arrays
    users[uid].watched.forEach(w => {
        movies[w].genre.forEach(g => {
            genrs.push(g)
        })
        movies[w].actors.forEach(p => {
            peeps.push(p)
        })
        movies[w].directors.forEach(p => {
            peeps.push(p)
        })
        movies[w].writers.forEach(p => {
            peeps.push(p)
        })
    }) 
    //for every movie, assign a score based on how closely 
    //it matches the genrs and peeps arrays
    movies.forEach(m =>{
        m.searchScore = 0;
        //removes invalid movies
        if (m.title !== ""){
            //matching a genre = 1 point
            genrs.forEach(g=>{
                if (m.genre.includes(g)) m.searchScore ++;
            })
            //matching a person = 3 points
            peeps.forEach(p => {
                if (m.actors.includes(p)) m.searchScore+=3;
                if (m.directors.includes(p)) m.searchScore+=3;
                if (m.writers.includes(p)) m.searchScore+=3;
            })
            //removes movies that the user has already watched 
            //from the search results
            users[uid].watched.forEach(w => {
                if (movies[w].id === m.id) m.searchScore = 0;
            });
        }
        //if the movie's score is greater than 0, add it to the 
        //search results
        if (m.searchScore >0) sresults.push(m)
    })
    //sort the results
    sresults.sort((a,b) => {
        return (b.searchScore-a.searchScore)
    })
    //fill up the reccomendations array with the best 6 results
    let reccs = [];
    min = Math.min(6, sresults.length);
    for (let i = 0; i <min; i++){
        reccs.push(sresults[i]);
    }

    res.render('pages/user', {user:req.params.uid, users:users, movies:movies, curUser:curUser, reccs:reccs} );
})

//viewing the details of a given review of a given movie
app.get("/review/:mid/:rid", (req, res, next) => {
    let mid = req.params.mid;
    let rid = req.params.rid;
    let movie = movies[mid];
    let review = movie.reviews[rid];
    let op = users[review.op];
    res.render('pages/review', {op:op, movie:movie, review:review});
})

//posting a new review to a movie's review section
app.post("/review/:mid", (req, res, next) => {
    //add review to movie
    let tempid = movies[req.params.mid].reviews.length;
    let newReview = {
        id: tempid,
        op: curUser,
        score: parseInt(req.body.score),
        summary: req.body.summary,
        text: req.body.text
    }
    movies[req.params.mid].reviews.push(newReview);
    
    //add review to user
    let newRev = {
        mid: req.params.mid,
        rid: tempid,
    }
    users[curUser].reviews.push(newRev);

    //recalculate average
    let avg = 0;
    let total = 0;
    movies[curMovie].reviews.forEach(s => {
        total += s.score;
    });
    avg = total/movies[curMovie].reviews.length;
    movies[curMovie].averageScore = avg;
    let similarMovies = [0,1,2]; //temporary way of getting list of similar movies
    res.redirect('http://localhost:3000/movie/'+curMovie);
})

app.get("/contribute/", (req, res, next) => {
    message = [];
    res.render("pages/contribute.pug", {users:users, curUser:curUser, message:message});
})

app.listen(3000);
console.log("Server listening at http://localhost:3000");
