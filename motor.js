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
            this.bitacora("Conectando al almacén local...", 20);
            this.db = await this.conectarAlmacen();
            await this.esperar(500);
            this.bitacora("[OK] Almacén IndexedDB listo.", 25);
            // ---------------------------------------
            this.bitacora(`Conectando con fuente: ${url}`, 30);
            const respuesta = await fetch(url);
            await this.esperar(600);

            if (!respuesta.ok) throw new Error("Fitxategia ez da aurkitu");

            this.bitacora("Descargando temario...", 60);
            this.data = await respuesta.json();
            await this.esperar(1000);

            this.bitacora("Validando integridad...", 80);
            await this.esperar(500);
            // Aquí iría tu validarEsquema() en el futuro

            this.bitacora("¡Todo listo! Arrancando...", 100);
            await this.esperar(800);

            setTimeout(() => {
                document.getElementById('pantalla-lanzamiento').style.opacity = "0";
                setTimeout(() => {
                    document.getElementById('pantalla-lanzamiento').classList.add('oculto');
                    document.getElementById('app').classList.remove('oculto');
                    document.getElementById('titulo-curso').innerText = this.data.config.titulo;
                }, 500);
            }, 1000);

        } catch (error) {
            this.bitacora(`ERROR CRÍTICO: ${error.message}`, 100);
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
}
