import React from "react";

import { getFirestore, updateDoc } from "firebase/firestore";
import { doc, setDoc, deleteDoc, query, collection, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogContentText, LinearProgress } from "@mui/material";
import { TableContainer, TableRow, TableCell, Table, TableHead } from "@mui/material";

import HomePage from "../homepage/HomePage";

import { formLogObject, publishLog } from "../logger/Logger.js";

export default function FilmOrderTool(props) {

    const [semester, setSemester] = React.useState();
    const [semesters, setSemesters] = React.useState([]);
    const [semesterFilms, setSemesterFilms] = React.useState([]);
    const [sortedFilms, setSortedFilms] = React.useState([]);

    const RetrieveSemesters = () => {
        const fetch = async () => {
            try {
                var db = getFirestore();
                var coll = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION;
                var getStatus = query(collection(db, coll));
                var status = await getDocs(getStatus);

                var semesters = [];
                status.forEach((doc) => {

                    var film = doc.data();
                    if (!semesters.includes(film.semester) && film.semester !== "Do Not Show") {
                        semesters.push(film.semester);
                    }
                });
                setSemesters(sortSemesters(semesters));

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Successfully retrieved ${coll} collection for film order tool to determine semesters`, 
                    `Success`));
            }
            catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Failed to retrieve ${coll} collection for film order tool to determine semesters`, 
                    `Failure: ${error}`));
            }
        }

        fetch();
    };

    const RetrieveFilms = (semester) => {
        var coll = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION;
        const fetch = async () => {
            var db = getFirestore();
            var getStatus = query(
                collection(db, coll), 
                where("semester", "==", semester)
            );

            try {
                var status = await getDocs(getStatus);
                var films = [];
                status.forEach((doc) => {
                    var film = doc.data();
                    film.id = doc.id;
                    films.push(film);
                });

                setSemesterFilms(films);
                setSortedFilms([]);

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Successfully retrieved ${coll} collection for film order tool for semester ${semester}`, 
                    `Success`));

            } catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Retrieval of ${coll} collection for film order tool failed for semester ${semester}`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
        }

        fetch();
    };

    React.useEffect(() => {
        RetrieveSemesters();
    }, []);

    const handleChange = (event) => {
        setSemester(event.target.value);
        RetrieveFilms(event.target.value);
    };

    function sortSemesters(semesters) {
        const seasonOrder = {
            Spring: 0,
            Summer: 1,
            Fall: 2,
            'Date Unknown': 3
        };
        
        semesters.sort((a, b) => {
            const [seasonA, yearA] = a.split(' ');
            const [seasonB, yearB] = b.split(' ');
        
            // Check if either film has "Date Unknown"
            const hasDateUnknownA = seasonA === 'Date' && yearA === 'Unknown';
            const hasDateUnknownB = seasonB === 'Date' && yearB === 'Unknown';
        
            // Handle "Date Unknown" FilmDBData
            if (hasDateUnknownA && hasDateUnknownB) {
            return 0; // Keep the order as is
            } else if (hasDateUnknownA) {
            return 1; // Move "Date Unknown" film to the end
            } else if (hasDateUnknownB) {
            return -1; // Move "Date Unknown" film to the end
            }
        
            // Compare years first
            if (yearA !== yearB) {
            return parseInt(yearB) - parseInt(yearA);
            }
        
            // If years are the same, compare seasons
            return seasonOrder[seasonB] - seasonOrder[seasonA];
        });
        
        return semesters;
    };

    const addToSort = (film) => {
        setSemesterFilms(prevFilms => prevFilms.filter(f => f !== film));
        setSortedFilms(prevSorted => [...prevSorted, film]);
    };

    const removeFromSort = (film) => {
        setSemesterFilms(prevSem => [...prevSem, film]);
        setSortedFilms(prevSorted => prevSorted.filter(f => f !== film));
    };

    const confirmOrder = () => {
        const firestore = getFirestore();
        var coll = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION;
        for (let i = 0; i < sortedFilms.length; i++) {
            let ref = doc(firestore, coll, sortedFilms[i].id);

            updateDoc(ref, { order: i })
            .then(() => {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Updated order of film ${sortedFilms[i].id} to ${i}`, 
                    `Success`));
            })
            .catch((error) => {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Could not update order of film ${sortedFilms[i].id} to ${i}`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            });
        }    

        setSemester(undefined);
        setSemesterFilms([]);
        setSortedFilms([]);
    };

    return (
        <>
            <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>Semesters</p>

                    <FormControl style={{margin: "0 auto", width: 250}}>
                        <Select
                            labelId="select-film"
                            id="select-film-id"
                            value={semester}
                            hiddenLabel
                            onChange={handleChange}>
                            {
                                semesters.map((film, i) => {
                                    return (
                                        <MenuItem value={film}>{film}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>

                    {semester !== undefined && <><br/><p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>{semester} Films</p>
                    <TableContainer>
                        <Table size="small" >
                            <TableHead>
                                <TableCell><strong>Title</strong></TableCell>
                                <TableCell align="right"><strong>Add</strong></TableCell>
                            </TableHead>
                            {semesterFilms.map((film, i) => {
                                return (
                                    <TableRow>
                                        <TableCell>{film.title}</TableCell>
                                        <TableCell align="right"><Button onClick={() => {addToSort(film)}}>Add</Button></TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    </TableContainer></>}

                    {semester !== undefined && <><br/><p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>Sorted Films</p>
                    <TableContainer>
                        <Table size="small" >
                            <TableHead>
                                <TableCell><strong>Order</strong></TableCell>
                                <TableCell align="center"><strong>Title</strong></TableCell>
                                <TableCell align="right"><strong>Remove</strong></TableCell>
                            </TableHead>
                            {sortedFilms.map((film, i) => {
                                return (
                                    <TableRow >
                                        <TableCell><strong>{i + 1}</strong></TableCell>
                                        <TableCell>{film.title}</TableCell>
                                        <TableCell align="right"><Button onClick={() => {removeFromSort(film)}}>Remove</Button></TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    </TableContainer></>}

                    <br/>

                    {semesterFilms.length == 0 && sortedFilms.length > 0 && <Button onClick={confirmOrder} sx={{backgroundColor: "#222222"}} variant="contained">Confirm</Button>}

                </CardContent>
            </Card>
        </>
    )
}