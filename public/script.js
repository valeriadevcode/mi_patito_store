// Cargar patitos al cargar la página
window.onload = fetchPatitos;

async function fetchPatitos() {
    const response = await fetch('/patitos');
    const patitos = await response.json();

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar los nuevos datos

    // Filtrar los patitos que no están marcados como borrados
    const patitosActivos = patitos.filter(patito => !patito.borrado);

    patitosActivos.forEach(patito => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patito.id}</td>
            <td>${patito.color}</td>
            <td>${patito.tamano}</td>
            <td>${patito.precio}</td>
            <td>${patito.cantidad}</td>
            <td>
                <button onclick="editPatito(${patito.id})">Editar</button>
                <button onclick="deletePatito(${patito.id})">Borrar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para agregar o actualizar un patito
async function addPatito() {
    const color = document.getElementById('color').value;
    const tamano = document.getElementById('tamano').value;
    const precio = document.getElementById('precio').value;
    const cantidad = document.getElementById('cantidad').value;

    // Asegúrate de que todos los campos estén llenos
    if (!precio || !cantidad) {
        alert('Por favor, llena todos los campos necesarios.');
        return;
    }

    // Obtener el ID del patito si estamos actualizando
    const patitoId = document.getElementById('actionButton').getAttribute('data-id');

    let response;
    if (patitoId) {
        // Actualizar el patito existente
        response = await fetch(`/patitos/${patitoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ precio, cantidad }),
        });
    } else {
        // Agregar un nuevo patito
        response = await fetch('/patitos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ color, tamano, precio, cantidad }),
        });
    }

    if (response.ok) {
        // Limpiar los campos del formulario
        clearForm();

        // Actualizar la tabla
        fetchPatitos(); // Llama a la función para obtener y mostrar los patitos
    } else {
        alert('Error al procesar la solicitud.');
    }
}

// Función para cargar los datos del patito a editar
function editPatito(id) {
    fetch(`/patitos/${id}`)
        .then(response => response.json())
        .then(patito => {
            document.getElementById('color').value = patito.color;
            document.getElementById('tamano').value = patito.tamano;
            document.getElementById('precio').value = patito.precio;
            document.getElementById('cantidad').value = patito.cantidad;

            const button = document.getElementById('actionButton');
            button.innerText = 'Actualizar';
            button.setAttribute('data-id', id);
        })
        .catch(error => console.error('Error al obtener el patito:', error));
}

// Función para limpiar el formulario
function clearForm() {
    document.getElementById('color').value = '';
    document.getElementById('tamano').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('cantidad').value = '';

    const button = document.getElementById('actionButton');
    button.innerText = 'Agregar';
    button.removeAttribute('data-id');
}

// Función para eliminar un patito
async function deletePatito(id) {
    const confirmation = confirm("¿Estás seguro de que deseas borrar este patito?");
    if (confirmation) {
        const response = await fetch(`/patitos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchPatitos(); // Actualiza la lista después de eliminar
        } else {
            alert('Error al eliminar el patito.');
        }
    }
}
