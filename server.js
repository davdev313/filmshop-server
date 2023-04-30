/**
 * @author Davide Musarra <davide.musarra@studenti.unime.it>
 */

// import di librerie e file di configurazione
import express from "express";
import mysql from "mysql";
import cors from "cors";
import config from "./utils/config.json" assert { type: "json" };
import { QUERY } from "./utils/queries.js";

const app = express();	// associo all'oggetto app il middleware express

// la funzione use() viene eseguita ongi volta che l'app riceve una richiesta HTTP
app.use(express.json());
app.use(cors());

// stabilisco una connessione col db
const db = mysql.createPool(config); // creo un pool di connessioni al db che possono essere utilizzate al bisogno

// DB CONNECTION
db.getConnection((err, conn) => {
	if (err) throw err;
	console.log("***\tConnected to DB!\t***\n\n");
	conn.release();
});

// PORT SETTING
app.listen(4000, () => {
	console.log("***\tConnected to server!\t***");
});

// GET METHODS - gestite ogniqualvolta l'app riceve una richiesta HTTP di tipo GET
app.get("/", (req, res) => {
	res.json("Ciao, sono Server!");	// res.json(param) ritorna una Promise che si risolve in un JSON
});

// ottengo tutti i rullini
app.get("/api/films", (req, res) => {
	console.log(`getting films...`);
	// eseguo la query e per ogni elemento dell'array data codifico il file jpg, una stringa binaria, in una stringa base64
	db.query(QUERY.GET_ALL_FILMS, (err, data) => {
		data?.forEach((el) => {
			const pathBase64 = "data:image/jpg;base64,";
			const imgBase64 = btoa(
				String.fromCharCode(...new Uint8Array(el.ImageUrl))
			);
			el.ImageUrl = pathBase64 + imgBase64;
		});
		return res.json(err ? err : data);
	});
});

// ottengo contenuto del carrello
app.get("/api/cart", (req, res) => {
	console.log(`getting cart...`);
	db.query(QUERY.GET_CART, (err, data) => {
		return res.json(err ? err : data);
	});
});
// GET METHODS

// POST METHODS - gestite ogniqualvolta l'app riceve una richiesta HTTP di tipo POST
// Aggiungo rullino al carrello
app.post("/api/filmToCart", (req, res) => {
	// destructuring dell'oggetto
	const bulkValues = req.body.map((values) => [
		values.FilmId,
		values.FilmName,
		values.Quantity,
		values.Price,
	]);
	console.log(`inserting film ${bulkValues}...`);
	// eseguo una bulk api che mi permette di passare più valori sottoforma di un array
	db.query(QUERY.FILM_TO_CART, [bulkValues], (err, data) => {
		return res.json(err ? err : data);
	});
});
// POST METHODS

// PUT METHODS - gestite ogniqualvolta l'app riceve una richiesta HTTP di tipo PUT
// Quando aggiungo/rimuovo rullino al/dal carrello aggiorno la tabella dei rullini
app.put("/api/updateFilm", (req, res) => {
	let isArray = Array.isArray(req.body);	// controllo se il corpo della richiesta è un array
	if (!isArray) {	// se non lo è, gestisco il caso di update singolo
		const { FilmId, Quantity } = req.body; // destructuring dell'oggetto
		console.log(`updating film ${FilmId} - ${Quantity}...`);
		db.query(QUERY.UPD_FILM, [Quantity, FilmId], (err, data) => {
			console.log(err ? `err for film: ${err}` : `no error for film`);
			return res.json(err ? err : data);
		});
	} else {	// se lo è, gestisco il caso di update multiplo
		const bulkValues = req.body.map((values) => [
			values.FilmId,
			values.Quantity,
		]);
		console.log(`updating film ${bulkValues}...`);
		db.query(QUERY.UPD_FILM_BULK, [bulkValues], (err, data) => {
			console.log(err ? err : "no error");
			return res.json(err ? err : data);
		});
	}
});

// Quando aggiungo/tolgo rullini al/dal carrello aggiorno la tabella del carrello
app.put("/api/updateCart", (req, res) => {
	const { FilmId, Quantity } = req.body; // destructuring dell'oggetto
	console.log(`updating cart ${FilmId} - ${Quantity}...`);
	db.query(QUERY.UPD_CART, [Quantity, FilmId], (err, data) => {
		console.log(err ? `err for cart: ${err}` : `no error for cart`);
		return res.json(err ? err : data);
	});
});
// PUT METHODS

// DELETE METHODS - gestite ogniqualvolta l'app riceve una richiesta HTTP di tipo DELETE
// Quando rimuovo rullino dal carrello
app.delete("/api/removeFromCart", (req, res) => {
	const { FilmId } = req.body; // destructuring dell'oggetto
	console.log(`removing ${FilmId}...`);
	db.query(QUERY.RM_FROM_CART, [FilmId], (err, data) => {
		return res.json(err ? err : data);
	});
});

// Quando si svuota tutto il carrello
app.delete("/api/removeAllFromCart", (req, res) => {
	console.log(`removing all from cart...`);
	db.query(QUERY.RM_ALL_FROM_CART, (err, data) => {
		return res.json(err ? err : data);
	});
});
// DELETE METHODS
