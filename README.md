# Movie-Database
A small movie database, modelled after IMDB.  Some of the capabilities of the program are as follows: 
  - Shows details of movies (supplied by "movie-data.json"), such as actors, genre, plot, duration, reviews, etc.
  - Shows what movies have starred given actors/directors/writers
  - Allows users to create profiles, permitting them to follow actors, write reviews, select movies they've watched, expand the database by adding new movies and people, and more. 
  - Supports logging in/out, using basic user authentication (usernames and passwords)
  - Reccomends movies based on a given movie, or by the activity of a given user
  - Allows user to search for a movie using user-submimtted criteria

### Installing and Running
  1. Download all files and folders to a known directory. Ensure that file structure is maintained.
  2. Open a terminal and navigate to the directory containing the files.
  3. Run the command “npm install” to install all dependencies (requires npm)
  4. Run command “node server.js” to run the server (requires node.js)
  5. In Chrome, go to ‘localhost:3000’ to access the program.

### Using the program
Data source: When the program starts, it reads in movie data from a file called ‘moviedata.json’ file, which should be visible in the directory. This .json file can be replaced with an equivalent file, but the file must be renamed to ‘movie-data.json’. Three users accounts are hard-coded into the program. By default, you will be logged into the “Bennett” user account. If you wish to access these users at any time, their log-in info is as follows:
  - Username: Bennett   Password: 0 
  - Username: Jerry     Password: 123
  - Username: Taylor    Password: abc
Of course, you can log out at any time and make your own profile. These premade users will demonstrate some of the program’s functionality as though account changes and personalization had already been made.

#### Future plans
  - utilize mongoDB/mongoose to better handle db management.
  - implement a way for users to log in separately and simulataneously from different browsers using session data and cookies
