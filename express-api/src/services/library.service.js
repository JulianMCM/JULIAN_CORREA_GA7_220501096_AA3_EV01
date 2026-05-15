async function getOrCreateLibrary(connection, userId) {
  // Reutiliza la biblioteca del usuario o crea una cuando compra por primera vez.
  const [libraries] = await connection.execute(
    'SELECT IdBiblioteca FROM Biblioteca WHERE IdUsuario = ?',
    [userId]
  );

  if (libraries.length > 0) {
    return Number(libraries[0].IdBiblioteca);
  }

  const [result] = await connection.execute(
    'INSERT INTO Biblioteca (IdUsuario) VALUES (?)',
    [userId]
  );

  return Number(result.insertId);
}

module.exports = {
  getOrCreateLibrary
};
