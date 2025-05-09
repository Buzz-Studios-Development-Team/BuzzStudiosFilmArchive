export default class Film
{
    #id = "";
    #title = "";
    #semester = "";
    #director = "";
    #stars = "";
    #synopsis = "";
    #access = "unavailable";
    #accessCode = "";
    #order = 0;
    #category = 0;
    #imdb = "";

    filmfile = "";
    thumbnail = "";
    scriptfile = "";
    captionsfile = "";
    cast = {};
    seasons = ['Spring', 'Summer', 'Fall', 'Winter']
    languages = [];

    setID(newID) {
        if (this.checkEmpty(newID) && this.checkLength(newID, 1, 200)) {
            this.id = newID;
            return true;
        }
        return false;
    }

    getID() {
        return this.id;
    }

    setTitle(newTitle) {
        if (this.checkEmpty(newTitle) && this.checkLength(newTitle, 1, 200)) {
            this.title = newTitle;
            return true;
        }
        return false;
    } 

    getTitle() {
        return this.title;
    }

    setSemester(newSemester) {
        if (this.checkEmpty(newSemester) && this.checkDate(newSemester)) {
            this.semester = newSemester;
            return true;
        }
        return false;
    }

    getSemester() {
        return this.semester;
    }

    setDirector(newDirector) {
        if (this.checkEmpty(newDirector) && this.checkLength(newDirector, 1, 100)) {
            this.director = newDirector;
            return true;
        }
        return false;
    }

    getDirector() {
        return this.director;
    }

    setStars(newStars) {
        if (this.checkEmpty(newStars) && this.checkLength(newStars, 1, 1000)) {
            this.stars = newStars;
            return true;
        }
        return false;
    }

    getStars() {
        return this.stars;
    }

    setSynopsis(newSynopsis) {
        if (this.checkEmpty(newSynopsis) && this.checkLength(newSynopsis, 1, 2000)) {
            this.synopsis = newSynopsis;
            return true;
        }
        return false;
    }

    getSynopsis() {
        return this.synopsis;
    }

    setAccess(newAccess) {
        if (this.checkEmpty(newAccess)) {
            this.access = newAccess;
            return true;
        }
        return false;
    }

    getAccess() {
        return this.access;
    }

    setAccessCode(newAccessCode) {
        if (this.checkEmpty(newAccessCode) && this.checkLength(newAccessCode, 1, 100)) {
            this.accessCode = newAccessCode;
            return true;
        }
        return false;
    }

    getAccessCode() {
        return this.accessCode;
    }

    setOrder(newOrder) {
        if (this.checkEmpty(newOrder) && !isNaN(newOrder)) {
            this.order = newOrder;
            return true;
        }
        return false;
    }

    getOrder() {
        return this.order;
    }

    setCategory(newCategory) {
        if (!isNaN(newCategory) && newCategory >= 0 && newCategory <= 2) {
            this.category = newCategory;
            return true;
        }
        return false;
    }

    getCategory() {
        return this.category;
    }

    setIMDB(newIMDB) {
        //Note: Need to allow empty fields since most films will not have an IMDB page
        if (newIMDB == undefined) {
            return false;
        }
        if (this.checkLength(newIMDB, 0, 300)) {
            this.imdb = newIMDB;
            return true;
        }
        return false;
    }

    getIMDB() {
        return this.imdb;
    }

    checkNull(input) {
        if (input != null) {
            return true;
        } else {
            return false;
        }
    }
    
    checkEmpty(input) {
        if (this.checkNull(input) && input != '') {
            return true;
        } else {
            return false;
        }
    }

    checkLength(input, min, max) {
        if (input.length >= min && input.length <= max) {
            return true;
        } else {
            return false;
        }
    }

    checkDate(input) {
        if (input === 'Date Unknown' || input === 'Do Not Show') {
            return true;
        } else if (input.split(" ").length > 1){
            var split_input = input.split(" ")
            if (this.seasons.includes(split_input[0]) && this.checkIfFourDigitNumber(split_input[1])) {
                return true;
            }
        } else { return false; }
    }

    checkIfFourDigitNumber(input) {
        return /^\d{4}$/.test(input);
    }
}