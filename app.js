const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertMovieNametoPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMovieQuery = `SELECT movie_name from movie`;
  const moviesArray = await db.all(getAllMovieQuery);
  response.send(
    moviesArray.map((movieName) => convertMovieNametoPascalCase(movieName))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}')`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const movie = await db.get(getMovieQuery);
  console.log(movieId);
  response.send(convertDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET 
    director_id=${directorId},movie_name='${movieName}',lead_actor = '${leadActor}' WHERE movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectordetailsPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (req, res) => {
  const getAllDirectorQuery = `SELECT * FROM director`;
  const moviesArray = await db.all(getAllDirectorQuery);
  res.send(
    moviesArray.map((director) => convertDirectordetailsPascalCase(director))
  );
});

const convertMovieNamePascalcase = (dbObject) => {
  return {
    movieName: dbobject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const movies = await db.all(getDirectorMoviesQuery);

  res.send(movies.map((eachMovie) => ({ movieName: eachMovie.movie_name })));
});
module.exports = app;
