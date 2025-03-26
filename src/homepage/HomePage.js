import React, { useEffect, useState } from 'react';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import {useSearchParams } from 'react-router-dom';

// Helper components
import Film from '../tools/Film';
import BuzzHeader from './BuzzHeader';
import IntroStatement from './IntroStatement';
import FilterTools from './FilterTools';

const HomePage = () => {

    // Film metadata populated from Firestore
    const [FilmDBData, setFilmDBData] = useState();

    // List of semesters represented by films in the DB data
    const [Semesters, setSemesters] = useState();

    // Value of the search bar
    const [SearchBarValue, setSearchBarValue] = useState();

    // Whether to show sub-categories of all films
    const [ShowRestrictedFilms, setShowRestrictedFilms] = useState(false);
    const [ShowUnavailableFilms, setShowUnavailableFilms] = useState(false);

    // Which main categories to show
    const [ShowIndependent, setShowIndependentFilms] = useState(false);
    const [ShowBonusFilms, setShowBonusFilms] = useState(false);

    // Tag from the URL parameters
    const [tag, getTag] = useSearchParams();

    const [FilmCollection, SetFilmCollection] = useState(false);
  
    // Runs when the component starts up
    useEffect(() => {
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

      SetFilmCollection(process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION);
      var filmcoll = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION;
      
      // Initialize the Firebase app
      const app = initializeApp(firebaseConfig);
  
      // Async function to retrieve all film data
      const fetch = async () => {

        // Connect to the Firestore database and query the films category, ordering by the order field
        var db = getFirestore(app);
        var docRef = collection(db, filmcoll);
        var q = query(docRef, orderBy("order"));

        // Retrieve all documents from the query
        var docSnap = await getDocs(q);
  
        // For each film in the database, associate it with its ID and add to the temporary list
        var filmRecords = [];
        docSnap.forEach((doc) => {
          var data = doc.data();
          data['id'] = doc.id;
  
          // Can be used to add film records that do not appear on the website
          if (data['semester'] != "Do Not Show")
            filmRecords.push(data);
        });

        // Retrieve a list of all the semesters that appear in the film records
        const semesters = Array.from(new Set(filmRecords.map(film => film.semester)));
        
        // Set React states to the film records and a sorted list of semesters
        setFilmDBData(filmRecords);
        setSemesters(sortSemesters(semesters));

        // Clear the search bar value
        setSearchBarValue("");
      }

      // Call the async function to retrieve data
      fetch();
    }, []);
  


    // A function that sorts a list of semesters (e.g. Spring 2025, Fall 2022, Summer 2021)
    function sortSemesters(semesters) {
      const seasonOrder = {
        Spring: 0,
        Summer: 1,
        Fall: 2,
        'Date Unknown': 3
      };
    
      semesters.sort((a, b) => {
        const [seasonA, yearA] = a.split(' ');
        const [seasonB, yearB] = b.split(' ');
    
        // Check if either film has "Date Unknown"
        const hasDateUnknownA = seasonA === 'Date' && yearA === 'Unknown';
        const hasDateUnknownB = seasonB === 'Date' && yearB === 'Unknown';
    
        // Handle "Date Unknown" FilmDBData
        if (hasDateUnknownA && hasDateUnknownB) {
          return 0; // Keep the order as is
        } else if (hasDateUnknownA) {
          return 1; // Move "Date Unknown" film to the end
        } else if (hasDateUnknownB) {
          return -1; // Move "Date Unknown" film to the end
        }
    
        // Compare years first
        if (yearA !== yearB) {
          return parseInt(yearB) - parseInt(yearA);
        }
    
        // If years are the same, compare seasons
        return seasonOrder[seasonB] - seasonOrder[seasonA];
      });
    
      return semesters;
    }

    // This function removes films not matching the search parameters from the provided array.
    // It is also used to communicate information about hidden films.
    function filterBySearch(films, data) {
  
      // The newly constructed array of valid films
      var newFilmDBData = [];

      // The number of films hidden by the checkboxes for access restricted/unavailable films
      var hidden = 0;

      // The number of films that do not match the search terms
      var noSearch = 0;
  
      for (let e = 0; e < films.length; e++) {

        // If the films do not have a record for being independent (self-guided) or bonus, mark as false
        // They were grandfathered in
        if (films[e].independent === undefined) { films[e].independent = false; }
        if (films[e].bonus === undefined) { films[e].bonus = false; }
  
        // The independent category is active and the film is not independent
        var independentNotMatch = films[e].independent != ShowIndependent;

        // The bonus category is active and the film is not a bonus
        var bonusNotMatch = films[e].bonus != ShowBonusFilms;

        // Used to determine if the filter tag matches
        var tagNotMatch = false;
        
        // Check if the URL contains a tag or actor value
        var tagInUse = tag.get("tag");
        var actorInUse = tag.get("actor");
  
        if (tagInUse !== null)
        {
          // If there is a genre tag, check if the current film contains it
          if (films[e].tags == undefined || !(films[e].tags.includes(tagInUse)))
          {
            tagNotMatch = true;
          }
        }
  
        if (actorInUse !== null)
        {
          // If there is an actor tag, check if the current film features that actor
          var found = false;

          // Check if the film contains a record-based cast list
          if (films[e]["cast-new"] != undefined)
          {
            // Check each actor in the film's cast list
            for (var actor in films[e]["cast-new"])
            {
              // If the actor ID matches the tag in use, mark as true
              if (films[e]["cast-new"][actor].actor == actorInUse)
              {
                found = true;
                break;
              }
            }
          }
  
          // If the acctor is not found, indicate that there was a mismatch
          if (!found) { tagNotMatch = true; }
        }
  
        // If any of these disqualifying factors are present, consider this film a "no search"
        if (independentNotMatch || bonusNotMatch || tagNotMatch) {
          noSearch++;
          continue;
        }
  
        // If there is a search bar value typed in
        if (SearchBarValue !== "" && SearchBarValue !== undefined) {

          // Check to see if the title contains the search bar value
          var searchMatch = SearchBarValue.toLowerCase().trim();
          var titleMatch = films[e].title.toLowerCase().trim();
          var titleContains = titleMatch.includes(searchMatch);
  
          // If not, it's a no-search
          if (!titleContains)
          {
            noSearch++;
            continue;
          }
        }
  
        // If restricted films are hidden, increment the hide count
        if (!ShowRestrictedFilms && films[e].access === "restricted") {
          hidden++;
          continue;
        }

        // If unavailable films are hidden, increment the unavailable count
        if (!ShowUnavailableFilms && (films[e].access === "unavailable" || films[e].access === "preprod" || films[e].access === "postprod" || films[e].access === "prod")) {
          hidden++;
          continue;
        }

        // If the film qualifies, add it to the new list of films
        newFilmDBData.push(films[e]);
      }
    
      // data == 0: return the filtered list
      // data == 1: return the number of hidden films
      // data == 2: return whether or not the amount of no-searched films eliminates the list of films entirely

      if (data == 0) {
        return newFilmDBData;
      } else if (data == 1) {
        return hidden;
      } else if (data == 2) {
        return noSearch != films.length;
      }
    }
  
    return (
      <>
      <div className="homepage">
        <BuzzHeader/>
        <IntroStatement/>
        
        <main>
          <div className="content">
            <FilterTools 
              ShowRestrictedFilms={ShowRestrictedFilms}
              setShowRestrictedFilms={setShowRestrictedFilms}

              ShowUnavailableFilms={ShowUnavailableFilms}
              setShowUnavailableFilms={setShowUnavailableFilms}

              ShowIndependentFilms={ShowIndependent} 
              setShowIndependentFilms={setShowIndependentFilms}

              ShowBonusFilms = {ShowBonusFilms}
              setShowBonusFilms={setShowBonusFilms}

              setSearchBarValue={setSearchBarValue}

              tag={tag}
            />

            <br></br>

            {Semesters !== undefined && Semesters.map((semester, i) => {

              const semesterFilmDBData = FilmDBData.filter(film => film.semester === semester);

              const FilmDBDataInRow = filterBySearch(semesterFilmDBData, 0);
              const FilmDBDataNotShown = filterBySearch(semesterFilmDBData, 1);
              const showHeading = filterBySearch(semesterFilmDBData, 2);
  
              return (
                showHeading && <div id={semester} className="semester" key={semester}>
                  <h2>{semester}</h2>
                  {FilmDBDataNotShown == 1 && <h4 style={{marginTop: -20, color: "gray"}}><i>1 hidden film not displayed below.</i></h4>}
                  {FilmDBDataNotShown > 1 && <h4 style={{marginTop: -20, color: "gray"}}><i>{FilmDBDataNotShown + " hidden films not displayed below."}</i></h4>}

                  <div className="films">
                      {FilmDBDataInRow.map(film => (
                          <Film film={film}/>
                      ))}
                  </div>
                </div>
              );

            })}
          </div>
        </main>
      </div>
      </>
    );
  }

  export default HomePage;