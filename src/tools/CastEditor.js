import React, { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, Select, MenuItem, LinearProgress, InputLabel, FormControl } from "@mui/material";

export default function CastEditor(props) {

    const [cast, setCast] = React.useState([]);
    const [selectedActor, setSelectedActor] = React.useState("");
    const [roleName, setRoleName] = React.useState("");
    const [addState, setAddState] = React.useState(0);

    useEffect(() => {
        if (props.prevCast && props.prevCast.length > 0) {
            setCast(props.prevCast);
        }
    }, [props.prevCast]);
    
    /*
    //Attempt to validate ids before setting the previous cast 
    useEffect(() => {
        if (props.previousCast && props.previousCast.length > 0) {
          const validActorIds = new Set(props.actors.map(actor => actor.id));
          const filtered = props.previousCast.filter(c => validActorIds.has(c.actor));
          setCast(filtered);
        }
      }, [props.previousCast, props.actors]);
    */

    const handleChange = (event) => {
        setSelectedActor(event.target.value);
    };

    const addActor = () => {
        setCast([...cast, {"actor": selectedActor, "role": roleName}]);

        setAddState(0);
        setSelectedActor("");
        setRoleName("");
    }

    const getActorName = (id) => {
        for (var actor in props.actors)
        {
            if (props.actors[actor].id == id) { return props.actors[actor].name; }
        }
    }

    const moveActor = (fromIndex, toIndex) => {
        const newCast = [...cast];
        const [actorToMove] = newCast.splice(fromIndex, 1);
        newCast.splice(toIndex, 0, actorToMove);
        setCast(newCast);
    }

    const remove = (id) => {
        var newCast = [];
        for (var i = 0; i < cast.length; i++)
        {
            if (cast[i].actor != id)
            {
                newCast.push(cast[i]);
            }
        }
        setCast(newCast);
    }

    return (
        <>

        {addState == 0 && <><p style={{color: "black", fontSize: 18, margin: 10, fontFamily: "Lucida Sans"}}>Choose From Actors</p>
        <FormControl style={{margin: "0 auto", width: 250}}>
            <Select
                labelId="select-existing-film"
                id="select-film-id"
                value={selectedActor}
                hiddenLabel
                onChange={handleChange}>
                {
                    [...props.actors].sort((a,b) => a.name.localeCompare(b.name)).map((actor, i) => {
                        return (
                            <MenuItem style={{fontSize: 15}} value={actor.id}>{actor.name}</MenuItem>
                        )
                    })
                }
            </Select>
        </FormControl>
        {selectedActor != "" && <Button onClick={() => {setAddState(1)}} style={{backgroundColor: "gray", color: "white", marginTop: 10}}>Continue</Button>}</>}


        {addState == 1 && <><p style={{color: "black", fontSize: 18, margin: 10, fontFamily: "Lucida Sans"}}>Role</p>
        <TextField value={roleName} onChange={(event) => {setRoleName(event.target.value);}} id="outlined-basic" label="Role Name" variant="outlined" sx={{margin: 0.5, marginTop: -1, width: 250}} />
        {roleName != "" && <Button onClick={addActor} style={{backgroundColor: "gray", color: "white", marginTop: 10}}>Confirm</Button>}</>}

        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table" mode="dark">
            <TableHead>
                <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell align="center"><strong>Order</strong></TableCell>
                <TableCell align="center"><strong>Delete</strong></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {cast.map((row, index) => (
                <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell size="small" component="th" scope="row">
                    {getActorName(row.actor)}
                    </TableCell>
                    <TableCell size="small">{row.role}</TableCell>
                    <TableCell size="small" align="center">
                        <Button disabled={index === 0} onClick={() => {moveActor(index, index - 1)}}>↑</Button>
                        <Button disabled={index === cast.length-1} onClick={() => {moveActor(index, index + 1)}}>↓</Button>
                    </TableCell>
                    <TableCell size="small" align="center">
                        <Button onClick={() => {remove(row.actor)}} variant="contained" style={{backgroundColor: "red", color: "white"}}><strong>X</strong></Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>

        <br></br><br></br>
        <Button onClick={() => {props.continue(cast)}} variant="contained" style={{backgroundColor: "gray", fontSize: 18}}>Finish</Button>

        </>
    )
};