function orderSocket(socket) {
  console.log(`🧃 Socket conectado: ${socket.id}`);

  // Cliente entra em uma sala (cozinha, cliente, entregador)
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`🔐 Socket ${socket.id} entrou na sala: ${room}`);
  });

  // Cliente saiu
  socket.on("disconnect", () => {
    console.log(`🚪 Socket desconectado: ${socket.id}`);
  });
}

export default orderSocket;
