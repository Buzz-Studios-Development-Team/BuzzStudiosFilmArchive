import { signInAnonymously, getAuth } from "firebase/auth";
import { getStorage, ref, listAll } from "firebase/storage";

async function requestFile(film, auth, password="", script=false) {

    var response;
    if (!script) {
        response = await fetch(process.env.REACT_APP_REQUEST_FILM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "film": film,
                "code": password
            })
        });
    }
    else {
        response = await fetch(process.env.REACT_APP_REQUEST_FILM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "film": film,
                "code": password,
                "script": "true"
            })
        });
    }

    const data = await response.json();

    if (data.url != "403") {
        try {
            await signInAnonymously(auth)
            return {
                "url": data.url,
                "result": "approved"
            };
        } 
        catch(error) {
            return {
                "result": "failed"
            };
        }
    } 
    else {
        return {
            "result": "rejected"
        }
    }
}

export async function retrieveFilmFiles(filmData, password)
{
    var files = {};

    var filmFileResult = await requestFile(filmData.id, getAuth(), password, false);
    switch (filmFileResult["result"]) {
        case "approved":
            files["film_url"] = filmFileResult["url"];
            break;

        case "rejected":
            files["film_url"] = "403";
            break;

        case "failed":
            files["film_url"] = "500";
            break;
    }

    var scriptResult = await requestFile(filmData.id, getAuth(), "", true);
    if (filmData.script !== undefined && filmData.script !== "")
    {
        switch (scriptResult["result"]) {
            case "approved":
                files["script_url"] = scriptResult["url"];
                break;

            case "rejected":
                files["script_url"] = "403";
                break;

            case "failed":
                files["script_url"] = "500";
                break;
        }
    }

    if (filmData.captions !== undefined && filmData.captions !== "")
    {
        var captionTracks = await getCaptionFiles(filmData, password);
        files["captions"] = captionTracks;
    }

    console.log(files["captions"]);
    
    return files;
}

async function getCaptionFiles(filmData, password) {

    var languages = [{"language": "English", "code": "en"}];
    var iso = require('../tools/misc/iso_language_codes.json');
    
    for (var language in filmData.languages) {
        for (var i = 0; i < iso.length; i++) {
            if (iso[i].language === filmData.languages[language]) {
                languages.push(iso[i]);
            }
        }
    }

    const tracks = await Promise.all(
        languages.map(async (lang) => {
            var url = await requestFile(filmData.title, formCaptionFilename(filmData, lang.language), getAuth(), password);
            return {
                "url": url,
                "language": lang.language,
                "code": lang.code
            }
        })
    );

    return tracks;
}

function formCaptionFilename(filmData, language) 
{
    if (language === "English") {
        return filmData.captions;
    }
    else {
        return `translated-captions/${filmData.id}/${filmData.captions.substring(0, filmData.captions.length - 4)}/${language}.vtt`;
    }
}