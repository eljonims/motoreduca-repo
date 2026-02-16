class MotorEduca {
    constructor() {
        this.version = "1.0.0";
        this.data = null;
    }

    bitacora(msj, pct) {
        const lista = document.getElementById('bitacora-lanzamiento');
        const barra = document.getElementById('barra-progreso');
        if (lista) {
            const linea = document.createElement('div');
            linea.className = 'linea-bitacora';
            linea.innerText = `[${new Date().toLocaleTimeString()}] ${msj}`;
            lista.appendChild(linea);
            lista.scrollTop = lista.scrollHeight;
        }
        if (barra && pct !== undefined) barra.style.width = `${pct}%`;
    }

    async lanzar(url) {
        this.bitacora("Despertando MotorEduca...", 10);

        try {
            // 1. CONEXIÓN AL ALMACÉN
            this.bitacora("Conectando al almacén local...", 20);
            this.db = await this.conectarAlmacen();
            await this.esperar(500);
            this.bitacora("[OK] Almacén IndexedDB listo.", 25);

            // 2. CONEXIÓN A LA RED
            this.bitacora(`Conectando con fuente: ${url}`, 35);
            const respuesta = await fetch(url);
            await this.esperar(600);

            if (!respuesta.ok) throw new Error("Fitxategia ez da aurkitu");

            // 3. DESCARGA Y PROCESAMIENTO
            this.bitacora("Descargando temario...", 50);
            this.data = await respuesta.json();
            await this.esperar(1000);

            // 4. GUARDADO EN ALMACÉN (Aquí es donde se queda "para siempre")
            this.bitacora("Guardando copia en el almacén...", 70);
            await this.guardarLibro(this.data);
            await this.esperar(500);

            // 5. VALIDACIÓN (Preparado para el futuro)
            this.bitacora("Validando integridad...", 85);
            await this.esperar(500);
            // Aquí llamarás a: if(!this.validarEsquema(this.data)) return;

            // 6. FINALIZACIÓN
            this.bitacora("¡Todo listo! Arrancando...", 100);
            await this.esperar(800);

            // Efecto de salida de la pantalla de carga
            setTimeout(() => {
                const pantalla = document.getElementById('pantalla-lanzamiento');
                pantalla.style.opacity = "0";

                setTimeout(() => {
                    pantalla.classList.add('oculto');
                    document.getElementById('app').classList.remove('oculto');
                    document.getElementById('titulo-curso').innerText = this.data.config.titulo;
                }, 500);
            }, 1000);

        } catch (error) {
            this.bitacora(`ERROR CRÍTICO: ${error.message}`, 100);
            console.error(error);
        }
    }
    conectarAlmacen() {
        return new Promise((resolver, rechazar) => {
            // Abrimos la BD "MotorEduca_DB" versión 1
            const peticion = indexedDB.open("MotorEduca_DB", 1);

            // Si es la primera vez (o subimos versión), creamos las "estanterías"
            peticion.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Estantería 1: Los libros (el JSON completo)
                if (!db.objectStoreNames.contains("libros")) {
                    db.createObjectStore("libros", { keyPath: "id" });
                }
                // Estantería 2: El progreso (vistos, completados)
                if (!db.objectStoreNames.contains("progreso")) {
                    db.createObjectStore("progreso", { keyPath: "id_libro" });
                }
            };

            peticion.onsuccess = (e) => resolver(e.target.result);
            peticion.onerror = (e) => rechazar("Error abriendo Almacén");
        });
    }
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    guardarLibro(libro) {
        return new Promise((resolver, rechazar) => {
            const tx = this.db.transaction(["libros"], "readwrite");
            const almacen = tx.objectStore("libros");

            // Creamos la ficha para IndexedDB
            const ficha = {
                id: libro.config.id || "curso-actual", // Usamos el ID del JSON
                titulo: libro.config.titulo,
                version: libro.config.version,
                datos: libro // Guardamos todo el objeto JSON dentro
            };

            const peticion = almacen.put(ficha);
            peticion.onsuccess = () => resolver();
            peticion.onerror = () => rechazar("No se pudo guardar el libro");
        });
    }
}
