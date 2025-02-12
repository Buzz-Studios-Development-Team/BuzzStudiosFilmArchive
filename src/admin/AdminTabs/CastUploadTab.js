import React from "react";
import { Card, CardContent, Button } from "@mui/material";

import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc } from "firebase/firestore";
import { TextField, Dialog, DialogTitle, DialogContent, DialogContentText, Select, MenuItem, LinearProgress, InputLabel, FormControl } from "@mui/material";


import CastEditor from "../../tools/CastEditor";

export default function CastUploadTab(props) {
    
    const buttonStyle = {
        "fontSize": 15,
        "marginTop": 6,
        "backgroundColor": "#222222",
        "width": 200
    }

    const backButtonStyle = {
        "fontSize": 13,
        "marginTop": 20,
        "backgroundColor": "#444444",
        "width": 80
    }

    const advance = (cast) => {
        props.filmDetails.cast = cast;
        props.setStage(props.Stage.REVIEW);
    };

    const [actors, setActors] = React.useState([]);

    const fetchActors = () => {
        const actorList = [];

        const fetch = async () => {
            var db = getFirestore();

            var getStatus = query(collection(db, "actors"));
            var status = await getDocs(getStatus)

            status.forEach((doc) => {
                var info = doc.data();
                info.id = doc.id;
                actorList.push(info);
            });

            setActors(actorList);
            setShowCastEditor(true);
        }

        fetch();
    }

    // State of the cast list creator tools
    const [showCastEditor, setShowCastEditor] = React.useState(false);
    const [castEditResult, setCastEditResult] = React.useState([]);

    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>
                    Film ID: <strong>{props.selectedFilm}</strong>
                </p>

                {!props.newFilm && 
                <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film record with this ID already exists. You may either upload a new cast list or keep the current one.
                </p>}

                {props.newFilm && 
                <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film file with this ID does not yet exist. Please upload your cast file.
                </p>}

                {!showCastEditor && 
                <Button onClick={() => fetchActors()} 
                        variant="contained" 
                        style={buttonStyle}>
                    create cast list
                </Button>}

                {!showCastEditor && 
                <Button onClick={() => props.setStage(props.Stage.REVIEW)} 
                        variant="contained" 
                        style={buttonStyle}>
                    skip this step
                </Button>}

                {showCastEditor && 
                <>
                    <CastEditor actors={actors} continue={advance}/>
                </>}

                <Button onClick={() => {props.setStage(props.Stage.CAPTIONS)}} 
                        variant="contained" 
                        style={backButtonStyle}
                >back</Button>

            </CardContent>
        </Card>
    )
}