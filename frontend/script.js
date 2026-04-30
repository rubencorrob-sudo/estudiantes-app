const API = "https://estudiantes-api2.onrender.com";

// 🔥 VARIABLE GLOBAL PARA GUARDAR EL EMAIL
let emailGlobal = "";

// ==========================
// 🔐 AUTH
// ==========================

function sendOTP() {
    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();

    if (!email) {
        alert("Ingresa un correo");
        return;
    }

    // 🔥 GUARDAR EMAIL GLOBAL (CLAVE)
    emailGlobal = email;

    // 🔥 BOTÓN (evita doble click)
    const btn = document.querySelector("#login button");
    btn.innerText = "Enviando...";
    btn.disabled = true;

    fetch(`${API}/auth/send-otp?email=${encodeURIComponent(email)}`, {
        method: "POST"
    })
    .then(res => {
        if (!res.ok) throw new Error("Error en send-otp");
        return res.json();
    })
    .then(data => {
        console.log("OTP recibido:", data);

        // 🔥 MOSTRAR OTP (para demo)
        alert("Tu OTP es: " + data.otp);

        // 🔥 CAMBIAR PANTALLA
        document.getElementById("login").style.display = "none";
        document.getElementById("otp").style.display = "block";
    })
    .catch(err => {
        console.error("ERROR sendOTP:", err);
        alert("Error enviando OTP");
    })
    .finally(() => {
        btn.innerText = "Enviar OTP";
        btn.disabled = false;
    });
}


function verifyOTP() {
    const otpInput = document.getElementById("otpInput");
    const otp = otpInput.value.trim();

    if (!otp) {
        alert("Ingresa el OTP");
        return;
    }

    if (!emailGlobal) {
        alert("Error: no hay email guardado");
        return;
    }

    console.log("Verificando con:", emailGlobal, otp);

    fetch(`${API}/auth/verify-otp?email=${encodeURIComponent(emailGlobal)}&otp=${encodeURIComponent(otp)}`, {
        method: "POST"
    })
    .then(res => {
        if (!res.ok) throw new Error("OTP incorrecto");
        return res.json();
    })
    .then(() => {
        alert("Login exitoso");

        document.getElementById("otp").style.display = "none";
        document.getElementById("app").style.display = "block";

        loadStudents();
    })
    .catch(err => {
        console.error("ERROR verifyOTP:", err);
        alert("OTP incorrecto");
    });
}


// ==========================
// 📚 STUDENTS
// ==========================

function loadStudents() {
    fetch(`${API}/students`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("list");
            list.innerHTML = "";

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
    const nombre = document.getElementById("nombre").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const nota = document.getElementById("nota").value.trim();

    if (!nombre || !edad || !nota) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`${API}/students?nombre=${encodeURIComponent(nombre)}&edad=${edad}&nota=${nota}`, {
        method: "POST"
    })
    .then(() => loadStudents());
}


function deleteStudent(id) {
    fetch(`${API}/students/${id}`, {
        method: "DELETE"
    })
    .then(() => loadStudents());
}