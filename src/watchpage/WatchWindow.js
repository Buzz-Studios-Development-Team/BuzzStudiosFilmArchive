import { VideoPlayer } from "./VideoPlayer";
import { VideoInfo } from "./VideoInfo";

export function WatchWindow(props) 
{
    return (
        <>
            <div className={props.FilmData.access == "released" || props.Authenticated ? ("video-container") : ("msg-container")}>
                {props.Authenticated ? (

                    <VideoPlayer
                        VideoRef={props.VideoRef}
                        VideoURL={props.VideoURL}
                        CaptionTracks={props.CaptionTracks}
                    />

                ) : props.FilmData.access == "unavailable" 
                    || props.FilmData.access == "preprod" 
                    || props.FilmData.access == "prod" 
                    || props.FilmData.access == "postprod" ? (

                    <ComingSoon/>

                ) : props.FilmData.access == "restricted" ? (

                    <PasswordPrompt
                        FilmData={props.FilmData}
                        PasswordSetter={props.PasswordSetter}
                        RequestFiles={props.RequestFiles}
                    />

                ) : !props.NotFound ? <div className="coming-soon">

                    <Loading/>
                </div>
                : <div className="coming-soon">

                    <Loading/>
                </div>}
            </div>

            {props.FilmData.access !== undefined && <div className={props.FilmData.independent ? "info-box-indep" : props.FilmData.bonus ? "info-box-bonus" : "info-box"}>
                
                <VideoInfo
                    FilmData={props.FilmData}
                    ShowCast={props.ShowCast}
                    SetShowCast={props.SetShowCast}
                    ScriptURL={props.ScriptURL}
                    GetActorName={props.GetActorName}
                />

            </div>}
        </>
    )
}

export function ComingSoon()
{
    return (
        <>
            <div className="coming-soon">
                <p class="cs"><b>Coming Soon</b></p>
                <p class="css">Please check back later.</p>
            </div>
        </>
    )
}

export function PasswordPrompt(props)
{
    var password = "";

    return (
        <>
            <div className="coming-soon">
                <p class="cs"><b>Restricted</b></p>
                <p class="css">This film has not yet been made available to the general public. Please enter the access code.</p>
                <br></br><input type="password" class="accesscode" onChange={(event) => {password = event.target.value}}></input>
                <button onClick={() => {props.RequestFiles(props.FilmData, password)}} class="submitaccesscode">Submit</button>
            </div>
        </>
    )
}

export function Loading()
{
    return (<p class="cs"><b>Loading...</b></p>)
}