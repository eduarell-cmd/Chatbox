async function enviarMensaje() {
  const mensaje = document.getElementById('mensaje').value.trim();

  if(!mensaje){
  document.getElementById('respuesta').innerText = "Te voy a pegar si vuelves a mandar algo vacio";
  return;
  };
  const res = await fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mensaje }) 
  });

  const data = await res.json();
  document.getElementById('respuesta').innerText = data.respuesta || "Lo siento, no encontre coincidencias con tu busqueda";
}
