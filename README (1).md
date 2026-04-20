# Atelier Kely Echeverria - Pagina Web

Pagina web completa para el taller de modisteria Kely Echeverria.

## Estructura del proyecto

```
atelier-kely/
├── index.html          # Archivo principal
├── css/
│   └── style.css       # Todos los estilos
├── js/
│   └── app.js          # Logica de la aplicacion
├── images/
│   ├── logo.png        # Logo del atelier (agregar aqui)
│   └── kely.jpg        # Foto de Kely (agregar aqui)
└── README.md
```

## Como usar

### 1. Agregar el logo y la foto
- Coloca el archivo del logo como `images/logo.png`
- Coloca la foto de Kely como `images/kely.jpg`

### 2. Abrir en el navegador
- Abre `index.html` directamente en el navegador para probar localmente.

### 3. Acceso de administradora
- En la esquina inferior derecha hay un boton con un candado.
- Haz clic y escribe la contrasena: **kely2024**
- Con sesion activa puedes:
  - Agregar prendas al catalogo (nombre, precio, categoria, colores, cantidad, foto)
  - Eliminar prendas
  - Editar la descripcion de "Sobre Mi"
  - Editar redes sociales en "Contacto"

### 4. Cambiar la contrasena
- Abre `js/app.js` y cambia el valor de `ADMIN_PASSWORD` en la linea 4.

### 5. Subir a GitHub Pages
1. Crea un repositorio en GitHub.
2. Sube todos los archivos.
3. Ve a Settings > Pages > Branch: main > Save.
4. Tu pagina estara disponible en `https://tu-usuario.github.io/nombre-repo`

## Funciones principales

- **Catalogo** con filtros por categoria, modal de detalle, boton agregar al carrito.
- **Carrito** lateral que envia el pedido por WhatsApp con el resumen completo.
- **Pedidos personalizados** que abren WhatsApp con los datos del formulario.
- **Sobre Mi** con foto y descripcion editable.
- **Contacto** con botones directos a WhatsApp, Instagram, Facebook y Gmail.
- **Responsive** adaptado a celular y computador.

## WhatsApp configurado
Numero: +57 301 7255825
