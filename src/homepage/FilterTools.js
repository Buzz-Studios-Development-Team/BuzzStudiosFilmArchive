import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button } from "@mui/material";

export default function FilterTools(props) {
    return (
        <>
            <div class="search-bar" style={{marginBottom: 0}}>
                <input onChange={(e) => props.setSearchBarValue(e.target.value)} type="text" class="input-field" placeholder="Search..."/>
            </div>
            <div style={{color: "white", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "baseline"}}>
                <input onClick={() => props.setShowRestrictedFilms(!props.ShowRestrictedFilms)} checked={props.ShowRestrictedFilms} type="checkbox" style={{transform: "scale(1.5)"}}/><p onClick={() => props.setShowRestrictedFilms(!props.ShowRestrictedFilms)} style={{marginLeft: 16, fontSize: 18, paddingBottom: 3, cursor: "pointer", userSelect: "none"}}>Show Access-Restricted Films</p>
            </div>
            <div style={{color: "white", display: "flex", flexDirection: "row", justifyContent: "center", marginTop: -30, alignItems: "baseline"}}>
                <input onClick={() => props.setShowUnavailableFilms(!props.ShowUnavailableFilms)} checked={props.ShowUnavailableFilms} type="checkbox" style={{transform: "scale(1.5)"}}/><p onClick={() => props.setShowUnavailableFilms(!props.ShowUnavailableFilms)} style={{marginLeft: 16, fontSize: 18, paddingBottom: 3, cursor: "pointer", userSelect: "none"}}>Show Unreleased Films</p>
            </div>

            <FormControl >
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="regular"
                name="radio-buttons-group"
                class="radio-row"
                row
              >
                <FormControlLabel onClick={() => {props.setShowIndependentFilms(false); props.setShowBonusFilms(false);}} value="regular" style={{color: "white"}} control={<Radio style={{color: "white"}}/>} label="Regular Films" />
                <FormControlLabel onClick={() => {props.setShowIndependentFilms(true); props.setShowBonusFilms(false);}} value="unguided" style={{color: "white"}} control={<Radio style={{color: "white"}}/>} label="Self-Guided Films" />
                <FormControlLabel onClick={() => {props.setShowIndependentFilms(false); props.setShowBonusFilms(true);}} value="bonus" style={{color: "white"}} control={<Radio style={{color: "white"}}/>} label="Bonus Material" />
              </RadioGroup>
            </FormControl>

            {/* If there is a genre tag filter set, display text */}
            {props.tag.get("tag") !== null && <><br></br><p style={{color: "lightgray", fontSize: 22}}>Filtering by tag: <br></br><strong>{props.tag.get("tag")}</strong></p><Button onClick={() => {window.location.href = "/";}} variant="outlined" style={{marginTop: -10, color: "gray", borderColor: "gray"}}>Clear</Button></>}
            {/* If there is an actor filter set, display text */}
            {props.tag.get("actor") != null && <><br></br><p className="intro-body">Displaying films with <strong>{props.tag.get("name")}</strong> as cast member</p><Button onClick={() => {window.location.href = "/";}} variant="outlined" style={{marginTop: -6, color: "gray", borderColor: "gray", maxHeight: 35}}>Clear</Button><br></br><br></br></>}
  
            {props.ShowIndependent && <p class="intro-body"> This section contains films sponsored by<br></br> Buzz Studios and produced outside the<br></br>official production schedule.</p>}
            {props.ShowBonusFilms && <p class="intro-body"> This section contains blooper reels, trailers,<br></br>practice films, and other material not<br></br>applicable to the other categories.</p>}
  
        </>
    )
}