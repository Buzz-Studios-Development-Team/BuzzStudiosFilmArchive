import React, { useEffect } from 'react';
import { Card, CardContent, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, Select, MenuItem, LinearProgress, InputLabel, FormControl } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, getDocs, collection, query, where, setDoc, deleteDoc } from "firebase/firestore";
import {TableContainer} from '@mui/material';
import {TableRow} from '@mui/material';
import {TableCell} from '@mui/material';
import {Table} from '@mui/material';

const UserManager = (props) => {

    const [users, setUsers] = React.useState([]);
    const [addState, setAddState] = React.useState(0);

    const [userNameField, setUserNameField] = React.useState("");
    const [userEmailField, setUserEmailField] = React.useState("");
    const [userRole, setUserRole] = React.useState("curator");

    const RetrieveUsers = () => {
        const userList = [];

        const fetch = async () => {
            var db = getFirestore();

            try {
                var getStatus = query(collection(db, "users"));
                var status = await getDocs(getStatus)

                status.forEach((doc) => {
                    var info = doc.data();
                    info.id = doc.id;
                    userList.push(info);
                });

                setUsers(userList);

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Successfully requested content of collection users`, 
                    `Success`));
            } catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Requesting content of collection users failed`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
        }

        fetch();
    }

    const handleChange = (event) => {
        setUserRole(event.target.value);
    };

    React.useEffect(() => {
        RetrieveUsers();
    }, []);

    const confirm = () => {
        if (props.Exec === "exec" && userRole === "admin") {
            alert("Execs cannot grant admin access.");
            cancel();
            return;
        }
        if (props.Exec === "exec" && userRole === "exec") {
            alert("Execs cannot grant exec access.");
            cancel();
            return;
        }
        if (props.Exec === "curator") {
            alert("Curators may not create new users.");
            cancel();
            return;
        }

        const send = async () => {
            try {
                var db = getFirestore();
                const usersRef = collection(db, "users");

                var obj = {
                    "name": userNameField,
                    "email": userEmailField,
                    "role": userRole
                }

                await setDoc(doc(usersRef, userEmailField), obj);

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Set user document with content ${JSON.stringify(obj)}`, 
                    `Success`));
            } 
            catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Setting user document with content ${JSON.stringify(obj)} failed`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
            
        }
        send();

        RetrieveUsers();
        cancel();
    };

    const deleteUser = (target) => {
        const send = async () => {
            try {
                var db = getFirestore();
                const usersRef = collection(db, "users");
                await deleteDoc(doc(usersRef, target.email));

                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Deletion of user with id ${target.email} succeeded`, 
                    `Success`));
            } 
            catch (error) {
                publishLog(formLogObject(props.Email, 
                    props.Name, 
                    `Deletion of user with id ${target.email} failed`, 
                    `Failure: ${error.message}\n\nStack: ${error.trace}`));
            }
        }
        send();

        setUsers([]);
        RetrieveUsers();
    };

    const cancel = () => {
        setUserNameField("");
        setUserEmailField("");
        setUserRole("curator");
        setAddState(0);
    };

    return (
        <>
            <Card variant="outlined" sx={{width: 750, margin: "0 auto"}}>
                {addState == 0 && <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>Authorized Users</p>

                    <TableContainer>
                        <Table sx={{minWidth: 400}}>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>   
                                <TableCell><strong>Email Address</strong></TableCell>   
                                <TableCell><strong>Role</strong></TableCell>   
                                {(props.Exec === "admin" || props.Exec === "exec") && <TableCell align="center"><strong>Delete</strong></TableCell>}
                            </TableRow>    

                            {users.map((user) => {
                                return (
                                    <>
                                        <TableRow>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            {(props.Exec === "admin" || props.Exec === "exec") && <TableCell align="center">{
                                                user.name !== props.Name && 
                                                (props.Exec === "admin" ||
                                                props.Exec === "exec" && user.role === "curator") &&
                                                <Button onClick={() => {deleteUser(user)}}>DELETE</Button>}</TableCell>}
                                        </TableRow>
                                    </>
                                );
                            })}
                        </Table>
                    </TableContainer>
                    <Button onClick={() => {setAddState(1)}} variant="contained" style={{fontSize: 15, marginTop: 10}}>Add New User</Button>
                </CardContent>}

                {addState == 1 && <CardContent style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                    <p style={{color: "black", fontSize: 20, margin: 10, fontFamily: "Lucida Sans"}}>Add New User</p>
                    
                    <TextField value={userNameField} onChange={(event) => {setUserNameField(event.target.value);}} id="outlined-basic" label="User's Name" variant="outlined" sx={{width: 300, margin: 0.75}} />
                    <TextField value={userEmailField} onChange={(event) => {setUserEmailField(event.target.value);}} id="outlined-basic" label="User's Email" variant="outlined" sx={{width: 300, margin: 0.75}} />
                    
                    <FormControl style={{width: 300, marginTop: 10}}>
                        <InputLabel id="demo-simple-select-label">Role</InputLabel>
                        <Select
                            labelId="select-existing-film"
                            id="select-film-id"
                            value={userRole}
                            label="User Role"
                            onChange={handleChange}>
                                
                            <MenuItem value="admin">Administrator</MenuItem>
                            <MenuItem value="exec">Exec Team</MenuItem>
                            <MenuItem value="curator">Curator</MenuItem>
                        </Select>
                    </FormControl>

                    <div style={{display: "flex", gap: 10}}>
                        <Button onClick={() => {confirm()}} variant="contained" style={{fontSize: 15, marginTop: 10}}>Confirm</Button>
                        <Button onClick={() => {cancel()}} variant="contained" style={{fontSize: 15, marginTop: 10}}>Cancel</Button>
                    </div>

                </CardContent>}
            </Card>
        </>
    )
}

export default UserManager;