async function enviarMensaje() {
  const input = document.getElementById('mensaje');
  const mensaje = input.value.trim();

  if (!mensaje) {
    alert("Te voy a pegar si vuelves a mandar algo vacío");
    return;
  }

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
    agregarHistorialSidebar(mensaje, respuesta);

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

function agregarHistorialSidebar(pregunta, respuesta) {
  const listaHistorial = document.getElementById('lista-historial');
  const item = document.createElement('li');

  const fecha = new Date().toLocaleString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });

  item.innerHTML = `USER: ${pregunta}<br>MAI: ${respuesta}<br><small>${fecha}</small>`;
  listaHistorial.appendChild(item);
}

window.onload = async () => {
  // 🔄 Limpiar el chat y el historial lateral
  document.getElementById('chat').innerHTML = '';
  document.getElementById('lista-historial').innerHTML = '';

  try {
    const res = await fetch('/historial');
    const historial = await res.json();

    historial.forEach(m => {
      if (m.mensaje && m.respuesta && m.fecha) {
        const fecha = new Date(m.fecha).toLocaleString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        });

        const item = document.createElement('li');
        item.innerHTML = `USER: ${m.mensaje}<br>MAI: ${m.respuesta}<br><small>${fecha}</small>`;
        document.getElementById('lista-historial').appendChild(item);
      }
    });

  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
  }
};
