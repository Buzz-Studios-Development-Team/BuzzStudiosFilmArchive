import { Button } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function CastTable(props) {
    return (
        <>
        <ThemeProvider theme={props.theme}>
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table" mode="dark">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell align="right"><strong>See More</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.filmData["cast-new"].map((row) => (
                  <TableRow
                    key={row.actor}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell size="small" component="th" scope="row">
                      {props.getActorName(row.actor)}
                    </TableCell>
                    <TableCell size="small" >{row.role}</TableCell>
                    <TableCell size="small" variant="contained" align="right"><Button onClick={() => {window.location.href = "/?actor=" + row.actor + "&name=" + props.getActorName(row.actor)}}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </ThemeProvider>
        </>
    )
}