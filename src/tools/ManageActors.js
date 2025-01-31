import React, { useEffect } from 'react';
import { Card, CardContent, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, Select, MenuItem, LinearProgress, InputLabel, FormControl } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc } from "firebase/firestore";

const ManageActors = (props) => {
    const [actorNameField, setActorNameField] = React.useState("");
    const [imdbField, setImdbField] = React.useState("");
    const [siteField, setSiteField] = React.useState("");

    const [selectedActor, setSelectedActor] = React.useState("");

    const [actors, setActors] = React.useState([]);

    const [editState, setEditState] = React.useState(0);

    const handleChange = (event) => {
        setSelectedActor(event.target.value);
    };

    const RetrieveActors = () => {
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
        }

        fetch();
    }

    React.useEffect(() => {
        RetrieveActors();
    }, []);

    const confirm = () => {
        if (actorNameField == "")
        {
            alert("Name cannot be empty.");
            return;
        }

        var id = selectedActor;
        if (editState == 0)
        {
            id = Math.random().toString().substring(2);
        }

        const send = async () => {
            var db = getFirestore();

            const actorsRef = collection(db, "actors");

            await setDoc(doc(actorsRef, id), {
                name: actorNameField,
                imdb: imdbField,
                site: siteField
            });
            
        }
        send();

        setActorNameField("");
        setImdbField("");
        setSiteField("");

        RetrieveActors();

        setEditState(0);
    }

    const cancel = () => {
        if (editState == 1) { setEditState(0); }
        setActorNameField("");
        setImdbField("");
        setSiteField("");
    }

    const edit = () => {
        setEditState(1);
        
        var actor;
        for (var i = 0; i < actors.length; i++)
        {
            if (actors[i].id == selectedActor)
            {
                actor = actors[i];
                break;
            }
        }

        if (actor !== null)
        {
            setActorNameField(actor.name);
            setImdbField(actor.imdb !== undefined ? actor.imdb : "");
            setSiteField(actor.site !== undefined ? actor.site : "");
        }
    }

    const deleteActor = () => {
        var db = getFirestore();
        const del = async () => {
            await deleteDoc(doc(db, "actors", selectedActor));
        }
        del();
        RetrieveActors();
    }

    return (
        <>
            <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>{editState == 0 ? "Add New Actor" : "Edit Actor"}</p>
                    <TextField value={actorNameField} onChange={(event) => {setActorNameField(event.target.value);}} id="outlined-basic" label="Actor Name" variant="outlined" sx={{margin: 0.5}} />
                    <TextField value={imdbField} onChange={(event) => {setImdbField(event.target.value);}} id="outlined-basic" label="IMDb Link" variant="outlined" sx={{margin: 0.5}} />
                    <TextField value={siteField} onChange={(event) => {setSiteField(event.target.value);}} id="outlined-basic" label="Personal Website Link" variant="outlined" sx={{margin: 0.5}} />

                    <div style={{display: "flex", gap: 10}}>
                        <Button onClick={() => {confirm();}} variant="contained" color="success" style={{fontSize: 15, marginTop: 10}}>Confirm</Button>
                        <Button onClick={() => {cancel();}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "darkred"}}>Cancel</Button>
                    </div>

                    <br></br>
                    
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>{"Existing Actors"}</p>
                    <FormControl style={{margin: "0 auto", width: 250}}>
                        <Select
                            labelId="select-existing-film"
                            id="select-film-id"
                            value={selectedActor}
                            hiddenLabel
                            onChange={handleChange}>
                            {
                                actors.map((actor, i) => {
                                    return (
                                        <MenuItem value={actor.id}>{actor.name}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>

                    <div style={{display: "flex", gap: 10}}>
                        <Button onClick={() => {edit()}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "gray"}}>Edit</Button>
                        <Button onClick={() => {deleteActor()}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "gray"}}>Delete</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default ManageActors;