import { Link } from "react-router-dom";

export default function Film(props) {
    return (
      <div className="film" style={{margin: props.condensed ? "-20px" : "0px"}} key={props.film.id}>
        <Link to={`/${props.film.id}`}>
          <img src={`https://firebasestorage.googleapis.com/v0/b/buzz-studios-7f814.appspot.com/o/` + (process.env.REACT_APP_USE_SANDBOX === "true" ? "sandbox%2F" : "") + props.film.thumbnail + `?alt=media`} />
          <div className="overlay">
            {
              (props.film.title.includes(":") && <h3>{props.film.title.split(":")[0] + ":"}<br></br>{props.film.title.split(":")[1]}</h3>) || !props.film.title.includes(":") && <h3>{props.film.title}</h3>
            }
            {
              props.film.independent && <p className="independent-icon"><strong>SELF-GUIDED</strong></p>
            }
            {
              props.film.bonus && <p className="bonus-icon"><strong>BONUS</strong></p>
            }
            {
              props.film.access == "preprod" && <p className="status-icon" style={{marginTop: props.film.independent || props.film.bonus ? -10 : -18 }}><strong>PRE-PRODUCTION</strong></p>
            }
            {
              props.film.access == "prod" && <p className="status-icon" style={{marginTop: props.film.independent || props.film.bonus ? -10 : -18 }}><strong>PRODUCTION</strong></p>
            }
            {
              props.film.access == "postprod" && <p className="status-icon" style={{marginTop: props.film.independent || props.film.bonus ? -10 : -18 }}><strong>POST-PRODUCTION</strong></p>
            }
            {
              props.film.access == "restricted" && <p className="restricted-icon" style={{marginTop: props.film.independent || props.film.bonus ? -10 : -18 }}><strong>RESTRICTED</strong></p>
            }
            {
              props.film.captions && props.film.captions !== "" && <p className="cc-icon" style={{marginTop: props.film.independent || props.film.bonus ? -10 : -18 }}><strong>CC</strong></p>
            }
            {
              props.film.message && <p className="subtitle">{props.film.message}</p>
            }
          </div>
        </Link>
      </div>
    )
  }