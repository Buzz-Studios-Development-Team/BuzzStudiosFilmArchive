import React, {useEffect} from "react";

// Firebase imports
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

// MUI imports
import { Card, CardContent, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogContentText, LinearProgress } from "@mui/material";

// Tool imports
import ManageActors from '../tools/ManageActors';
import UserManager from "../tools/UserManager";

// Film tabs
import InitDetailsTab from "./AdminTabs/InitDetailsTab";
import VideoUploadTab from "./AdminTabs/VideoUploadTab";
import ThumbnailUploadTab from "./AdminTabs/ThumbnailUploadTab";
import ScriptUploadTab from "./AdminTabs/ScriptUploadTab";
import CaptionsUploadTab from "./AdminTabs/CaptionsUploadTab";
import CastUploadTab from "./AdminTabs/CastUploadTab";

import Film from "./FilmDetails";
import FilmOrderTool from "../tools/FilmOrderTool";

export default function AdminControls(props) {

    // Selected film state
    const [selectedFilm, setSelectedFilm] = React.useState(undefined);

    // Stage of film addition state
    const [stage, setStage] = React.useState(0);

    // Boolean state of new film and the ID in use
    const [newFilm, setNew] = React.useState(false);
    const [newFilmID, setNewFilmID] = React.useState();
    const [newFilmIDError, setNewFilmIDError] = React.useState(false);

    const [originalDetails, setOriginalDetails] = React.useState(new Film());
    const [filmDetails, setFilmDetails] = React.useState(new Film());
        
    // Upload progress bar state
    const [showProgressBar, setShowProgressBar] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const [order, setOrder] = React.useState(0);

    useEffect(() => {
        // If progress reaches 100, advance the stage and hide the progress bar
        if (progress == 100) {
            setStage(stage + 1);
            setShowProgressBar(false);
            setProgress(0);
        }
    }, [progress]);

    const getFilm = (id) => {
        if (props.Films !== undefined) {
            var film = null;
            for (var i = 0; i < props.Films.length; i++) {
                if (props.Films[i].id === id) {
                    film = props.Films[i];
                    return film;
                }
            }
            if (film == null) {
                return;
            }
        }
    }

    const handleChange = (event) => {
        setSelectedFilm(event.target.value);
        var film = getFilm(event.target.value);
        set(film);
    };

    const set = (film) => {
        var details = filmDetails;

        details.setTitle(film.title);
        details.setSemester(film.semester);
        details.setDirector(film.director);
        details.setStars(film.stars);
        details.setSynopsis(film.synopsis);
        details.setAccess(film.access);
        setOrder(film.order);
        details.filmfile = film.filmfile !== undefined ? film.filmfile : "";
        details.thumbnail = film.thumbnail !== undefined ? film.thumbnail : "";
        details.scriptfile = film.script !== undefined ? film.script : "";
        details.captionsfile = film.captions !== undefined ? film.captions : "";
        details.cast = film['cast-new'];
        details.languages = film.languages;
        
        if (film.independent !== undefined && film.independent)
            details.setCategory(1);
        else if (film.bonus !== undefined && film.bonus)
            details.setCategory(2);
        else
            details.setCategory(0);

        setFilmDetails(details);
        setOriginalDetails(details);
    };

    const Stage = {
        INIT_MENU: 0,
        INIT_DETAILS: 1,
        FILM_FILE: 2,
        THUMBNAIL: 3,
        SCRIPT: 4,
        CAPTIONS: 5,
        CAST: 6,
        REVIEW: 7,
        FINISHED: 8
    };

    const sendRequest = () => {
        if (props.User === undefined) {
            alert("Please re-authenticate.");
        } else {
            const send = async () => {
                var db = getFirestore();

                const t = require("bcryptjs");
                var salt = t.genSaltSync(10);
                if (filmDetails.getAccessCode() !== undefined) {
                    var hash = t.hashSync(filmDetails.getAccessCode(), salt);
                } else {
                    var hash = t.hashSync("", salt);
                }

                await setDoc(doc(db, props.FilmsCollection, selectedFilm), {
                    title: filmDetails.getTitle(),
                    semester: filmDetails.getSemester(),
                    director: filmDetails.getDirector(),
                    stars: filmDetails.getStars(),
                    synopsis: filmDetails.getSynopsis(),
                    order: order,
                    access: filmDetails.getAccess(),
                    accesscode: hash,
                    filmfile: filmDetails.filmfile,
                    thumbnail: filmDetails.thumbnail,
                    script: filmDetails.scriptfile,
                    captions: filmDetails.captionsfile,
                    independent: filmDetails.getCategory() == 1,
                    bonus: filmDetails.getCategory() == 2,
                    "cast-new": filmDetails.cast
                });
                
                setStage(Stage.FINISHED);
            }
            send();
        }
    };

    const handleNewFilmID = (value) => {
        setNewFilmID(value);
        if (value.trim() !== "" && value.length < 50) {
            setNew(true);
            setNewFilmIDError(false);
        } else {
            setNewFilmIDError(true);
        }
    };

    const deleteFilm = () => {
        filmDetails.setSemester("Do Not Show");
        sendRequest();
    }

    const ImportFile = (type) => {
    
        let input = document.createElement('input');
        
        if (type == "video") {
            input.accept = ".mp4";
        } else if (type == "image") {
            input.accept = ".png";
        } else if (type == "document") {
            input.accept = ".pdf";
        } else if (type == "captions") {
            input.accept = ".vtt";
        } else if (type == "cast") {
            input.accept = ".json";
        }
    
        var file = null;
        input.type = 'file';
        input.onchange = _ => {
            let files =   Array.from(input.files);
            file = files[0];
            console.log(files);
            setShowProgressBar(true);
    
            const storage = getStorage();
            if (type === "video") {
                const metadata = {
                    contentType: 'video/mp4'
                };
    
                var today = new Date();
                var fileName = selectedFilm + "-" + String(today.getTime()) + ".mp4";
                filmDetails.filmfile = fileName;
                const storageRef = ref(storage, (props.Sandbox ? process.env.REACT_APP_SANDBOX_BUCKET : process.env.REACT_APP_PROD_BUCKET) + fileName);
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
                uploadTask.on('state_changed',
                    (snapshot) => {
                        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    }, 
                    (error) => {
                        alert("An error has occurred. Please try again.");
                    }, 
                    () => {
                        console.log("Upload complete");
                    }
                );
            } else if (type === "image") {
                const metadata = {
                    contentType: 'image/png'
                };
    
                var today = new Date();
                var fileName = selectedFilm + "-thumbnail-" + String(today.getTime()) + ".png";
                const storageRef = ref(storage, (props.Sandbox ? process.env.REACT_APP_SANDBOX_BUCKET : process.env.REACT_APP_PROD_BUCKET) + fileName);
                filmDetails.thumbnail = fileName;
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
                uploadTask.on('state_changed',
                    (snapshot) => {
                        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    }, 
                    (error) => {
                        alert("Upload failed. Please try again later.");
                    }, 
                    () => {
                        console.log("Upload complete");
                    }
                );
            } else if (type === "document") {
                const metadata = {
                    contentType: 'application/pdf'
                };
    
                var today = new Date();
                var fileName = selectedFilm + "-script-" + String(today.getTime()) + ".pdf";
                const storageRef = ref(storage, (props.Sandbox ? process.env.REACT_APP_SANDBOX_BUCKET : process.env.REACT_APP_PROD_BUCKET) + fileName);
                filmDetails.scriptfile = fileName;
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
                uploadTask.on('state_changed',
                    (snapshot) => {
                        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    },
                    (error) => {
                        alert("Upload failed. Please try again later.");
                    },
                    () => {
                        console.log("Upload complete");
                    }
                );
            } else if (type == "captions") {
                const metadata = {
                    contentType: 'text/vtt'
                };
    
                var today = new Date();
                var fileName = selectedFilm + "-captions-" + String(today.getTime()) + "-English.vtt";
                const storageRef = ref(storage, (props.Sandbox ? process.env.REACT_APP_SANDBOX_BUCKET : process.env.REACT_APP_PROD_BUCKET) + fileName);
                filmDetails.captionsfile = fileName;
                const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
                uploadTask.on('state_changed',
                    (snapshot) => {
                        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    },
                    (error) => {
                        console.log(error);
                        alert("Upload failed. Please try again later.");
                    },
                    () => {
                        console.log("Upload complete");
                    }
                );
            }
        };
        input.click();
    }

    const clear = () => {
        setFilmDetails(new Film());
    }

    return (
        <>
        <style>
            {`
                h2 {
                    grid-column: 1 / -1;
                    margin-top: 40px;
                    font-size: 30px;
                    text-align: center;
                    color: white;
                }

                Button {
                    font-family: 'Calibri', 'Arial';
                }
            `}
        </style>

        <br/>
        {props.Exec && <p style={{color: "white", fontSize: 18, margin: 10, fontFamily: "Lucida Sans", textAlign: "center"}}>
            <strong>Welcome, {props.Name}</strong>
        </p>}

        <h2>Submit Film Details</h2>
        
        <div>
            {
                stage === Stage.INIT_MENU && 
                <>
                <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>

                    <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                        {(props.Exec) && 
                        <>

                        {/* Add new film header */}
                        <p style={{color: "black", fontSize: 18, margin: 10, fontFamily: "Lucida Sans"}}>
                            Add New Film
                        </p>

                        {/* Text field for the new ID for the film */}
                        <TextField 
                            value={newFilmID} 
                            onChange={(event) => {handleNewFilmID(event.target.value)}} 
                            id="outlined-basic" 
                            label="Film ID" 
                            variant="outlined" 
                            error={newFilmIDError}
                            sx={{margin: 1}} 
                        /> 

                        {/* Confirmation button for adding details for the film */}
                        <Button onClick={() => {
                            if (newFilmID !== undefined && !newFilmIDError) {
                                setSelectedFilm(newFilmID); 
                                clear(); 
                                setStage(Stage.INIT_DETAILS);
                            }}} 
                            variant="contained" 
                            color="warning" 
                            style={{fontSize: 15, marginTop: 10}}>
                            
                            Add Details
                        </Button>

                        <br></br>
                        </>}
                        

                        {/* Header for the existing films selector */}
                        <p style={{color: "black", fontSize: 18, margin: 10, fontFamily: "Lucida Sans"}}>{props.Exec ? "Existing Films" : "Not Authorized"}</p>

                        {(props.Exec) && 
                        <FormControl style={{margin: "0 auto"}}>
                            <InputLabel id="demo-simple-select-label">{props.Exec ? "Existing Films" : "Not Authorized"}</InputLabel>
                            <Select
                                labelId="select-existing-film"
                                id="select-film-id"
                                value={selectedFilm}
                                label={props.Exec ? "Existing Films" : "Loading..."}
                                onChange={handleChange}>
                                {
                                    props.Films !== undefined && props.Films.map(film => (
                                        <MenuItem value={film.id}>{film.id}</MenuItem>
                                    ))
                                }
                            </Select>

                            <div style={{display: "flex", flexDirection: "row", justifyContent: "center", marginTop: 10}}>

                                {/* Edit details of an existing film */}
                                {(props.Exec) && 
                                <Button onClick={() => {
                                    if (true || (selectedFilm !== undefined)) {
                                        setStage(Stage.INIT_DETAILS)}
                                    }} 
                                    variant="contained" 
                                    color="warning" 
                                    style={{fontSize: 15, margin: 3}}>
                                        
                                    Edit Details
                                </Button>}
                                
                                {/* Delete an existing film */}
                                {(props.Exec) && 
                                <Button onClick={() => {
                                    if (selectedFilm !== undefined) {
                                        deleteFilm(); 
                                        setStage(Stage.FINISHED);
                                    }}} 
                                    variant="contained" 
                                    color="warning" 
                                    style={{fontSize: 15, margin: 3, backgroundColor: "maroon"}}>
                                    
                                    Delete Film
                                </Button>}

                            </div>
                        </FormControl>}

                    </CardContent>
                </Card>
                <br></br>

                {/* Show the actor management component */}
                {(props.Exec) && 
                <><h2>Manage Actors</h2>
                <ManageActors/><br/></>}

                {/* Show the actor management component */}
                {(props.Exec) && 
                <><h2>Manage Film Order</h2>
                <FilmOrderTool/><br/></>}

                {/* Show the actor management component */}
                {(props.Exec === "admin" || props.Exec === "exec") && 
                <><h2>Manage Users</h2>
                <UserManager Exec={props.Exec} Name={props.Name}/></>}
                </>
            }
            
            {stage === Stage.INIT_DETAILS && 
            <InitDetailsTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
            />}
            
            {stage === Stage.FILM_FILE && 
            <VideoUploadTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
                ImportFile={ImportFile}
                newFilm={newFilm}
            />}

            {stage === Stage.THUMBNAIL && 
            <ThumbnailUploadTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
                ImportFile={ImportFile}
                newFilm={newFilm}
            />}

            {stage === Stage.SCRIPT && 
            <ScriptUploadTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
                ImportFile={ImportFile}
                newFilm={newFilm}
            />}

            {stage === Stage.CAPTIONS && 
            <CaptionsUploadTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
                ImportFile={ImportFile}
                newFilm={newFilm}
            />}

            {stage === Stage.CAST && 
            <CastUploadTab
                selectedFilm={selectedFilm}
                filmDetails={filmDetails}
                setFilmDetails={setFilmDetails}
                Stage={Stage}
                setStage={setStage}
                newFilm={newFilm}
            />}

            {stage === Stage.REVIEW && 
                <Card variant="outlined" sx={{width: 700, margin: "0 auto"}}>
                    <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                        <p style={{fontSize: 18, marginTop: 0}}>Film ID: <strong>{selectedFilm}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0}}>Title: <strong>{filmDetails.getTitle()}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0}}>Semester Produced: <strong>{filmDetails.getSemester()}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0}}>Director Name: <strong>{filmDetails.getDirector()}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0}}>Stars: <strong>{filmDetails.getStars()}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0, textAlign: "center"}}>Synopsis: <strong>{filmDetails.getSynopsis()}</strong></p>
                        <p style={{fontSize: 18, marginTop: 0}}>Category: <strong>{filmDetails.getCategory() == 0 ? "Regular" : filmDetails.getCategory() == 1 ? "Self-Guided" : "Bonus"}</strong></p>
                        
                        <p style={{fontSize: 18, marginTop: 0}}>Access: 
                            <strong>{
                                (filmDetails.getAccess() === "released" && " Publicly Released") || 
                                (filmDetails.getAccess() === "unavailable" && " Unavailable") || 
                                (filmDetails.getAccess() === "restricted" && " Access Restricted") || 
                                (filmDetails.getAccess() === "preprod" && " Pre-Production") || 
                                (filmDetails.getAccess() === "prod" && " Production") || 
                                (filmDetails.getAccess() === "postprod" && " Post-Production")}
                            </strong>
                        </p>

                        {filmDetails.getAccess() === "restricted" && <p style={{fontSize: 18, marginTop: 0}}>Access Code: <strong>{filmDetails.getAccessCode()}</strong></p>}
                        <Button onClick={sendRequest} variant="contained" color="success" style={{fontSize: 15, marginTop: 10, width: 200}}>submit changes</Button>
                        <Button onClick={() => {setStage(Stage.CAST)}} variant="contained" color="warning" style={{fontSize: 15, marginTop: 5, width: 200}}>go back</Button>
                    </CardContent>
                </Card>
            }

            {stage === Stage.FINISHED &&
                <Card variant="outlined" sx={{width: 700, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{fontSize: 25, marginTop: 10}}><strong>Updates Complete</strong></p>
                    <p style={{fontSize: 18, marginTop: 0, textAlign: "center"}}>Your updates have been published.</p>
                </CardContent>
            </Card>}

            <Dialog
                open={showProgressBar}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle style={{backgroundColor: "#222222"}} id="alert-dialog-title">
                    Uploading Film
                </DialogTitle>
                <DialogContent style={{backgroundColor: "#222222"}}>
                <DialogContentText id="alert-dialog-description" style={{color: "white"}}>
                    Your film is uploading to the Buzz Studios Film Archive. Do not close this dialog until the upload has completed.
                </DialogContentText>
                </DialogContent>
                <LinearProgress variant="determinate" value={progress} />
            </Dialog>
        </div>
        <br></br><br></br>
    </>
    )
}