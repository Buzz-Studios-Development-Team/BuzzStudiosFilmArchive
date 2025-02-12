import React from "react";
import { Card, CardContent, Button } from "@mui/material";

export default function ThumbnailUploadTab(props) {

    const buttonStyle = {
        "fontSize": 15,
        "marginTop": 6,
        "backgroundColor": "#222222",
        "width": 250
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
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>Film ID: <strong>{props.selectedFilm}</strong></p>

                {!props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film record with this ID already exists. You may either upload a new thumbnail or keep the current one.
                </p>}

                {props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film file with this ID does not yet exist. Please upload your thumbnail file.
                </p>}

                <Button onClick={() => props.ImportFile("image")} 
                        variant="contained" 
                        color="warning" 
                        style={buttonStyle}
                >upload a thumbnail file</Button>
                
                {!props.newFilm && 
                <Button onClick={() => props.setStage(props.Stage.SCRIPT)} 
                        variant="contained" 
                        color="warning" 
                        style={buttonStyle}
                >keep current file</Button>}

                <Button onClick={() => {props.filmDetails.thumbnail = "logo.png"; props.setStage(props.Stage.SCRIPT);}} 
                        variant="contained" 
                        color="warning" 
                        style={buttonStyle}
                >use club logo file</Button>

                <Button onClick={() => {props.setStage(props.Stage.FILM_FILE)}} 
                        variant="contained" 
                        style={backButtonStyle}
                >back</Button>

            </CardContent>
        </Card>
    )
}