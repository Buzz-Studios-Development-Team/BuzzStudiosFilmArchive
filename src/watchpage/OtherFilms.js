import Film from "../tools/misc/Film"

export function OtherFilms(props)
{
    return (
        <>
            {(props.OtherFilms.length > 0 && props.FilmData.director != "N/A" && !props.FilmData.bonus) && <div style={{marginTop: "0px"}} className="watch-page">
            <main>
            <div className="semester"  key={-1}>
            <h2>{props.DirectorCount == 1 ? "Other Films By This Director" : "Other Films By These Directors"}</h2>
            <div className="films" >
                <div className="film-row" style={{display: "flex", alignItems: "center", flexDirection: "column", flexFlow: "wrap", justifyContent: "center"}} key={0}>
                {props.OtherFilms.map(film => (
                    <Film film={film}/>
                ))}
                </div>
            </div>
            </div>
            </main>
        </div>}
        </>
    )
}