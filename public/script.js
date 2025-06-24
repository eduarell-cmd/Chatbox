async function enviarMensaje() {
  const mensaje = document.getElementById('mensaje').value;

  const res = await fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mensaje }) 
  });

  const data = await res.json();
  document.getElementById('respuesta').innerText = data.respuesta;
}
