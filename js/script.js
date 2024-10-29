let db;

document.addEventListener('DOMContentLoaded', () => {
    initDB();
    document.getElementById('add-client').addEventListener('click', addClient);
    loadClients();
});

function initDB() {
    const request = indexedDB.open('CRM', 1);
    
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        const store = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
    };

    request.onsuccess = (e) => {
        db = e.target.result;
    };

    request.onerror = (e) => {
        console.error('Error al abrir la base de datos', e);
    };
}

function validateField(field) {
    if (field.value.trim() === '') {
        field.classList.add('error');
    } else {
        field.classList.remove('error');
    }
    checkFormValidity();
}

function checkFormValidity() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    document.getElementById('add-client').disabled = !(name && email && phone);
}

function addClient() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.add({ name, email, phone });

    request.onsuccess = () => {
        document.getElementById('client-form').reset();
        loadClients();
    };

    request.onerror = () => {
        console.error('Error al agregar cliente');
    };
}

function loadClients() {
    const transaction = db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');
    const request = store.getAll();

    request.onsuccess = (e) => {
        const clients = e.target.result;
        const clientsList = document.getElementById('clients');
        clientsList.innerHTML = '';

        clients.forEach(client => {
            const li = document.createElement('li');
            li.textContent = `${client.name} - ${client.email} - ${client.phone}`;

            const editButton = document.createElement('button');
            editButton.classList.add('edit');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editClient(client.id);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = () => deleteClient(client.id);

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            clientsList.appendChild(li);
        });
    };
}

function editClient(id) {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.get(id);

    request.onsuccess = (e) => {
        const client = e.target.result;
        document.getElementById('name').value = client.name;
        document.getElementById('email').value = client.email;
        document.getElementById('phone').value = client.phone;
        deleteClient(id);
    };
}

function deleteClient(id) {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    store.delete(id);
    loadClients();
}
