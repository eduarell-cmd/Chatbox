async function enviarMensaje() {
  const input = document.getElementById('mensaje');
  const mensaje = input.value.trim();

  if (!mensaje) {
    document.getElementById('respuesta').innerText = "Te voy a pegar si vuelves a mandar algo vacío";
    return;
  }

  // Mostrar el mensaje del usuario en el chat
  agregarMensaje(mensaje, 'usuario');
  input.value = '';

  try {
    const res = await fetch('/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mensaje })
    });

    const data = await res.json();
    const respuesta = data.respuesta || "Lo siento, no encontré coincidencias con tu búsqueda.";
    agregarMensaje(respuesta, 'bot');
  } catch (error) {
    agregarMensaje("Hubo un error al conectarse con el bot.", 'bot');
  }
}

function agregarMensaje(texto, tipo) {
  const chat = document.getElementById('chat');
  const burbuja = document.createElement('div');
  burbuja.classList.add(tipo === 'usuario' ? 'mensaje-usuario' : 'mensaje-bot');
  burbuja.textContent = texto;
  chat.appendChild(burbuja);
  chat.scrollTop = chat.scrollHeight;
}

window.onload = async () => {
  try {
    const res = await fetch('/historial');
    const historial = await res.json();

  historial.forEach(m => {
    if (m.mensaje) agregarMensaje(m.mensaje, 'usuario');
    if (m.respuesta) agregarMensaje(m.respuesta, 'bot');
  });

  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
  }
};
