import { signInAnonymously, getAuth } from "firebase/auth";
import { getStorage, ref, listAll } from "firebase/storage";

async function requestFile(title, filename, auth, password="") {

    const response = await fetch(process.env.REACT_APP_REQUEST_FILM_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "title": title,
            "film": (process.env.REACT_APP_USE_SANDBOX === "true" ? "sandbox/" : "") + filename,
            "code": password
        })
    });

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

    var filmFileResult = await requestFile(filmData.title, filmData.filmfile, getAuth(), password);
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

    if (filmData.script !== undefined && filmData.script !== "")
    {
        var scriptFileResult = await requestFile(filmData.title, filmData.script, getAuth(), password);
        switch (scriptFileResult["result"]) {
            case "approved":
                files["script_url"] = scriptFileResult["url"];
                break;

            case "rejected":
                files["script_url"] = "403";
                break;

            case "failed":
                files["script_url"] = "500";
                break;
        }
    }
    else
    {
        files["script_url"] = "none";
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
    const storage = getStorage();
    const listRef = ref(storage, "translated-captions/");

    var languages = [{"language": "English", "code": "en"}];
    const res = await listAll(listRef)

    res.items.forEach((itemRef) => {
        var path = itemRef._location.path_;
        if (path.includes(filmData.captions.substring(0, filmData.captions.length - 11)))
        {
            var match = path.match(/-(\w+)\.vtt$/);
            if (match) {
                var iso = require('../tools/iso_language_codes.json');
                for (var i = 0; i < iso.length; i++) {
                    if (iso[i].language === match[1]) {
                        languages.push(iso[i]);
                    }
                }
            }
        }
    });

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
    var prefix = (language === "English" ? "" : "translated-captions/");
    var url = language === "English" ? filmData.captions : prefix + filmData.captions.substring(0, filmData.captions.length - 11) + language + ".vtt";
    return url;
}

export function splitNames(nameList) {
    let names = nameList.split(',');
    
    let finalNames = [];
    
    names.forEach(name => {
        if (name.includes(' and ')) {
            finalNames.push(...name.split(' and ').map(n => n.trim()));
        } else {
            finalNames.push(name.trim());
        }
    });
    
    return finalNames;
}