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
    #indep = false;
    #bonus = false;

    filmfile = "";
    thumbnail = "";
    scriptfile = "";
    captionsfile = "";
    cast = {};

    setID(newID) {
        this.id = newID;
    }

    getID() {
        return this.id;
    }

    setTitle(newTitle) {
        this.title = newTitle;
    } 

    getTitle() {
        return this.title;
    }

    setSemester(newSemester) {
        this.semester = newSemester;
    }

    getSemester() {
        return this.semester;
    }

    setDirector(newDirector) {
        this.director = newDirector;
    }

    getDirector() {
        return this.director;
    }

    setStars(newStars) {
        this.stars = newStars;
    }

    getStars() {
        return this.stars;
    }

    setSynopsis(newSynopsis) {
        this.synopsis = newSynopsis;
    }

    getSynopsis() {
        return this.synopsis;
    }

    setAccess(newAccess) {
        this.access = newAccess;
    }

    getAccess() {
        return this.access;
    }

    setAccessCode(newAccessCode) {
        this.accessCode = newAccessCode;
    }

    getAccessCode() {
        return this.accessCode;
    }

    setOrder(newOrder) {
        this.order = newOrder;
    }

    getOrder() {
        return this.order;
    }

    setIndep(newIndep) {
        this.indep = newIndep;
    }

    getIndep() {
        return this.indep;
    }

    setBonus(newBonus) {
        this.bonus = newBonus;
    }

    getBonus() {
        return this.bonus;
    }
}