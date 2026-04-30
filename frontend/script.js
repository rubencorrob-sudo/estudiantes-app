const API = "https://estudiantes-api2.onrender.comm";
let emailGlobal = "";

// ---------- AUTH ----------

function sendOTP() {
    const email = document.getElementById("email").value;

    if (!email) {
        alert("Ingresa un correo");
        return;
    }

    const btn = document.querySelector("button");
    btn.innerText = "Enviando...";
    btn.disabled = true;

    fetch(`${API}/auth/send-otp?email=${email}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => {
        btn.innerText = "Enviar OTP";
        btn.disabled = false;

        document.getElementById("login").style.display = "none";
        document.getElementById("otp").style.display = "block";
    })
    .catch(() => {
        btn.innerText = "Enviar OTP";
        btn.disabled = false;
        alert("Error enviando OTP");
    });
}

function verifyOTP() {
    const otp = document.getElementById("otpInput").value;

    fetch(`${API}/auth/verify-otp?email=${emailGlobal}&otp=${otp}`, {
        method: "POST"
    })
    .then(res => {
        if (!res.ok) throw new Error();

        document.getElementById("otp").style.display = "none";
        document.getElementById("app").style.display = "block";

        loadStudents();
    })
    .catch(() => alert("OTP incorrecto"));
}

// ---------- STUDENTS ----------

function loadStudents() {
    fetch(`${API}/students`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("list");
            list.innerHTML = "";
            li.innerHTML = `
    ${s.nombre} - ${s.edad} - ${s.nota}
    <button onclick='editStudent(${JSON.stringify(s)})'>Editar</button>
    <button onclick="deleteStudent(${s.id})">Eliminar</button>
`;

            data.forEach(s => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${s.nombre} - ${s.edad} - ${s.nota}
                    <button onclick="deleteStudent(${s.id})">Eliminar</button>
                `;
                list.appendChild(li);
            });
        });
}

function createStudent() {
    const nombre = document.getElementById("nombre").value;
    const edad = document.getElementById("edad").value;
    const nota = document.getElementById("nota").value;

    if (!nombre || !edad || !nota) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`${API}/students?nombre=${nombre}&edad=${edad}&nota=${nota}`, {
        method: "POST"
    })
    .then(() => {
        loadStudents();
    });
}

function deleteStudent(id) {
    fetch(`${API}/students/${id}`, {
        method: "DELETE"
    })
    .then(() => loadStudents());
}

let editingId = null;

function createStudent() {
    const nombre = document.getElementById("nombre").value;
    const edad = document.getElementById("edad").value;
    const nota = document.getElementById("nota").value;

    if (!nombre || !edad || !nota) {
        alert("Completa todos los campos");
        return;
    }

    if (editingId) {
        fetch(`${API}/students/${editingId}?nombre=${nombre}&edad=${edad}&nota=${nota}`, {
            method: "PUT"
        }).then(() => {
            editingId = null;
            loadStudents();
        });
    } else {
        fetch(`${API}/students?nombre=${nombre}&edad=${edad}&nota=${nota}`, {
            method: "POST"
        }).then(loadStudents);
    }
}

function editStudent(student) {
    document.getElementById("nombre").value = student.nombre;
    document.getElementById("edad").value = student.edad;
    document.getElementById("nota").value = student.nota;
    editingId = student.id;
}