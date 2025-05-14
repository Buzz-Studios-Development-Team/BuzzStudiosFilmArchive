import React, { useEffect } from 'react';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";

// Additional tool imports
import ErrorDialog from '../tools/ErrorDialog';
import BuzzHeader from '../homepage/BuzzHeader';
import AdminControls from './AdminControls';

import {formLogObject, publishLog} from '../logger/Logger.js';

export default class AdminPage extends React.Component {
    constructor(props) {
        super(props);

        const firebaseConfig = {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
            measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
          };

        this.state = {
            firebaseConfig: firebaseConfig
        };
    }
    
    componentDidMount() {

        // Retrieve firebase app and auth details
        const app = initializeApp(this.state.firebaseConfig);
        const auth = getAuth(app);

        // Set the current state to reflect app and auth objects
        this.setState({App: app});
        this.setState({Auth: auth.currentUser});

        // Error already caught?
        var already = false;

        let email = window.localStorage.getItem('emailForSignIn');

        // This should be the only form of authentication used.
        if (isSignInWithEmailLink(auth, window.location.href)) {

            // Attempt to authenticate using the URL, which contains the keys needed.
            signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                publishLog(formLogObject(email, "None", `Authenticated one-time link for ${email} successfully`, "Success"));

                // If successful, clear out the user's email address and retrieve the films
                window.localStorage.removeItem('emailForSignIn');
                this.RetrieveFilms(auth.currentUser.email);
                this.setState({Email: auth.currentUser.email});
            })
            .catch((error) => {
                var log = formLogObject(email !== null ? email : "null", "None", `Failed to authenticate one-time link for ${email}`, `Failure: ${error}`);
                publishLog(log);

                // If there's been an error, bring up the error dialog and force the user to close out
                if (!already) {
                    already = true;
                    this.setState({errorDialog: true})
                }
            });
        }
    }   

    // Retrieves all of the film records
    RetrieveFilms(user) {
    
        var filmsCollection = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION;
        var actorsCollection =  process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_ACTORS_SANDBOX : process.env.REACT_APP_ACTORS_COLLECTION;
        var usersCollection = process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_USERS_SANDBOX : process.env.REACT_APP_USERS_COLLECTION;

        const fetch = async () => {
            var db = getFirestore();
            console.log(user);

            // Query the users collection to see if the user is an officer or otherwise authorized to make edits. 
            // In current usage, this should be the only use case.

            try {
                var getStatus = query(collection(db, usersCollection), where("email", "==", user));
                var status = await getDocs(getStatus);
                var exec = false;

                // Once the matching users have been queried, open the matching one.
                status.forEach((doc) => {

                    // Indicate whether the user has been given exec privileges.
                    var info = doc.data();
                    this.setState({Exec: info.role});
                    this.setState({Name: info.name});

                    // Set the current user as part of the state.
                    this.setState({User: info.role});
                });

                publishLog(formLogObject(this.state.Email, this.state.Name, `Retrieved user information to verify access status`, "Success"));
            }
            catch (error) {
                publishLog(formLogObject(this.state.Email, this.state.Name, `Failed to retrieve user information to verify access status`, `Failure: ${error}`));
            }

            try {
                var filmArray = [];

                // Retrieve the collection of film records
                var docRef = collection(db, filmsCollection);
                var films = await getDocs(docRef);

                films.forEach((doc) => {
                    // For each film, associate its ID and add to array
                    var film = doc.data();
                    film.id = doc.id;
                    filmArray.push(film);
                });

                // Set the current state with the completed list of films with IDs added
                this.setState({Films: filmArray});
                publishLog(formLogObject(this.state.Email, this.state.Name, `Retrieved films from collection ${filmsCollection}`, "Success"));
            }
            catch (error) {
                publishLog(formLogObject(this.state.Email, this.state.Name, `Failed to retrieve films from collection ${filmsCollection}`, `Failure: ${error}`));
            }
        }

        fetch();
    }

    render() {
        return (
            <>
                <BuzzHeader/>
                <ErrorDialog errorDialog={this.state.errorDialog}/>
                <AdminControls 
                    Exec={this.state.Exec}
                    Name={this.state.Name}
                    Films={this.state.Films} 
                    User={this.state.User} 
                    Email={this.state.Email}
                    Requests={this.state.Requests} 
                    Sandbox={process.env.REACT_APP_USERS_SANDBOX === "true"}
                    FilmsCollection={process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_FILMS_SANDBOX : process.env.REACT_APP_FILMS_COLLECTION}
                    ActorsCollection={process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_ACTORS_SANDBOX : process.env.REACT_APP_ACTORS_COLLECTION}
                    UsersCollection={process.env.REACT_APP_USE_SANDBOX === "true" ? process.env.REACT_APP_USERS_SANDBOX : process.env.REACT_APP_USERS_COLLECTION}
                    Refresh={() => this.RetrieveFilms(this.state.Email)}
                />
            </>
        );
    }
};