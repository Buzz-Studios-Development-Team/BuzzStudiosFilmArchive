import React from "react";
import { Card, CardContent, Button } from "@mui/material";

export default function CaptionsUploadTab(props) {
    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>Film ID: <strong>{props.selectedFilm}</strong></p>
                {!props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>A film record with this ID already exists. You may either upload a new caption file or keep the current one.</p>}
                {props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>A film file with this ID does not yet exist. Please upload your caption file.</p>}
                <Button onClick={() => props.ImportFile("captions")} variant="contained" color="warning" style={{fontSize: 18, marginTop: 10}}>choose a captions file</Button>
                <Button onClick={() => {props.filmDetails.captionsfile = ""; props.setStage(props.Stage.CAST)}} variant="contained" color="warning" style={{fontSize: 18, marginTop: 10}}>do not include captions</Button>
                {!props.newFilm && <Button onClick={() => props.setStage(props.Stage.CAST)} variant="contained" color="warning" style={{fontSize: 18, marginTop: 10}}>keep current file</Button>}
            </CardContent>
        </Card>
    )
}