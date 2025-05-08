import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { Button } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Film from '../tools/Film.js';
import { useState, useEffect } from 'react';
import {Link, useParams } from 'react-router-dom';
import {React, useRef} from 'react';
import BuzzHeader from "../homepage/BuzzHeader.js";
import { getStorage, ref, listAll } from "firebase/storage";
import imdbLogo from "../images/IMDb_Logo_Alt_Rectangle_White.png";

export default function WatchPage() {
    const { id } = useParams();
    const [filmData, setFilmData] = useState({});
    const [authenticated, setAuthenticated] = useState(false);
    const [url, setURL] = useState(false);
    const [urlLoaded, setLoaded] = useState(false);
    const [otherFilms, setOtherFilms] = useState({});
    const [numDirectors, setNumDirectors] = useState(1);
    const [scriptURL, setScriptURL] = useState("");
    const [captionsURL, setCaptionsURL] = useState("");
    const [cast, setCast] = useState();
    const [usedPassword, setUsedPassword] = useState();
    const [showCast, setShowCast] = useState();
    const [otherCast, setOtherCast] = useState({});
    const [bios, setBios] = useState([]);
    const [allFilms, setAllFilms] = useState();
    const [notFound, setNotFound] = useState(false);
    const [associated, setAssociated] = useState({});
    const [actors, setActors] = useState([]);
    const [captionTracks, setCaptionTracks] = useState([]);

    const [filmsCollection, setFilmsCollection] = useState();
    const [actorsCollection, setActorsCollection] = useState();
    var captions = [];

    var sandbox = false;
  
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

      var filmsColl = "";
      var actorsColl = "";

      if (process.env.REACT_APP_USE_SANDBOX === "true") {
        sandbox = true;

        setFilmsCollection(process.env.REACT_APP_FILMS_SANDBOX);
        filmsColl = process.env.REACT_APP_FILMS_SANDBOX;
        setActorsCollection(process.env.REACT_APP_ACTORS_SANDBOX);
        actorsColl =process.env.REACT_APP_ACTORS_SANDBOX;
      } else {
        setFilmsCollection(process.env.REACT_APP_FILMS_COLLECTION);
        filmsColl = process.env.REACT_APP_FILMS_COLLECTION;
        setActorsCollection(process.env.REACT_APP_ACTORS_COLLECTION);
        actorsColl = process.env.REACT_APP_ACTORS_COLLECTION;
      }
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth();
  
      const fetchFilms = async () => {
        setFilmData({});
        setAuthenticated(false);
        setURL(false);
        setLoaded(false);
        setOtherFilms({});
        setOtherCast({});
        setAssociated({});
        setNumDirectors(1);
        setScriptURL("");
        setCaptionsURL("");
        setCast();
        setUsedPassword("");
        setShowCast(false);
        setActors([]);
  
        var db = getFirestore(app);
        var docRef = doc(db, filmsColl, id);
        var docSnap = await getDoc(docRef);
        var data = docSnap.data();
        setNotFound(data === undefined || data.semester === "Do Not Show");
        if (data === undefined || data.semester === "Do Not Show") {
          docRef = doc(db, filmsCollection, "404");
          docSnap = await getDoc(docRef);
          data = docSnap.data();
        }
  
        data['id'] = doc.id;
  
        docRef = collection(db, filmsColl);
        var q = query(docRef, orderBy("order"));
        docSnap = await getDocs(q);
        setAllFilms(docSnap);
  
        var filmsByDirector = [];
        var assoc = [];
  
        var directors = data['director'];
        var names = splitNames(directors);
        setNumDirectors(names.length);
  
        var bios = [];
  
        docSnap.forEach((doc) => {
          var film = doc.data();
  
          for (var i = 0; i < names.length; i++) {
            if (film.director.includes(names[i]) && film.title != data.title && !film.bonus) {
              film['id'] = doc.id;
              filmsByDirector.push(film);
            }
          }
  
          if (data.associated !== undefined && data.associated.includes(doc.id))
          {
            film['id'] = doc.id;
            assoc.push(film);
          }
        }
      );
  
        setFilmData(data);
        setOtherFilms(filmsByDirector);
        setAssociated(assoc);
  
        // docRef = collection(db, "directors");
        // docSnap = await getDocs(docRef);
        // docSnap.forEach((doc) => {
        //   var director = doc.data();
  
        //   if (names.includes(director.name)) {
        //     bios.push(director);
        //   }
        // });
  
        var actorList = [];
        docRef = collection(db, actorsColl);
        docSnap = await getDocs(docRef);
        docSnap.forEach((doc) => {
          var actor = doc.data();
          actor.id = doc.id;
          actorList.push(actor);
        });
        setActors(actorList);
  
        setBios(bios);
  
        if (data.access === "released") {
          signInAnonymously(auth)
            .then(() => {
              fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "title": data.title,
                "film": (process.env.REACT_APP_USE_SANDBOX === "true" ? "sandbox/" : "") + data.filmfile,
                "uid": auth.currentUser.uid
              })
            })
            .then(response => response.json())
            .then(d => {
              setURL(d.url);
              setAuthenticated(true);
            })
          })
          .catch((error) => {
            alert("Could not authenticate.")
          });
        }
      }
      fetchFilms();
    }, [id]);
  
    var password = "";
  
    const authenticate = () => {
      const auth = getAuth();
  
      fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": (process.env.REACT_APP_USE_SANDBOX === "true" ? "sandbox/" : "") + filmData.filmfile,
          "code": password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.url != "403") {
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
  
    useEffect(() => {
      if (authenticated && !urlLoaded) {
          setLoaded(true);
          videoRef.current?.load();
          
          if (filmData.script !== undefined && filmData.script !== "") {
            requestScript();
          }
          if (filmData.captions !== undefined && filmData.captions !== "") {

            const storage = getStorage();
            const listRef = ref(storage, "translated-captions/");
            const fetchFiles = async () => {
                var languages = [];

                const res = await listAll(listRef)
                res.items.forEach((itemRef) => {
                    var path = itemRef._location.path_;
                    if (path.includes(filmData.captions.substring(0, filmData.captions.length - 11)))
                    {
                        var match = path.match(/-(\w+)\.vtt$/);
                        if (match) {
                          var iso = require('../tools/iso_language_codes.json');
                          for (var i = 0; i < iso.length; i++) {
                            if (iso[i].language === match[1]) {
                              languages.push(iso[i]);
                            }
                          }
                        }
                    }
                });

                languages.push({"language": "English", "code": "en"});

                const tracks = await Promise.all(
                  languages.map(async (lang) => {
                    return requestCaptions(lang.language, lang.code);
                  })
                );
                console.log(tracks);
                setCaptionTracks(tracks);

                if (videoRef.current) {
                  videoRef.current.load();
                }
            }
            fetchFiles();
          }
      }
    }, [authenticated]);
  
    // useEffect(() => {
    //   if (allFilms !== undefined && cast !== undefined)
    //   {
    //     var filmsWithCast = [];
  
    //     allFilms.forEach((doc) => {
    //       var film = doc.data();
  
    //       if (doc.id !== id) {
    //         for (var i = 0; i < cast.length; i++) {
    //           var name = cast[i][0];
              
    //           if (film.cast !== undefined) {
  
    //             for (var j = 0; j < film.cast.length; j++) {
    //               if (film.cast[j][0] == name) {
    //                 if (!(name in filmsWithCast)) {
    //                   filmsWithCast[name] = [];
    //                 }
    //                 var f = doc.data();
    //                 f.id = doc.id;
  
    //                 if (!(filmsWithCast[name].some(e => e.id === f.id))) {
    //                   filmsWithCast[name].push(f);
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     });
    //   }
          
    //   setOtherCast(filmsWithCast);
    // }, [cast]);
  
    const requestScript = () => {
      const auth = getAuth();
      fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": (sandbox ? "sandbox/" : "") + filmData.script,
          "uid": auth.currentUser.uid,
          "code": usedPassword
        })
      })
      .then(response => response.json())
      .then(d => {
        setScriptURL(d.url);
      });
    }
  
    const requestCaptions = (language="English", code="en") => {
      const auth = getAuth();
      var prefix = (language === "English" ? "" : "translated-captions/");
      var url = language === "English" ? filmData.captions : prefix + filmData.captions.substring(0, filmData.captions.length - 11) + language + ".vtt";
      
      return fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/request-film', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "title": filmData.title,
          "film": (sandbox ? "sandbox/" : "") + url,
          "uid": auth.currentUser.uid,
          "code": usedPassword
        })
      })
      .then(response => response.json())
      .then(d => {
        return {"url": d.url, "language": language, "code": code};
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
    }
  
    const getActorName = (id) => {
      for (var actor in actors)
      {
        if (actors[actor].id == id) { return actors[actor].name; }
      }
    }
  
  
    const styles = {
      tableContainer: {
        maxWidth: '600px',
        margin: '20px auto',
        borderCollapse: 'collapse',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      table: {
        width: '100%',
        border: '1px solid #ddd',
      },
      th: {
        backgroundColor: '#f4f4f4',
        padding: '12px',
        textAlign: 'left',
        fontWeight: 'bold',
        borderBottom: '2px solid #ddd',
      },
      td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
      },
      trHover: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      },
      trHoverActive: {
        backgroundColor: '#f9f9f9',
      },
      header: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '24px',
      },
    };
  
    const darkTheme = createTheme({
      palette: {
        mode: "dark", // Enables dark mode
        background: {
          default: "#000", // Black background
          paper: "#111", // Slightly lighter for table rows/paper
        },
        text: {
          primary: "#fff", // White text
          secondary: "#ccc", // Light gray text for secondary
        },
      },
    });
  
    return (
      <div>
        <BuzzHeader/>
        <br></br><br></br>
        <div className="watch-page">
          <div className={filmData.access == "released" || authenticated ? ("video-container") : ("msg-container")}>
            {filmData.access == "released" || authenticated? (
              <video ref={videoRef} crossOrigin='anonymous' playsInline controls controlsList="nodownload" class="player">
                <source src={url}/>
                {captionTracks !== undefined && captionTracks.map((track) => {
                  return (
                    <track
                      label={track.language}
                      kind="subtitles"
                      srcLang={track.code}
                      src={track.url}
                    />
                  )
                })}
              </video>
            ) : filmData.access == "unavailable" || filmData.access == "preprod" || filmData.access == "prod" || filmData.access == "postprod" ? (
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
              {/* <p class="cs"><b>"For the 404, for the A!"</b></p>
              <p class="css">This film could not be found.</p> */}
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
                  <a style={{color: "white", textDecoration: "none"}} ><p class="tag-body">{tag}</p></a> //href={"/?tag=" + tag}
              )
            })}
            </div>}
              
            {scriptURL !== "" && <Link style={{textDecoration: 'none'}} id="scriptLink" target="_blank" download to={scriptURL}><Button style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: "25px"}} variant="contained" id="scriptDownload">Download Script</Button></Link>}
            </>}
  
            {showCast && <><ThemeProvider theme={darkTheme}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table" mode="dark">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell align="right"><strong>See More</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filmData["cast-new"].map((row) => (
                  <TableRow
                    key={row.actor}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell size="small" component="th" scope="row">
                      {getActorName(row.actor)}
                    </TableCell>
                    <TableCell size="small" >{row.role}</TableCell>
                    <TableCell size="small" variant="contained" align="right"><Button onClick={() => {window.location.href = "/?actor=" + row.actor + "&name=" + getActorName(row.actor)}}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </ThemeProvider></>}
  
          {filmData["cast-new"] !== undefined && <Button onClick={() => {setShowCast(!showCast)}} style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: scriptURL !== "" ? "10px" : "25px"}} variant="contained" id="scriptDownload">{showCast ? "Hide Cast" : "Show Cast"}</Button>}

          {filmData.imdb && filmData.imdb !== "" && <a href={filmData.imdb} style={{textDecoration: 'none'}} id="imdbLink" target="_blank"><Button style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: "25px", lineHeight: "0"}} variant="contained" id="imdbButton"><img src={imdbLogo} height="25px" margin="0" align="middle"></img></Button></a>}

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
          
         {/* {(showCast && otherCast != {}) && <div style={{marginTop: "0px"}} className="watch-page">
          <main>
          {Object.keys(otherCast).map((actor, i) => {
            return (
              <>
              <div className="semester"  key={i}>
                <h2>Other Films Featuring {actor}</h2>
                
                <div className="films" >
                  <div className="film-row" style={{display: "flex", alignItems: "center", flexDirection: "column", flexFlow: "wrap", justifyContent: "center"}} key={0}>
                    {otherCast[actor].map(film => (
                      <Film film={film}/>
                    ))}
                  </div>
                </div>
              </div>
              </>
            )
          })}
          </main>
        </div>} */}
      </div>
    );
  };