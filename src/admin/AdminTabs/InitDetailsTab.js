import React from "react";
import { Card, CardContent, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

export default function InitDetailsTab(props) {

    const [title, setTitle] = React.useState(props.filmDetails.getTitle());
    const [semester, setSemester] = React.useState(props.filmDetails.getSemester());
    const [director, setDirector] = React.useState(props.filmDetails.getDirector());
    const [stars, setStars] = React.useState(props.filmDetails.getStars());
    const [synopsis, setSynopsis] = React.useState(props.filmDetails.getSynopsis());
    const [order, setOrder] = React.useState(props.filmDetails.getOrder());
    const [category, setCategory] = React.useState(props.filmDetails.getCategory());
    const [access, setAccess] = React.useState(props.filmDetails.getAccess());
    const [accessCode, setAccessCode] = React.useState("");

    var filmDetails = props.filmDetails;

    const handleTitle = (title) => {
        filmDetails.setTitle(title);
        setTitle(title);
    }

    const handleSemester = (semester) => {
        filmDetails.setSemester(semester);
        setSemester(semester);
    }

    const handleDirector = (director) => {
        filmDetails.setDirector(director);
        setDirector(director);
    }

    const handleStars = (stars) => {
        filmDetails.setStars(stars);
        setStars(stars);
    }

    const handleSynopsis = (synopsis) => {
        filmDetails.setSynopsis(synopsis);
        setSynopsis(synopsis);
    }

    const handleOrder = (order) => {
        filmDetails.setOrder(order);
        setOrder(order);
    }

    const handleCategory = (category) => {
        if (category >= 0 && category <= 2) {
            filmDetails.setCategory(category);
            setCategory(category);
        }
    }

    const handleAccess = (access) => {
        filmDetails.setAccess(access);
        setAccess(access);
    }

    const handleAccessCode = (accessCode) => {
        filmDetails.setAccessCode(accessCode);
        setAccessCode(accessCode);
    }

    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>Film ID: <strong>{props.selectedFilm}</strong></p>

                <TextField 
                    value={title} 
                    onChange={(event) => handleTitle(event.target.value)} 
                    id="outlined-basic" 
                    label="Film Title" 
                    variant="outlined" 
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={semester} 
                    onChange={(event) => handleSemester(event.target.value)} 
                    id="outlined-basic" 
                    label="Semester Produced" 
                    variant="outlined" 
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={director} 
                    onChange={(event) => handleDirector(event.target.value)} 
                    id="outlined-basic" 
                    label="Director's Name" 
                    variant="outlined" 
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={stars} 
                    onChange={(event) => handleStars(event.target.value)} 
                    id="outlined-basic" 
                    label="Stars" 
                    variant="outlined" 
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={synopsis} 
                    onChange={(event) => handleSynopsis(event.target.value)} 
                    id="outlined-basic" 
                    label="Synopsis" 
                    variant="outlined" 
                    multiline 
                    maxRows={8} sx={{width: 400, margin: 1}} />

                <TextField 
                    value={order} 
                    onChange={(event) => handleOrder(parseInt(event.target.value) !== NaN ? parseInt(event.target.value) : 0)} 
                    id="outlined-basic" 
                    label="Order" 
                    variant="outlined" 
                    multiline maxRows={8} 
                    sx={{width: 400, margin: 1}} />
                
                <FormControl style={{width: 400, margin: "0 auto"}}>
                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                <Select
                    value={category}
                    labelId="select-indep"
                    id="select-indep-id"
                    style={{width: 400, margin: "0 auto"}}
                    label={"Category"}
                    onChange={(event) => handleCategory(event.target.value)}>
                    <MenuItem value={0}>Regular</MenuItem>
                    <MenuItem value={1}>Self-Guided</MenuItem>
                    <MenuItem value={2}>Bonus</MenuItem>
                </Select>
                </FormControl>

                <br></br>
                <FormControl style={{width: 400, margin: "0 auto"}}>
                <InputLabel id="demo-simple-select-label">Access</InputLabel>
                <Select
                    value={access}
                    labelId="select-access"
                    id="select-access-id"
                    style={{width: 400, margin: "0 auto"}}
                    label={"Access"}
                    onChange={(event) => handleAccess(event.target.value)}>
                    <MenuItem value={"released"}>Publicly Released</MenuItem>
                    <MenuItem value={"restricted"}>Access Restricted</MenuItem>
                    <MenuItem value={"unavailable"}>Unavailable</MenuItem>
                    <MenuItem value={"preprod"}>Pre-Production</MenuItem>
                    <MenuItem value={"prod"}>Production</MenuItem>
                    <MenuItem value={"postprod"}>Post-Production</MenuItem>
                </Select>
                </FormControl>

                {props.filmDetails.access === "restricted" && 
                <TextField 
                    value={accessCode}
                    onChange={(event) => handleAccessCode(event.target.value)} 
                    id="outlined-basic" 
                    label="Access Code" 
                    variant="outlined" 
                    multiline 
                    maxRows={8} sx={{width: 400, margin: 1}} />}
                
                <Button 
                    onClick={() => {
                        props.setStage(props.Stage.FILM_FILE)
                        props.setFilmDetails(filmDetails)
                    }} 
                    variant="contained" 
                    color="warning" 
                    style={{fontSize: 18, marginTop: 10}}>Submit</Button>
                
            </CardContent>
        </Card>
    );
}