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

    filmfile = "";
    thumbnail = "";
    scriptfile = "";
    captionsfile = "";
    cast = {};
    seasons = ['Spring', 'Summer', 'Fall', 'Winter']


    setID(newID) {
        if (this.checkEmpty(newID) && this.checkLength(newID, 1, 200)) {
            this.id = newID;
        }
    }

    getID() {
        return this.id;
    }

    setTitle(newTitle) {
        if (this.checkEmpty(newTitle) && this.checkLength(newTitle, 1, 200)) {
            this.title = newTitle;
        }
    } 

    getTitle() {
        return this.title;
    }

    setSemester(newSemester) {
        if (this.checkDate(newSemester)) {
            this.semester = newSemester;
        }
    }

    getSemester() {
        return this.semester;
    }

    setDirector(newDirector) {
        if (this.checkEmpty(newDirector) && this.checkLength(newDirector, 1, 100)) {
            this.director = newDirector;
        }
    }

    getDirector() {
        return this.director;
    }

    setStars(newStars) {
        if (this.checkEmpty(newStars) && this.checkLength(newStars, 1, 1000)) {
            this.stars = newStars;
        }
    }

    getStars() {
        return this.stars;
    }

    setSynopsis(newSynopsis) {
        if (this.checkEmpty(newSynopsis) && this.checkLength(newSynopsis, 1, 2000)) {
            this.synopsis = newSynopsis;
        }
    }

    getSynopsis() {
        return this.synopsis;
    }

    setAccess(newAccess) {
        if (this.checkEmpty(newAccess)) {
            this.access = newAccess;
        }
    }

    getAccess() {
        return this.access;
    }

    setAccessCode(newAccessCode) {
        if (this.checkEmpty(newAccessCode) && this.checkLength(newAccessCode, 1, 100)) {
            this.accessCode = newAccessCode;
        }
    }

    getAccessCode() {
        return this.accessCode;
    }

    setOrder(newOrder) {
        if (this.checkEmpty(newOrder)) {
            this.order = newOrder;
        }
    }

    getOrder() {
        return this.order;
    }

    setCategory(newCategory) {
        if (this.checkEmpty(newCategory)) {
            this.category = newCategory;
        }
    }

    getCategory() {
        return this.category;
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
        if (input == 'Date Unknown' || 'Do Not Show') {
            return true;
        } else if (input.split(" ").length > 1){
            split_input = input.split(" ")
            if (this.seasons.contains(split_input[0]) && checkIfFourDigitNumber(split_input[1])) {
                return true;
            }
        } else { return false; }
    }

    checkIfFourDigitNumber(input) {
        return /^\d{4}$/.test(input);
    }
}