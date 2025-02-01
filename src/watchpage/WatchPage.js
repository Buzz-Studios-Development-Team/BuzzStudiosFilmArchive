// React imports
import { useState, useEffect } from 'react';
import {Link, useParams } from 'react-router-dom';
import {React, useRef} from 'react';

// Firebase imports
import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";

// MUI imports
import { Button } from "@mui/material";
import { createTheme } from "@mui/material/styles";

// Other tools
import Film from '../tools/Film.js';
import BuzzHeader from "../homepage/BuzzHeader.js";
import VideoPlayer from './VideoPlayer.js';
import CastTable from './CastTable.js';

export default function WatchPage() {
    // The film ID as pulled from the URL
    const { id } = useParams();
    // Metadata for the viewed film
    const [filmData, setFilmData] = useState({});
    // Authentication status, if necessary
    const [authenticated, setAuthenticated] = useState(false);
    // The video URL for the film
    const [url, setURL] = useState(false);
    // Indicates whether the URL has been retrieved yet
    const [urlLoaded, setLoaded] = useState(false);

    // Contains other films made by the same director(s)
    const [otherFilms, setOtherFilms] = useState({});
    // The number of directors for the active film
    const [numDirectors, setNumDirectors] = useState(1);

    // The download link to the script, if provided
    const [scriptURL, setScriptURL] = useState("");
    // The link to the vtt file, if provided
    const [captionsURL, setCaptionsURL] = useState("");

    // The access code as provided by the user
    const [usedPassword, setUsedPassword] = useState();

    // Whether to show the cast table
    const [showCast, setShowCast] = useState();
    // Whether to show director bios
    const [bios, setBios] = useState([]);
    // Whether the film has not been found
    const [notFound, setNotFound] = useState(false);

    // Keeps track of associated bonus material
    const [associated, setAssociated] = useState({});

    // The cast record for the film, if provided
    const [actors, setActors] = useState([]);
  
    const videoRef = useRef();
  
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
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth();
  
      const fetchFilms = async () => {

          setFilmData({});
          setAuthenticated(false);
          setURL(false);
          setLoaded(false);
          setOtherFilms({});
          setAssociated({});
          setNumDirectors(1);
          setScriptURL("");
          setCaptionsURL("");
          setUsedPassword("");
          setShowCast(false);
          setActors([]);
    
          // Search for the film by the provided ID
          var db = getFirestore(app);
          var docRef = doc(db, "films", id);
          var docSnap = await getDoc(docRef);
          var data = docSnap.data();

          // If not found, load the 404 film
          setNotFound(data === undefined);
          if (data === undefined) {
            docRef = doc(db, "films", "404");
            docSnap = await getDoc(docRef);
            data = docSnap.data();
          }
    
          // Add the ID to the data structure
          data['id'] = doc.id;
    
          // Request all films and order by intra-semester order
          docRef = collection(db, "films");
          var q = query(docRef, orderBy("order"));
          docSnap = await getDocs(q);
    
          var filmsByDirector = [];
          var assoc = [];
    
          // Split the director field into individual names and set the number of directors
          var directors = data['director'];
          var names = splitNames(directors);
          setNumDirectors(names.length);
    
          var bios = [];
    
          // For each film, check if any of the directors were involved
          docSnap.forEach((doc) => {
            var film = doc.data();
    
            for (var i = 0; i < names.length; i++) {

              // Do not include bonus material in the other films section
              if (film.director.includes(names[i]) && film.title != data.title && !film.bonus) {
                film['id'] = doc.id;
                filmsByDirector.push(film);
              }
            }
    
            // If the film has associated bonus material matching the current record, add it
            if (data.associated !== undefined && data.associated.includes(doc.id))
            {
              film['id'] = doc.id;
              assoc.push(film);
            }
          }
        );
  
        // Set all the necessary film record states
        setFilmData(data);
        setOtherFilms(filmsByDirector);
        setAssociated(assoc);
  
        // Retrieve the director records
        docRef = collection(db, "directors");
        docSnap = await getDocs(docRef);
        docSnap.forEach((doc) => {

          // If the given director has a bio, add to the list
          var director = doc.data();
          if (names.includes(director.name)) {
            bios.push(director);
          }
        });
  
        // Retrieve the actor collection
        var actorList = [];
        docRef = collection(db, "actors");
        docSnap = await getDocs(docRef);

        // For each actor, add its ID as a field and add to the list
        docSnap.forEach((doc) => {
          var actor = doc.data();
          actor.id = doc.id;
          actorList.push(actor);
        });

        // Set actor and bio states
        setActors(actorList);
        setBios(bios);
  
        // If the film is released, we can authenticate
        if (data.access === "released") {

          signInAnonymously(auth)
            .then(() => {
              
              // Once this is done, send a POST request to the Cloud Run function that returns a signed film URL
              fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "title": data.title,
                "film": data.filmfile,
                "uid": auth.currentUser.uid
              })
              // Need to include the title, auth UID, and film filename
            })
            .then(response => response.json())
            .then(d => {
              // Approve the authentication and set the video URL state
              setURL(d.url);
              setAuthenticated(true);
            })
          })
          .catch((error) => {
            alert("Could not authenticate.")
          });
        }
      }

      // Call the async fetch films function
      fetchFilms();
    }, [id]);
  
    var password = "";
  
    const authenticate = () => {
      const auth = getAuth();
  
      // If we need to authenticate using an access code, send a request to the request-film endpoint
      fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": filmData.filmfile,
          "code": password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.url != "403") {
          // If the request was valid, retrieve the provided URL and authenticate
          signInAnonymously(auth)
          .then(() => {
              setURL(data.url);
              setAuthenticated(true);
              setUsedPassword(password);
          })
          .catch((error) => {
            alert("Could not authenticate.");
          });
        } else {
          alert("Incorrect access code.");
        }
      })
    }

    // Splits names joined by commas and conjunctions
    function splitNames(nameList) {
        let names = nameList.split(',');
      
        let finalNames = [];
      
        names.forEach(name => {
            if (name.includes(' and ')) {
                finalNames.push(...name.split(' and ').map(n => n.trim()));
            } else {
                finalNames.push(name.trim());
            }
        });
      
        return finalNames;
      }
  
    // When authentication changes, attempt to load the current video URL
    useEffect(() => {
      if (authenticated && !urlLoaded) {
          setLoaded(true);
          videoRef.current?.load();
          
          // If the script is provided, request it
          if (filmData.script !== undefined && filmData.script !== "") {
            requestScript();
          }

          // If captions are provided, request them
          if (filmData.captions !== undefined && filmData.captions !== "") {
            requestCaptions();
          }
      }
    }, [authenticated]);
  
    const requestScript = () => {
      const auth = getAuth();
      fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": filmData.script,
          "uid": auth.currentUser.uid,
          "code": usedPassword
        })
      })
      .then(response => response.json())
      .then(d => {
        setScriptURL(d.url);
      });
    }
  
    const requestCaptions = () => {
      const auth = getAuth();
      fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": filmData.captions,
          "uid": auth.currentUser.uid,
          "code": usedPassword
        })
      })
      .then(response => response.json())
      .then(d => {
        setCaptionsURL(d.url);
      });
    }
  
    const getActorName = (id) => {
      for (var actor in actors)
      {
        if (actors[actor].id == id) { return actors[actor].name; }
      }
    }
  
    const darkTheme = createTheme({
      palette: {
        mode: "dark", 
        background: {
          default: "#000",
          paper: "#111", 
        },
        text: {
          primary: "#fff", 
          secondary: "#ccc", 
        },
      },
    });
  
    return (
      <div>

        <BuzzHeader/>
        <br/><br/>

        <div className="watch-page">
          <div className={filmData.access == "released" || authenticated ? ("video-container") : ("msg-container")}>
            {
              filmData.access == "released" || authenticated? (
              <VideoPlayer videoRef={videoRef} url={url} captionsURL={captionsURL} />
            ) : filmData.access == "unavailable" || 
                filmData.access == "preprod" || 
                filmData.access == "prod" || 
                filmData.access == "postprod" ? (
                <div className="coming-soon">
                    <p class="cs"><b>Coming Soon</b></p>
                    <p class="css">Please check back later.</p>
                </div>
            ) : filmData.access == "restricted" ? (
              <div className="coming-soon">
                  <p class="cs"><b>Restricted</b></p>
                  <p class="css">This film has not yet been made available to the general public. Please enter the access code.</p>
                  <br></br><input type="password" class="accesscode" onChange={(event) => password = event.target.value}></input>
                  <button onClick={authenticate} class="submitaccesscode">Submit</button>
              </div>
            ) : !notFound ? <div className="coming-soon">
                <p class="cs"><b>Loading...</b></p>
              </div>
              : <div className="coming-soon">
              <p class="cs"><b>Loading...</b></p>
            </div>}
          </div>
          
          {filmData.access !== undefined && <div className={filmData.independent ? "info-box-indep" : filmData.bonus ? "info-box-bonus" : "info-box"}>
            
            {!showCast && <><strong><p class="title">{filmData.title}</p></strong>
            <p class="subheading">Directed by {filmData.director}</p>
            <p class="subheading">Starring {filmData.stars}</p><br></br>
            <p class="synopsis">{filmData.synopsis}</p>
  
            {filmData.tags !== undefined &&
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "15px"}}>
            {filmData.tags.map((tag, i) => {
              return (
                  <a style={{color: "white", textDecoration: "none"}} ><p class="tag-body">{tag}</p></a>
              )
            })}
            </div>}
  
            {scriptURL !== "" && <Link style={{textDecoration: 'none'}} id="scriptLink" target="_blank" download to={scriptURL}><Button style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: "25px"}} variant="contained" id="scriptDownload">Download Script</Button></Link>}
            </>}
  
            {showCast && 
            <CastTable
              theme={darkTheme}
              filmData={filmData}
              getActorName={getActorName}
            />}
  
          {filmData["cast-new"] !== undefined && <Button onClick={() => {setShowCast(!showCast)}} style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: scriptURL !== "" ? "10px" : "25px"}} variant="contained" id="scriptDownload">{showCast ? "Hide Cast" : "Show Cast"}</Button>}
          </div>}
        </div>
        <br></br>
  
        {(bios.length > 0) && <div style={{marginTop: "0px"}} className="watch-page">
            <main>
              {bios.map((bio => {
                return (
                  <>
                  <h2 style={{marginBottom: -10}}>About {bio.name}</h2>
                  <div className="bio" >
                    <img src={"https://firebasestorage.googleapis.com/v0/b/buzz-studios-7f814.appspot.com/o/" + bio.headshot + "?alt=media"}></img>
                    <p>{bio.bio}{bio.bio}{bio.bio}</p>
                  </div>
                  </>
                )
              }))}
            </main>
          </div>}
  
        {(otherFilms.length > 0 && filmData.director != "N/A" && !filmData.bonus) && <div style={{marginTop: "0px"}} className="watch-page">
            <main>
            <div className="semester"  key={-1}>
              <h2>{numDirectors == 1 ? "Other Films By This Director" : "Other Films By These Directors"}</h2>
              <div className="films" >
                <div className="film-row" style={{display: "flex", alignItems: "center", flexDirection: "column", flexFlow: "wrap", justifyContent: "center"}} key={0}>
                  {otherFilms.map(film => (
                    <Film film={film}/>
                  ))}
                </div>
              </div>
            </div>
            </main>
          </div>}
  
        {(filmData.associated !== undefined && filmData.associated.length > 0) && <div style={{marginTop: (otherFilms.length > 0 && filmData.director != "N/A" && !filmData.bonus) ? "-40px" : "0px"}} className="watch-page">
          <main>
          <div className="semester"  key={-1}>
            <h2>Bonus Material</h2>
            <div className="films" >
              <div className="film-row" style={{display: "flex", alignItems: "center", flexDirection: "column", flexFlow: "wrap", justifyContent: "center"}} key={0}>
                {associated.map(film => (
                  <Film film={film}/>
                ))}
              </div>
            </div>
          </div>
          </main>
        </div>}
      </div>
    );
  };