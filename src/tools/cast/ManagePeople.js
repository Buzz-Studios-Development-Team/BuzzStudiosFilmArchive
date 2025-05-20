import React, { useEffect } from 'react';
import { Card, CardContent, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, Select, MenuItem, LinearProgress, InputLabel, FormControl } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc } from "firebase/firestore";
import {formLogObject, publishLog} from "../../logger/Logger.js";

const ManagePeople = (props) => {
    const [nameField, setNameField] = React.useState("");
    const [imdbField, setImdbField] = React.useState("");
    const [siteField, setSiteField] = React.useState("");

    const [selectedPerson, setSelectedPerson] = React.useState("");

    const [people, setPeople] = React.useState([]);

    const [editState, setEditState] = React.useState(0);

    const handleChange = (event) => {
        setSelectedPerson(event.target.value);
    };

    const RetrievePeople = () => {
        const personList = [];

        const fetch = async () => {
            var db = getFirestore();

            try {
                var coll = props.collection;
                var getStatus = query(collection(db, coll));
                var status = await getDocs(getStatus)

                status.forEach((doc) => {
                    var info = doc.data();
                    info.id = doc.id;
                    personList.push(info);
                });

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Retrieved ${coll} collection for ManagePeople`, 
                    `Success`));
            } catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Retrieval of ${coll} collection by ManagePeople failed`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }

            setPeople(personList);
        }

        fetch();
    }

    React.useEffect(() => {
        RetrievePeople();
    }, []);

    const confirm = () => {
        if (nameField == "")
        {
            alert("Name cannot be empty.");
            return;
        }

        var id = selectedPerson;
        if (editState == 0)
        {
            id = crypto.randomUUID();
        }

        const send = async () => {
            var db = getFirestore();
            var coll = props.collection;
            var obj = {
                "name": nameField,
                "imdb": imdbField,
                "site": siteField
            }

            try {
                const peopleRef = collection(db, coll);
                await setDoc(doc(peopleRef, id), {
                    name: nameField,
                    imdb: imdbField,
                    site: siteField
                });
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Successfully confirmed person details for id ${id} in ${coll} collection. Data: ${JSON.stringify(obj)}`, 
                    `Success`));
            } catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Confirmation of person details for id ${id} in ${coll} collection failed. Attempted: ${JSON.stringify(obj)}`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
            
        }
        send();

        setNameField("");
        setImdbField("");
        setSiteField("");

        RetrievePeople();

        setEditState(0);
    }

    const cancel = () => {
        if (editState == 1) { setEditState(0); }
        setNameField("");
        setImdbField("");
        setSiteField("");
    }

    const edit = () => {
        setEditState(1);
        
        var person;
        for (var i = 0; i < people.length; i++)
        {
            if (people[i].id == selectedPerson)
            {
                person = people[i];
                break;
            }
        }

        if (person !== null)
        {
            setNameField(person.name);
            setImdbField(person.imdb !== undefined ? person.imdb : "");
            setSiteField(person.site !== undefined ? person.site : "");
        }
    }

    const deletePerson = () => {
        var db = getFirestore();
        var coll = props.collection;

        var name;
        for (var i = 0; i < people.length; i++) {
            if (people[i].id === selectedPerson) {
                name = people[i].name;
                break;
            }
        }

        const del = async () => {
            try {
                await deleteDoc(doc(db, coll, selectedPerson));
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Deletion of person details for id ${selectedPerson}, name ${name} in ${coll} collection succeeded.`, 
                    `Success`));
            } catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Deletion of person details for id ${selectedPerson}, name ${name} in ${coll} collection failed.`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
        }
        del();
        RetrievePeople();
    }

    return (
        <>
            <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>{editState == 0 ? "Add New " + props.personType : "Edit " + props.personType}</p>
                    <TextField value={nameField} onChange={(event) => {setNameField(event.target.value);}} id="outlined-basic" label={props.personType + " Name"} variant="outlined" sx={{margin: 0.5}} />
                    <TextField value={imdbField} onChange={(event) => {setImdbField(event.target.value);}} id="outlined-basic" label="IMDb Link" variant="outlined" sx={{margin: 0.5}} />
                    <TextField value={siteField} onChange={(event) => {setSiteField(event.target.value);}} id="outlined-basic" label="Personal Website Link" variant="outlined" sx={{margin: 0.5}} />

                    <div style={{display: "flex", gap: 10}}>
                        <Button onClick={() => {confirm();}} variant="contained" color="success" style={{fontSize: 15, marginTop: 10}}>Confirm</Button>
                        <Button onClick={() => {cancel();}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "darkred"}}>Cancel</Button>
                    </div>

                    <br></br>
                    
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>{"Existing People"}</p>
                    <FormControl style={{margin: "0 auto", width: 250}}>
                        <Select
                            labelId="select-existing-film"
                            id="select-film-id"
                            value={selectedPerson}
                            hiddenLabel
                            onChange={handleChange}>
                            {
                                people.sort((a, b) => a.name.localeCompare(b.name)).map((person, i) => {
                                    return (
                                        <MenuItem value={person.id}>{person.name}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>

                    <div style={{display: "flex", gap: 10}}>
                        <Button onClick={() => {edit()}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "gray"}}>Edit</Button>
                        <Button onClick={() => {deletePerson()}} variant="contained" style={{fontSize: 15, marginTop: 10, backgroundColor: "gray"}}>Delete</Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default ManagePeople;