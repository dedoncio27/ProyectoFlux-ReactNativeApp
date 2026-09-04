# ⚡ Flux — Tu Asistente Nutricional y Deportivo Inteligente

<p align="center">
  <img src="./assets/images/icon.png" width="120" height="120" alt="Flux Logo" style="border-radius: 20%;" />
</p>

<p align="center">
  <strong>Una aplicación móvil multiplataforma premium diseñada para monitorizar tu salud, nutrición y rutinas de ejercicio de forma personalizada.</strong>
</p>

<p align="center">
  <!-- Shields/Badges -->
  <img src="https://img.shields.io/badge/Expo-SDK%2054-blue?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</p>

---

## 📋 Índice
1. [Sobre el Proyecto](#sobre-el-proyecto)
2. [Características Principales](#características-principales)
3. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Requisitos Previos](#requisitos-previos)
6. [Instalación y Uso Local](#instalación-y-uso-local)
7. [Configuración de Servicios Externos](#configuración-de-servicios-externos)
8. [Despliegue y Distribución](#despliegue-y-distribución)

---

## 🌟 Sobre el Proyecto

**Flux** es una aplicación móvil moderna e intuitiva construida bajo el ecosistema de **Expo** y **React Native**. Permite llevar un control total de tu estilo de vida saludable mediante la gestión diaria de calorías y macronutrientes, junto con un completo planificador de entrenamientos y rutinas de fuerza. 

Además, incorpora una pasarela de pago segura con **Stripe** para soportar donaciones en un modelo Premium y persistencia de datos sincronizada en la nube mediante **Firebase**.

---

## ✨ Características Principales

### 🔐 1. Autenticación de Usuarios
* Sistema seguro de **Registro e Inicio de Sesión** implementado mediante Firebase Authentication.
* Validación detallada de errores en tiempo real (correo en uso, contraseña débil, credenciales incorrectas).

### 📊 2. Perfil Metabólico y Calendario
* Registro personalizado de métricas del usuario: **peso, altura, edad, sexo, nivel de actividad física** y **objetivo personal** (bajar peso, mantener, subir masa muscular).
* Cálculo dinámico de necesidades calóricas según el perfil.
* Calendario interactivo integrado para realizar el seguimiento diario de tus progresiones.

### 🍎 3. Diario Nutricional y Macronutrientes
* Registro organizado por comidas principales del día: **Desayuno, Comida y Cena**.
* Visualizador intuitivo del progreso diario mediante un **círculo de calorías dinámico** (construido con SVG) y barras de progreso por cada macronutriente (**Carbohidratos, Proteínas y Grasas**).
* Biblioteca de alimentos personalizada ("Mis Alimentos", "Mis Recetas") y adición rápida a las ingestas diarias.

### 🏋️‍♂️ 4. Planificador de Entrenamientos
* Creación de rutinas personalizadas y entrenamientos por días (Ej: *Push Day*, *Pierna*, etc.).
* Buscador avanzado de ejercicios con filtro inteligente por grupo muscular (Pectoral, Espalda, Bíceps, Piernas, etc.).
* Configuración específica de **series (sets), repeticiones (reps), peso (Kg)** y tiempos de descanso en segundos.

### 💎 5. Soporte Premium (Donaciones)
* Integración segura con **Stripe Web Checkout** a través del navegador móvil.
* Planes de donación escalonados: *Pequeño donativo*, *Donativo top* y *Donativo épico*.
* Sincronización en la nube para actualizar el estado del usuario.

### 🎨 6. Temas y Personalización
* Selector de temas adaptado a **Modo Oscuro** (Dark Mode) y **Modo Claro** (Light Mode) de forma automática o manual.
* Interfaz basada en **React Native Paper** y animaciones fluidas con **React Native Reanimated**.

---

## 🛠️ Arquitectura y Tecnologías

El proyecto se divide en dos partes principales: el cliente móvil y una API backend dedicada.

### Frontend (App Móvil)
* **React Native (v0.81.5)** y **Expo SDK 54**: Desarrollo universal multiplataforma (iOS, Android y Web).
* **Expo Router**: Sistema de enrutamiento basado en archivos (File-based Routing).
* **React Native Paper**: Sistema de componentes de diseño Material Design adaptables.
* **React Native Reanimated**: Animaciones y transiciones de UI fluidas de alto rendimiento.
* **TypeScript**: Tipado estático para garantizar la scalabilidad y robustez del código.
* **React Native SVG**: Visualización y gráficos vectoriales nativos de alto rendimiento.

### Backend y Servicios
* **Firebase (v12.13.0) & Firebase Native SDK**: Persistencia de bases de datos no relacionales mediante Firestore y control de autenticación con Firebase Auth.
* **Vercel**: Alojamiento del servidor backend externo de API REST para la lógica de negocio y endpoints del Stripe Checkout.
* **Stripe API**: Procesamiento seguro de pagos de donaciones y suscripción.

---

## 📁 Estructura del Proyecto

A continuación se detalla la organización de los directorios clave del proyecto Flux:

```bash
Flux/
├── app/                   # Directorio principal de pantallas (Expo Router)
│   ├── (tabs)/            # Pestañas principales de la navegación inferior
│   │   ├── _layout.tsx    # Configuración visual de la barra de navegación inferior
│   │   ├── foodscreen.tsx # Diario nutricional, calorías y macronutrientes
│   │   ├── index.tsx      # Dashboard principal del estado metabólico y calendario
│   │   ├── settings.tsx   # Pantalla de ajustes de la aplicación
│   │   └── training.tsx   # Página inicial de entrenamientos
│   ├── _layout.tsx        # Root layout con proveedores de temas y autenticación
│   ├── login.tsx          # Pantalla de Login / Registro de Firebase
│   ├── payment.tsx        # Interfaz premium y pasarela de donaciones con Stripe
│   ├── workout.tsx        # Gestor y constructor de entrenamientos
│   ├── calorySettings.tsx # Ajustes finos de macros y límites de calorías
│   └── exercises.tsx      # Listado y visualización de la biblioteca de ejercicios
├── assets/                # Recursos estáticos (Imágenes, Fuentes, Iconos)
├── components/            # Componentes de React reutilizables (PlanNeonCard, AlimentoItem, etc.)
├── config/                # Configuración de inicialización de Firebase
├── constants/             # Constantes de estilos y colores del sistema
├── context/               # Contextos globales de React (ej: ThemeContext para modo oscuro)
├── hooks/                 # Custom React Hooks compartidos
├── lib/                   # Clientes de API REST e integraciones del servidor
├── utils/                 # Utilidades y gestores de almacenamiento local
├── package.json           # Scripting del proyecto y dependencias de NPM
└── app.json               # Configuración nativa global de Expo (Android/iOS)
```

---

## 🚀 Instalación y Uso Local

Sigue los siguientes pasos para poner en marcha el entorno de desarrollo local:

### 1. Requisitos Previos
* **Node.js** (Versión 18 o superior recomendada).
* **NPM** o **Yarn** instalado en tu sistema.
* Un dispositivo físico con la app **Expo Go** instalada (disponible en App Store y Google Play) o un emulador de iOS/Android configurado en tu PC.

### 2. Clonar e Instalar Dependencias
Instala los paquetes necesarios definidos en `package.json`:
```bash
npm install
```

### 3. Ejecutar el Servidor de Desarrollo
Inicia el empaquetador de Expo (Metro Bundler):
```bash
npx expo start
```

### 4. Probar en Dispositivo
* **Expo Go**: Escanea el código QR generado en la terminal con la cámara de tu móvil (iOS) o la app Expo Go (Android).
* **Emulador Android**: Presiona `a` en la terminal para abrir el emulador de Android Studio conectado.
* **Simulador iOS**: Presiona `i` en la terminal para iniciar el simulador de Xcode.
* **Versión Web**: Presiona `w` para probar en el navegador web local.

---

## ⚙️ Configuración de Servicios Externos

### Firebase
Para que las funciones de autenticación y Firestore funcionen correctamente, es necesario configurar los servicios de Firebase de la siguiente forma:
1. Crea un proyecto en la consola de Firebase.
2. Añade aplicaciones de Android e iOS al proyecto.
3. Descarga e incluye los archivos de configuración nativos en la raíz del proyecto:
   * **Android**: Guarda el archivo `google-services.json` en la raíz del proyecto.
   * **iOS**: Guarda el archivo `GoogleService-Info.plist` en la raíz del proyecto.
4. Asegúrate de configurar los datos de inicialización correspondientes en `config/firebase.ts`.

### Stripe y Backend
La aplicación realiza peticiones HTTP seguras para la pasarela de pagos al servidor en producción alojado en Vercel. 
Si deseas modificar el endpoint de comunicación o configurar tu propio servidor en local, puedes hacerlo editando la constante en `lib/api.ts` o utilizando variables de entorno de Expo.

---

## 📦 Despliegue y Distribución

Para compilar y empaquetar la aplicación para subir a tiendas (Google Play y Apple App Store), se utiliza **EAS Build** (Expo Application Services):

1. Instala el cliente de EAS CLI de forma global:
   ```bash
   npm install -g eas-cli
   ```
2. Loguéate en tu cuenta de Expo:
   ```bash
   eas login
   ```
3. Configura el proyecto para EAS:
   ```bash
   eas build:configure
   ```
4. Genera una build de producción (por ejemplo para Android AAB o iOS IPA):
   ```bash
   eas build --platform all
   ```
