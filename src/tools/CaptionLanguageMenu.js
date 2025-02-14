import React from "react";
import { TableContainer, Table, TableRow, TableCell, Select, MenuItem, Button } from "@mui/material";

export default function CaptionLanguageMenu(props)
{
    const [language, setLanguage] = React.useState(0);
    const [languages, setLanguages] = React.useState([]);

    const [genStatus, setGenStatus] = React.useState([]);
    const [newLanguages, setNewLanguages] = React.useState([]);
    const [active, setActive] = React.useState(false);

    React.useEffect(() => {
        var langFile = require('./iso_language_codes.json');
        var langList = [];
        for (var i = 0; i < langFile.length; i++) {
            langList.push(langFile[i])
        }
        setLanguages(langList);
        setLanguage(langFile[0].language);
    }, []);

    const handleChange = (event) => {
        setLanguage(event.target.value);
    }

    const generate = () => {
        setGenStatus([...genStatus, 0]);
        setNewLanguages([...newLanguages, language]);
        setActive(true);

        fetch('https://us-east1-buzz-studios-7f814.cloudfunctions.net/translate-captions?film=' + props.filmDetails.title + "&language=" + language, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(data => {
            if (data === "Translation completed") {
                var newStatus = genStatus;
                newStatus[newStatus.length] = 1;
                setGenStatus(newStatus);
            } else {
                var newStatus = genStatus;
                newStatus[newStatus.length] = 2;
                setGenStatus(newStatus);
            }
            setActive(false);
        })
        .catch(error => {
            console.log(error);
            var newStatus = genStatus;
            newStatus[newStatus.length] = 3;
            setGenStatus(newStatus);
            setActive(false);
        })
    };

    const getStatus = (num) => {
        if (num == 0) {
            return "In Progress";
        } else if (num == 1) {
            return "Generated";
        } else if (num == 2) {
            return "Internal Error";
        } else if (num == 3) {
            return "Request Error";
        }
    };

    return (
        <>
            <div sx={{display: "flex", flexDirection: "horizontal"}}>
                <Select
                    labelId="select-language"
                    id="select-language"
                    value={language}
                    hiddenLabel
                    sx={{width: 200, marginTop: 5, height: 40, marginRight: 2}}
                    onChange={handleChange}>
                    {
                        languages.map((lang, i) => {
                            return (
                                <MenuItem style={{fontSize: 15}} value={lang.language}>{lang.language}</MenuItem>
                            )
                        })
                    }
                </Select>
                <Button enabled={!active} onClick={generate} variant="contained">Generate</Button>
            </div>

            <TableContainer>
                <Table>
                    <TableRow>
                        <TableCell align="left"><strong>Language</strong></TableCell>
                        <TableCell align="left"><strong>Status</strong></TableCell>
                    </TableRow>
                    {props.existing.map((lang) => {
                        return (
                            <>
                                <TableRow>
                                    <TableCell>{lang}</TableCell>
                                    <TableCell>Generated</TableCell>
                                </TableRow>
                                {/* <TableCell align="right"><Button onClick={() => {}} variant="contained" style={{backgroundColor: "red", color: "white"}}><strong>X</strong></Button></TableCell> */}
                            </>
                        )
                    })}
                    {newLanguages.map((lang, i) => {
                        return (
                            <>
                                <TableRow>
                                    <TableCell>{lang}</TableCell>
                                    <TableCell>{getStatus(genStatus[i])}</TableCell>
                                </TableRow>
                            </>
                        )
                    })}
                </Table>
            </TableContainer>
        </>
    )
}