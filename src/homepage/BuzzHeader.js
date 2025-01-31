import { Link } from "react-router-dom";
import logo from '../images/default-img.png';

export default function BuzzHeader() {
    return (
      <div className="header">
          <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
            <Link to="/">
              <img src={logo} alt="Buzz Studios Filmmaking Club" />
            </Link>
            </div>
        </div>
    )
  };  