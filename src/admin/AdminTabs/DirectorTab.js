import React from "react";
import { getFirestore, query, collection, getDocs } from "firebase/firestore";
import { Card, CardContent, Select, MenuItem, Button, FormControl, InputLabel } from "@mui/material";

export default function DirectorTab(props)
{
    const [directors, setDirectors] = React.useState([]);
    const [selected, setSelected] = React.useState('');
    const [selections, setSelections] = React.useState([]);

    const buttonStyle = {
        "fontSize": 15,
        "marginTop": 6,
        "backgroundColor": "#222222",
        "width": 180
    }

    const backButtonStyle = {
        "fontSize": 13,
        "marginTop": 1,
        "backgroundColor": "#444444",
        "width": 150
    }

    React.useEffect(() => {
        fetchDirectors();
    }, []);
    
    const fetchDirectors = () => {
        const directorList = [];

        const fetch = async () => {
            var db = getFirestore();

            var getStatus = query(collection(db, props.Collection));
            var status = await getDocs(getStatus)

            status.forEach((doc) => {
                var info = doc.data();
                info.id = doc.id;
                directorList.push(info);
            });

            setDirectors(directorList);
            setSelected(directorList[0]);
        }

        fetch();
    }

    const handleAdd = () => {
        if (!selections.includes(selected)) {
            setSelections([...selections, selected]);
        }
    }

    const handleRemove = (toRemove) => {
        setSelections(selections.filter((sel) => sel !== toRemove));
    }

    const handleConfirm = () => {
        var directorIDs = [];
        var directorNames = "";
        for (var dir in selections) {
            directorIDs.push(selections[dir].id);
        }

        if (selections.length == 1) {
            directorNames = selections[0].name;
        } else if (selections.length == 2) {
            directorNames = selections[0].name + " and " + selections[1].name;
        } else {
            for (var i = 0; i < selections.length - 1; i++) {
                directorNames += selections[i].name + ", ";
            }
            directorNames += ("and " + selections[selections.length - 1].name);
        }

        props.filmDetails.director = directorIDs;
        props.filmDetails.directornames = directorNames;

        props.setStage(props.Stage.CAST);
    }

    return (
        <>
            <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 30, marginTop: 0}}>
                        Film ID: <strong>{props.selectedFilm}</strong>
                    </p>

                    {!props.newFilm && 
                    <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                        A film record with this ID already exists. You may either keep the current director record or modify it.
                    </p>}

                    {props.newFilm && 
                    <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                        A film file with this ID does not yet exist. Please add at least one director.
                    </p>}

                    <br/>
                    <div style={{display: "flex"}}>
                        <FormControl>
                            <InputLabel>Add a Director</InputLabel>
                            <Select
                                value={selected}
                                labelId="select-director"
                                id="select-director-id"
                                label="Add a Director"
                                sx={{"width": 250, "height": 45}}
                                onChange={(event) => setSelected(event.target.value)}>
                                {directors.map((director) => {
                                    return (
                                        <MenuItem value={director}>{director.name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <Button onClick={handleAdd}>Add</Button>
                    </div>

                    <br/>

                    {selections.map((director) => {
                        return (
                            <div style={{display: "flex"}}>
                                <p style={{"color": "black", fontSize: 20, margin: 5, width: 200}}>{director.name}</p>
                                <Button onClick={() => handleRemove(director)} sx={{color: "red"}}>X</Button>
                            </div>
                        )
                    })}

                    {selections.length > 0 && <Button onClick={handleConfirm} variant="contained" sx={buttonStyle}>confirm credit</Button>}
                    <Button variant="contained" sx={backButtonStyle} onClick={() => {
                        props.filmDetails.director = "N/A"; 
                        props.filmDetails.directornames = "None"; 
                        props.setStage(props.Stage.CAST)}}>no director</Button>
                    <Button variant="contained" sx={backButtonStyle} onClick={() => {props.setStage(props.Stage.CAPTIONS)}}>go back</Button>
                    
                </CardContent>
            </Card>
        </>
    )
}