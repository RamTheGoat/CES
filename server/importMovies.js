import mongoose from "mongoose";
import dotenv from "dotenv";
import csv from "csvtojson";
import Movie from "./models/Movie.js";

dotenv.config();

async function importMovies() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const movies = await csv().fromFile("movies.csv"); // your spreadsheet export

  const formatted = movies.map(m => ({
    title: m["Movie Title"],
    genre: m["Category"],
    duration: Number(m["Duration"]) || 0,
    rating: m["MPAA Rating"],
    posterUrl: m["Movie Poster Link"],
    description: m["Synopsis"],
    showtimes: m["Show Dates and Times"] && m["Show Dates and Times"] !== "TBD"
      ? m["Show Dates and Times"].split("|")
      : [],
    releaseYear: m["Release Year"] || null,
    cast: m["Cast"] ? m["Cast"].split("|") : [],
    director: m["Director"] || "",
    producer: m["Producer"] || "",
    criticScore: m["Critic Review Score"] 
      ? Number(m["Critic Review Score"].replace("%","")) 
      : null,
    audienceScore: m["Audience Review Score"] 
      ? Number(m["Audience Review Score"].replace("%","")) 
      : null,
    trailerUrl: m["Trailer Video Link"] || ""
  }));

  await Movie.insertMany(formatted);
  console.log("Movies imported successfully!");
  mongoose.connection.close();
}

importMovies();
