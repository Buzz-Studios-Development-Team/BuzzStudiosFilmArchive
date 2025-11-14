import React from "react";
import { Card, CardContent, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

export default function InitDetailsTab(props) {

    const [title, setTitle] = React.useState(props.filmDetails.getTitle());
    const [semester, setSemester] = React.useState(props.filmDetails.getSemester());
    const [synopsis, setSynopsis] = React.useState(props.filmDetails.getSynopsis());
    const [category, setCategory] = React.useState(props.filmDetails.getCategory());
    const [access, setAccess] = React.useState(props.filmDetails.getAccess());
    const [accessCode, setAccessCode] = React.useState("");
    const [index, setIndex] = React.useState(props.filmDetails.getIndex())
    const [imdb, setIMDB] = React.useState(props.filmDetails.getIMDB()); 

    const [titleError, setTitleError] = React.useState(false);
    const [semesterError, setSemesterError] = React.useState(false);
    const [synopsisError, setSynopsisError] = React.useState(false);
    const [categoryError, setCategoryError] = React.useState(false);
    const [accessError, setAccessError] = React.useState(false);
    const [accessCodeError, setAccessCodeError] = React.useState(false);
    const [indexError, setIndexError] = React.useState(false);
    const [imdbError, setIMDBError] = React.useState(false);

    var filmDetails = props.filmDetails;

    const handleTitle = (title) => {
        var valid = filmDetails.setTitle(title);
        setTitle(title);
        setTitleError(!valid);
    }

    const handleSemester = (semester) => {
        var valid = filmDetails.setSemester(semester);
        setSemester(semester);
        setSemesterError(!valid);
    }

    const handleSynopsis = (synopsis) => {
        var valid = filmDetails.setSynopsis(synopsis);
        setSynopsis(synopsis);
        setSynopsisError(!valid);
    }

    const handleCategory = (category) => {
        var valid = filmDetails.setCategory(category);
        setCategory(category);
        setCategoryError(!valid);
    }

    const handleAccess = (access) => {
        var valid = filmDetails.setAccess(access);
        setAccess(access);
        setAccessError(!valid);

        if (access === "restricted" && (filmDetails.accessCode === undefined || filmDetails.accessCode.trim() === "")) {
            setAccessCodeError(true);
        }
    }

    const handleAccessCode = (accessCode) => {
        var valid = filmDetails.setAccessCode(accessCode);
        setAccessCode(accessCode);
        setAccessCodeError(!valid);
    }

    const handleIMDB = (imdb) => {
        var valid = filmDetails.setIMDB(imdb);
        setIMDB(imdb);
        setIMDBError(!valid);
    }

    const handleIndex = (index) => {
        var valid = filmDetails.setIndex(index);
        setIndex(index);
        setIndexError(!valid);
    }

    const verifyAndContinue = () => {
        if (!titleError
            && !semesterError
            && !synopsisError
            && !categoryError
            && !accessError
            && !accessCodeError
            && !indexError
            && !imdbError
        ) {
            props.setStage(props.Stage.FILM_FILE)
            props.setFilmDetails(filmDetails)
        }
    };

    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent sx={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>Film ID: <strong>{props.selectedFilm}</strong></p>

                <TextField 
                    value={title} 
                    onChange={(event) => handleTitle(event.target.value)} 
                    id="outlined-basic" 
                    label="Film Title" 
                    variant="outlined" 
                    error={titleError}
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={semester} 
                    onChange={(event) => handleSemester(event.target.value)} 
                    id="outlined-basic" 
                    label="Semester Produced" 
                    variant="outlined" 
                    error={semesterError}
                    sx={{width: 400, margin: 1}} />

                <TextField 
                    value={synopsis} 
                    onChange={(event) => handleSynopsis(event.target.value)} 
                    id="outlined-basic" 
                    label="Synopsis" 
                    variant="outlined" 
                    multiline 
                    error={synopsisError}
                    maxRows={8} sx={{width: 400, margin: 1}} />

                <TextField 
                    value={imdb} 
                    onChange={(event) => handleIMDB(event.target.value)} 
                    id="outlined-basic" 
                    label="IMDb Link" 
                    variant="outlined" 
                    error={imdbError}
                    sx={{width: 400, margin: 1}} />
                
                <FormControl sx={{width: 400, margin: 1}}>
                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                <Select
                    value={category}
                    labelId="select-indep"
                    id="select-indep-id"
                    style={{width: 400, margin: "0 auto"}}
                    label={"Category"}
                    error={categoryError}
                    onChange={(event) => handleCategory(event.target.value)}>
                    <MenuItem value={0}>Regular</MenuItem>
                    <MenuItem value={1}>Veteran</MenuItem>
                    <MenuItem value={2}>Bonus</MenuItem>
                </Select>
                </FormControl>

                <FormControl sx={{width: 400, margin: 1}}>
                <InputLabel id="demo-simple-select-label">Access</InputLabel>
                <Select
                    value={access}
                    labelId="select-access"
                    id="select-access-id"
                    style={{width: 400, margin: "0 auto"}}
                    label={"Access"}
                    error={accessError}
                    onChange={(event) => handleAccess(event.target.value)}>
                    <MenuItem value={"released"}>Publicly Released</MenuItem>
                    <MenuItem value={"restricted"}>Access Restricted</MenuItem>
                    <MenuItem value={"unavailable"}>Unavailable</MenuItem>
                    <MenuItem value={"preprod"}>Pre-Production</MenuItem>
                    <MenuItem value={"prod"}>Production</MenuItem>
                    <MenuItem value={"postprod"}>Post-Production</MenuItem>
                </Select>
                </FormControl>

                <FormControl sx={{width: 400, margin: 1}}>
                <InputLabel id="demo-simple-select-label">Index</InputLabel>
                <Select
                    value={index}
                    labelId="select-index"
                    id="select-index-id"
                    style={{width: 400, margin: "0 auto"}}
                    label={"Index"}
                    error={indexError}
                    onChange={(event) => handleIndex(event.target.value)}>
                    <MenuItem value={0}>Follow Category Indexing Rule</MenuItem>
                    <MenuItem value={1}>Override: Allow Indexing</MenuItem>
                    <MenuItem value={2}>Override: Disallow Indexing</MenuItem>
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
                    error={accessCodeError}
                    maxRows={8} sx={{width: 400, margin: 1}} />}
                
                <br/>
                <div sx={{display: "flex", flexDirection: "horizontal"}}>
                    <Button 
                        onClick={() => {
                            props.setStage(props.Stage.INIT_MENU)
                        }} 
                        variant="contained" 
                        color="warning" 
                        style={{fontSize: 15, margin: 2, backgroundColor: "#222222"}}>Back</Button>

                    <Button 
                        onClick={verifyAndContinue} 
                        variant="contained" 
                        color="warning" 
                        style={{fontSize: 15, margin: 2, backgroundColor: "#222222"}}>Submit</Button>
                </div>
                
            </CardContent>
        </Card>
    );
}