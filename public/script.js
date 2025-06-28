let currentChatId = null;
let chatHistory = [];

// Your existing functions with modifications
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
    
    // Reload chat history after sending message
    loadChatHistory();
    
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

// Modified window.onload to include new functionality
window.onload = async () => {
  console.log('Página cargada, iniciando...');
  
  // Load initial historial (your existing logic) - try different endpoints
  const endpoints = ['/messages', '/api/messages', '/historial'];
  let historial = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Intentando cargar desde: ${endpoint}`);
      const res = await fetch(endpoint);
      if (res.ok) {
        historial = await res.json();
        console.log(`Historial cargado desde ${endpoint}:`, historial);
        break;
      }
    } catch (error) {
      console.log(`Error en ${endpoint}:`, error.message);
    }
  }
  
  if (historial.length > 0) {
    historial.forEach(m => {
      if (m.mensaje) agregarMensaje(m.mensaje, 'usuario');
      if (m.respuesta) agregarMensaje(m.respuesta, 'bot');
    });
    
    // Use the same data for chat history
    chatHistory = historial;
    renderHistoryList();
  } else {
    console.error("No se pudo cargar historial desde ningún endpoint");
  }
  
  // Setup toggle button regardless of data loading
  setupToggleButton();
};

// New functions for chat history functionality
function setupToggleButton() {
  const toggleBtn = document.getElementById('toggle-history');
  const sidebar = document.getElementById('history-sidebar');
  
  console.log('Toggle button:', toggleBtn);
  console.log('Sidebar:', sidebar);
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      console.log('Toggle clicked');
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  } else {
    console.error('No se encontraron elementos del sidebar');
  }
}

async function loadChatHistory() {
  const endpoints = ['/messages', '/api/messages', '/historial'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Intentando cargar historial desde: ${endpoint}`);
      const response = await fetch(endpoint);
      if (response.ok) {
        chatHistory = await response.json();
        console.log(`Historial cargado desde ${endpoint}:`, chatHistory);
        renderHistoryList();
        return; // Exit if successful
      }
    } catch (error) {
      console.log(`Error en ${endpoint}:`, error.message);
    }
  }
  
  // If none worked, show error
  console.error('No se pudo cargar desde ningún endpoint');
  const historyList = document.getElementById('history-list');
  if (historyList) {
    historyList.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px; color: #ff6b6b;">Sin conexión al servidor</div>';
  }
}

function renderHistoryList() {
  const historyList = document.getElementById('history-list');
  console.log('Elemento history-list encontrado:', historyList);
  console.log('Datos del historial:', chatHistory);
  
  if (!historyList) {
    console.error('No se encontró el elemento history-list');
    return;
  }
  
  historyList.innerHTML = '';

  if (chatHistory.length === 0) {
    console.log('No hay historial');
    historyList.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px; color: #ccc;">No hay historial aún</div>';
    return;
  }

  console.log('Renderizando', chatHistory.length, 'elementos');
  
  chatHistory.forEach((chat, index) => {
    console.log('Procesando chat:', chat);
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.onclick = () => loadChat(chat._id || chat.id || index);
    
    // Handle different date formats
    let formattedDate = 'Fecha desconocida';
    if (chat.fecha) {
      const date = new Date(chat.fecha);
      formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const mensajePreview = chat.mensaje ? chat.mensaje.substring(0, 50) : 'Sin mensaje';

    historyItem.innerHTML = `
      <div class="history-date">${formattedDate}</div>
      <div class="history-preview">${mensajePreview}${chat.mensaje && chat.mensaje.length > 50 ? '...' : ''}</div>
    `;

    historyList.appendChild(historyItem);
  });
}

async function loadChat(chatId) {
  try {
    // Remove active class from all items
    document.querySelectorAll('.history-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to clicked item
    event.target.closest('.history-item').classList.add('active');

    currentChatId = chatId;
    
    // Find the chat in the current history
    const chat = chatHistory.find(c => c._id === chatId || c.id === chatId);
    if (chat) {
      displayChatMessages(chat);
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('history-sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
  } catch (error) {
    console.error('Error loading chat:', error);
  }
}

function displayChatMessages(chat) {
  const chatDiv = document.getElementById('chat');
  chatDiv.innerHTML = '';

  // Display user message using your existing function
  agregarMensaje(chat.mensaje, 'usuario');
  
  // Display bot response using your existing function
  agregarMensaje(chat.respuesta, 'bot');
}

function startNewChat() {
  currentChatId = null;
  document.getElementById('chat').innerHTML = '';
  document.querySelectorAll('.history-item').forEach(item => {
    item.classList.remove('active');
  });
}