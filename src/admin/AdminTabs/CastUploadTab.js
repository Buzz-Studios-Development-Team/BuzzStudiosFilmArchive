import React from "react";
import { Card, CardContent, Button } from "@mui/material";

import CastEditor from "../../tools/CastEditor";

export default function CastUploadTab(props) {
    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>Film ID: <strong>{props.selectedFilm}</strong></p>
                {!props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>A film record with this ID already exists. You may either upload a new cast list or keep the current one.</p>}
                {props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>A film file with this ID does not yet exist. Please upload your cast file.</p>}
                {!props.showCastEditor && <Button onClick={() => props.setShowCastEditor(true)} variant="contained" color="warning" style={{fontSize: 15, marginTop: 10}}>create cast list</Button>}
                {!props.showCastEditor && <Button onClick={() => props.setStage(props.Stage.REVIEW)} variant="contained" color="warning" style={{fontSize: 15, marginTop: 10}}>skip this step</Button>}

                {props.showCastEditor && 
                <>
                    <CastEditor setStage={props.setStage} editResult={props.setCastEditResult}/>
                </>}
            </CardContent>
        </Card>
    )
}