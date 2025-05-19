import { Button } from "@mui/material";
import { Link } from 'react-router-dom';
import { CastTable } from "./CastTable";
import imdbLogo from "../images/IMDb_Logo_Alt_Rectangle_White.png";
import React from "react";

export function VideoInfo(props)
{
    const [showCast, setShowCast] = React.useState(false);
    
    const getDirectorName = (id) => {
      for (var dir in props.Directors)
      {
        if (props.Directors[dir].id == id) { return props.Directors[dir].name; }
      }
    }

    const formDirectorString = (directors) => {
        var directorNames = "";

        if (directors.length == 1) {
            directorNames = getDirectorName(directors[0]);
        } else if (directors.length == 2) {
            directorNames = getDirectorName(directors[0]) + " and " + getDirectorName(directors[1]);
        } else {
            for (var i = 0; i < directors.length - 1; i++) {
                directorNames += getDirectorName(directors[i]) + ", ";
            }
            directorNames += ("and " + getDirectorName(directors[directors.length - 1]));
        }

        return directorNames;
    };

    return (
        <>
            {!showCast && <><strong><p class="title">{props.FilmData.title}</p></strong>

            {Array.isArray(props.FilmData.director) && <p class="subheading">Directed by {formDirectorString(props.FilmData.director)}</p>}
            {props.FilmData.stars !== "None" && <p class="subheading">Starring {props.FilmData.stars}</p>}
            <br></br>
            <p class="synopsis">{props.FilmData.synopsis}</p>

            {props.FilmData.tags !== undefined &&
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "15px"}}>
                {props.FilmData.tags.map((tag, i) => {
                return (
                    <a style={{color: "white", textDecoration: "none"}} ><p class="tag-body">{tag}</p></a> //href={"/?tag=" + tag}
                )
                })}
            </div>}
            
            {props.ScriptURL !== "" && <Link style={{textDecoration: 'none'}} id="scriptLink" target="_blank" download to={props.ScriptURL}><Button style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: "25px"}} variant="contained" id="scriptDownload">Download Script</Button></Link>}
            </>}

            {showCast && <CastTable
                FilmData={props.FilmData}
                GetActorName={props.GetActorName}
            />}

            {props.FilmData["cast-new"] !== undefined && props.FilmData["cast-new"].length > 0 && <Button onClick={() => {setShowCast(!showCast)}} style={{margin: "0 auto", width: 200, backgroundColor: "black", display: "block", marginTop: props.ScriptURL !== "" ? "10px" : "25px"}} variant="contained" id="scriptDownload">{showCast ? "Hide Cast" : "Show Cast"}</Button>}
            {props.FilmData.imdb && props.FilmData.imdb !== "" && <a href={props.FilmData.imdb} style={{textDecoration: 'none'}} id="imdbLink" target="_blank"><Button style={{margin: "0 auto", width: 80, backgroundColor: "black", display: "block", marginTop: "25px", lineHeight: "0"}} variant="contained" id="imdbButton"><img src={imdbLogo} height="25px" margin="0" align="middle"></img></Button></a>}
        </>
    )
}