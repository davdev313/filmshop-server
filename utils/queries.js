export const QUERY = {
	GET_ALL_FILMS: "SELECT * FROM film WHERE Id != ''",
	GET_CART: "SELECT * FROM cart WHERE Id != ''",
	FILM_TO_CART:
		"INSERT IGNORE INTO cart (FilmId, FilmName, Quantity, Price) VALUES ?",
	UPD_FILM: "UPDATE film SET Quantity = ? WHERE Id = ?",
	UPD_FILM_BULK:
		"INSERT INTO film (Id, Quantity) VALUES ? ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity)",
	UPD_CART: "UPDATE cart SET Quantity = ? WHERE FilmId = ?",
	RM_FROM_CART: "DELETE FROM cart WHERE FilmId = ?",
	RM_ALL_FROM_CART: "DELETE FROM cart",
};
