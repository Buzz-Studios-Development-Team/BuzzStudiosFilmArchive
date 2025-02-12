import React from "react";
import { Card, CardContent, Button } from "@mui/material";

export default function CaptionsUploadTab(props) {
    
    const buttonStyle = {
        "fontSize": 15,
        "marginTop": 6,
        "backgroundColor": "#222222",
        "width": 275
    }

    const backButtonStyle = {
        "fontSize": 13,
        "marginTop": 20,
        "backgroundColor": "#444444",
        "width": 80
    }

    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>
                    Film ID: <strong>{props.selectedFilm}</strong>
                </p>

                {!props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film record with this ID already exists. You may either upload a new caption file or keep the current one.
                </p>}

                {props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film file with this ID does not yet exist. Please upload your caption file.
                </p>}

                <Button onClick={() => props.ImportFile("captions")} variant="contained" style={buttonStyle}>
                    choose a captions file
                </Button>

                {!props.newFilm && 
                <Button onClick={() => props.setStage(props.Stage.CAST)} 
                        variant="contained" 
                        color="warning" 
                        style={buttonStyle}>
                    keep current file
                </Button>}
                
                <Button onClick={() => {props.filmDetails.captionsfile = ""; props.setStage(props.Stage.CAST)}} 
                        variant="contained" 
                        style={buttonStyle}>
                    do not include captions
                </Button>

                <Button onClick={() => {props.setStage(props.Stage.SCRIPT)}} 
                        variant="contained" 
                        style={backButtonStyle}
                >back</Button>

            </CardContent>
        </Card>
    )
}