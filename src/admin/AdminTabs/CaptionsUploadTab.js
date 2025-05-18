import React from "react";
import { Card, CardContent, Button } from "@mui/material";
import CaptionLanguageMenu from "../../tools/captions/CaptionLanguageMenu";
import { getStorage, ref, listAll } from "firebase/storage";

export default function CaptionsUploadTab(props) {
    
    const buttonStyle = {
        "fontSize": 15,
        "marginTop": 6,
        "backgroundColor": "#222222",
        "width": 275
    }

    const backButtonStyle = {
        "fontSize": 13,
        "marginTop": 20,
        "backgroundColor": "#444444",
        "width": 80
    }

    const [captionsExist, setCaptionsExist] = React.useState(false);
    const [languages, setLanguages] = React.useState([]);

    React.useEffect(() => {
        var captionName = props.filmDetails.captionsfile;
        if (captionName.trim() == "") {
            setCaptionsExist(false);
            return;
        } else {
            setCaptionsExist(true);
        }

        const storage = getStorage();
        const listRef = ref(storage, "translated-captions/");

        const fetchFiles = async () => {
            listAll(listRef)
            .then((res) => {
                var languages = [];
                res.items.forEach((itemRef) => {
                    var path = itemRef._location.path_;
                    if (path.includes(captionName.substring(0, captionName.length - 12)))
                    {
                        var match = path.match(/-(\w+)\.vtt$/);
                        if (match) {
                            languages.push(match[1]);
                        }
                    }
                });
                setLanguages(languages);
                console.log(languages);
            }).catch((error) => {
                console.log(error);
            });
        }
        fetchFiles();

    }, []);

    return (
        <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
            <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <p style={{color: "black", fontSize: 30, marginTop: 0}}>
                    Film ID: <strong>{props.selectedFilm}</strong>
                </p>

                {!props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film record with this ID already exists. You may either upload a new caption file or keep the current one.
                </p>}

                {props.newFilm && <p style={{color: "black", fontSize: 15, textAlign: "center", width: "70%", marginTop: -20}}>
                    A film file with this ID does not yet exist. Please upload your caption file.
                </p>}

                <Button onClick={() => props.ImportFile("captions")} variant="contained" style={buttonStyle}>
                    upload a caption file
                </Button>

                {!props.newFilm && 
                <Button onClick={() => props.setStage(props.Stage.CAST)} 
                        variant="contained" 
                        color="warning" 
                        style={buttonStyle}>
                    keep current file
                </Button>}
                
                <Button onClick={() => {props.filmDetails.captionsfile = ""; props.setStage(props.Stage.CAST)}} 
                        variant="contained" 
                        style={buttonStyle}>
                    do not include captions
                </Button>

                <Button onClick={() => {props.setStage(props.Stage.SCRIPT)}} 
                        variant="contained" 
                        style={backButtonStyle}
                >back</Button>

                {(true || captionsExist) && <CaptionLanguageMenu Name={props.Name} Email={props.Email} filmDetails={props.filmDetails} existing={languages} />}

            </CardContent>
        </Card>
    )
}