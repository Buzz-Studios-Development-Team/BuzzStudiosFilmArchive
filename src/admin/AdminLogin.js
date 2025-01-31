import React from 'react';
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { Card, CardContent, Button, TextField } from "@mui/material";

import BuzzHeader from '../homepage/BuzzHeader';

const AdminLogin = () => {
    const [email, setEmail] = React.useState("");

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

    const actionCodeSettings = {
    url: 'https://films.buzzstudios.org/myfilms',
    //url: 'http://localhost:3000/myfilms',
    handleCodeInApp: true,
    };

    const confirmEmail = () => {
        if (email !== undefined && email.trim() != "")
        {
            sendEmailLink(email);
        }
        else
        {
            alert("Email cannot be empty.");
        }
    }

    const sendEmailLink = (email) => {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            alert("Please check your email for a sign-in link.");
            window.close();
        })
        .catch((error) => {
            const errorMessage = error.message;
            if (errorMessage.includes("invalid-email")) {
                alert("Invalid email address.")
            }
        });
    };

    return (
        <>
            <BuzzHeader/>
            <br></br>
            <Card variant="outlined" sx={{width: 500, margin: "0 auto"}}>
                <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 25, margin: 0, fontFamily: "Lucida Sans"}}>Admin Login</p>
                    <TextField value={email} onChange={(event) => {setEmail(event.target.value);}} id="outlined-basic" label="Email" variant="outlined" sx={{width: 350, margin: 1}} /> 
                    <Button onClick={confirmEmail} variant="contained" style={{backgroundColor: "#333333", color: "white", fontSize: 20, marginTop: 10, fontFamily: ["Calibri", "Arial"]}}>send login link</Button>
                </CardContent>
            </Card>
        </>
    );
}

export default AdminLogin;