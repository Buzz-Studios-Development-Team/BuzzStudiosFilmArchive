import { Dialog, DialogContent, DialogTitle, DialogContentText } from "@mui/material"

export default function ErrorDialog(props)
{
    <>
        <Dialog
            open={props.errorDialog}
            onClose={() => window.close()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle style={{backgroundColor: "#222222"}} id="alert-dialog-title">
                Authentication Failed
            </DialogTitle>
            <DialogContent style={{backgroundColor: "#222222", width: 400}}>
            <DialogContentText id="alert-dialog-description" style={{color: "white", textAlign: "center"}}>
                Your session may have expired, or you have used an invalid URL. Please request a new login link.
            </DialogContentText>
            </DialogContent>
        </Dialog>
    </>
}