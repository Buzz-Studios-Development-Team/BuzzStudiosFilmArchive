import Film from "../tools/Film";

export function AssociatedFilms(props)
{
    return (
        <>
            {(props.FilmData.associated !== undefined && props.FilmData.associated.length > 0) && <div style={{marginTop: (props.OtherFilms.length > 0 && props.FilmData.director != "N/A" && !props.FilmData.bonus) ? "-40px" : "0px"}} className="watch-page">
                <main>
                <div className="semester"  key={-1}>
                <h2>Bonus Material</h2>
                <div className="films" >
                    <div className="film-row" style={{display: "flex", alignItems: "center", flexDirection: "column", flexFlow: "wrap", justifyContent: "center"}} key={0}>
                    {props.Associated.map(film => (
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