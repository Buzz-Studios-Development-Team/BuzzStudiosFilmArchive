// Firebase imports
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";

// React imports
import { useState, useEffect } from 'react';
import {React, useRef} from 'react';
import { useParams } from 'react-router-dom';

// Helper functions
import { retrieveFilmFiles } from './Helpers.js';

// Helper components
import BuzzHeader from "../homepage/BuzzHeader.js";
import { OtherFilms } from "./OtherFilms.js";
import { WatchWindow } from "./WatchWindow.js";
import { AssociatedFilms } from "./AssociatedFilms.js";

export default function WatchPage() {
    // URL parameters
    const { id } = useParams();

    // Booleans
    const [authenticated, setAuthenticated] = useState(false);
    const [urlLoaded, setLoaded] = useState(false);
    const [notFound, setNotFound] = useState(false);

    // Collections and URLs
    const [filmData, setFilmData] = useState({});
    const [allFilms, setAllFilms] = useState();
    const [otherFilms, setOtherFilms] = useState({});
    const [scriptURL, setScriptURL] = useState("");
    const [url, setURL] = useState(false);
    const [associated, setAssociated] = useState({});
    const [actors, setActors] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [captionTracks, setCaptionTracks] = useState([]);

    // Numeric values
    const [numDirectors, setNumDirectors] = useState(1);

    // Refs
    const videoRef = useRef();

    var sandbox = false;
  
    useEffect(() => {

      // Form config object using environment variables
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
      };

      var filmsColl = "";
      var actorsColl = "";
      var directorsColl = "";

      // Retrieve the active collection names (sandbox vs. production)
      if (process.env.REACT_APP_USE_SANDBOX === "true") {
        sandbox = true;

        // Set local variables
        filmsColl = process.env.REACT_APP_FILMS_SANDBOX;
        actorsColl = process.env.REACT_APP_ACTORS_SANDBOX;
        directorsColl = process.env.REACT_APP_DIRECTORS_SANDBOX;
      } else {
        sandbox = false;

        // Set local variables
        filmsColl = process.env.REACT_APP_FILMS_COLLECTION;
        actorsColl = process.env.REACT_APP_ACTORS_COLLECTION;
        directorsColl = process.env.REACT_APP_DIRECTORS_COLLECTION;
      }
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth();
      var db = getFirestore(app);
  
      const fetchFilms = async () => {
        resetState();

        // Retrieve all films from the database
        var filmsCollRef = collection(db, filmsColl);
        var filmsCollQuery = query(filmsCollRef, orderBy("order"));
        var filmDocs = await getDocs(filmsCollQuery);
        setAllFilms(filmDocs);

        // Initialize a variable to hold our film data object
        var currentFilmData = verifyExistenceOfFilm(filmDocs);
  
        // Initialize collection of films by the same director
        var filmsByDirector = [];

        // Initialize collection of associate bonus material
        var associatedBonusMaterial = [];
  
        // Determine the individual directors involved and set aside the number
        var directors = currentFilmData['director'];
        if (Array.isArray(directors)) 
        {
          setNumDirectors(directors.length);
    
          // Iterate through each film document to find other films by the same directors
          filmDocs.forEach((film) => {
            var filmDoc = film.data();
    
            for (var i = 0; i < directors.length; i++) {

              // If the film involved one of the directors, it's a different film, and it's not a bonus film, set it aside
              if (filmDoc.director.includes(directors[i]) 
                && filmDoc.title != currentFilmData.title 
                && !filmDoc.bonus) {

                  filmDoc['id'] = film.id;

                // Add the film
                filmsByDirector.push(filmDoc);
              }
            }
    
            // If the requested film contains an associated bonus material record and the current film matches
            if (currentFilmData.associated !== undefined && currentFilmData.associated.includes(film.id))
            {
              // Set aside associated bonus material
              filmDoc['id'] = film.id;
              associatedBonusMaterial.push(filmDoc);
            }
          });
        }
  
        // Save the film metadata
        setFilmData(currentFilmData);
        // Save the list of other films by the directors
        setOtherFilms(filmsByDirector);
        // Save the list of linked bonus material
        setAssociated(associatedBonusMaterial);

        // Create a collection for actors
        var actorList = [];
        var actorCollectionRef = collection(db, actorsColl);
        var actorCollectionDoc = await getDocs(actorCollectionRef);

        // Add every actor to the collection
        actorCollectionDoc.forEach((doc) => {
          var actor = doc.data();
          actor.id = doc.id;
          actorList.push(actor);
        });

        // Set the state to include all actor records
        setActors(actorList);

        // Create a collection for directors
        var directorList = [];
        var directorCollectionRef = collection(db, directorsColl);
        var directorCollectionDoc = await getDocs(directorCollectionRef);

        // Add every director to the collection
        directorCollectionDoc.forEach((doc) => {
          var director = doc.data();
          director.id = doc.id;
          directorList.push(director);
        });

        setDirectors(directorList);

        // If the film has already been released, attempt to request its URL
        if (currentFilmData.access === "released") {
          requestFiles(currentFilmData);
          setAuthenticated(true);
        }
      }

      // Call this inner function
      fetchFilms();
    }, [id]);

    const requestFiles = (currentFilmData, password) => {

      // Using the currently-selected film, retrieve signed links for all the files we need access to and include the currently-typed password
      retrieveFilmFiles(currentFilmData, password)
      .then((files) => {

        // If a rejection or error is returned, do not unlock the video player
        if (files["film_url"] == "403") {
          alert("Incorrect access code.");
          setAuthenticated(false);
          return;
        }
        else if (files["film_url"] == "500") {
          alert("Password could not be verified.");
          setAuthenticated(false);
          return;
        }
  
        // Set the signed video URL for the player to use
        setURL(files["film_url"]);

        // If a script exists, set the signed script URL for the button to link to
        if (files["script_url"] !== "none")
          setScriptURL(files["script_url"]);

        // Set the returned array of captioning links
        setCaptionTracks(files["captions"]);
  
        // Reset the video load state and trigger the video player's re-render
        setLoaded(false);
        setAuthenticated(true);
      });
    }
  
    // If the authentication state changes, attempt to reload the video file.
    useEffect(() => {
      if (authenticated && !urlLoaded && videoRef.current) {
          // Set the loaded flag to true and reload the state of the video player
          setLoaded(true);
          videoRef.current.load();
      }
    }, [authenticated, url]);

    // Given an actor record ID, return the actor's name
    const getActorName = (id) => {
      for (var actor in actors)
      {
        if (actors[actor].id == id) { return actors[actor].name; }
      }
    }

    function resetState() {
      setFilmData({});
      setAuthenticated(false);
      setURL(false);
      setLoaded(false);
      setOtherFilms({});
      setAssociated({});
      setNumDirectors(1);
      setScriptURL("");
      setActors([]);
    }

    function verifyExistenceOfFilm(filmDocs) {
      var returnedData = undefined;
      var notFoundData = undefined;

      // Iterate through each film in the collection
      filmDocs.forEach((film) => {

        // If the requested film matches, set the data
        if (film.id === id) {
          returnedData = film.data();
          returnedData.id = id;
        }

        // Set aside the not-found film
        if (film.id === "404") {
          notFoundData = film.data();
          notFoundData.id = "404";
        }
      });

      // If the film does not exist or it has been suppressed, enable the not-found state
      var notFound = returnedData === undefined || returnedData.semester === "Do Not Show";
      setNotFound(notFound);

      // Overwrite the film data if not found
      return notFound ? notFoundData : returnedData;
    }
  
    return (
      <>
        <BuzzHeader/>
        <br/><br/>
        
        <div className="watch-page">
          <WatchWindow 
            FilmData={filmData}
            Authenticated={authenticated}
            VideoRef={videoRef}
            VideoURL={url}
            CaptionTracks={captionTracks}  
            RequestFiles={requestFiles}
            NotFound={notFound}
            ScriptURL={scriptURL}
            GetActorName={getActorName}
            Directors={directors}
          />
        </div>

        <OtherFilms
          OtherFilms={otherFilms}
          FilmData={filmData}
          DirectorCount={numDirectors}
        />
    
        <AssociatedFilms
          FilmData={filmData}
          Associated={associated}
          OtherFilms={otherFilms}
        />
      </>
    );
  };