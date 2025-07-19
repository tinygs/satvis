# Análisis de Cambios del Repositorio TinyGS-Satvis

## Resumen
Este documento analiza los cambios realizados en el repositorio entre los commits `e0c4c5f` y `5e838af`, mostrando las modificaciones específicas para adaptar la aplicación satvis al ecosistema TinyGS.

## Cambios Realizados

### 1. Dependencias (package.json)
**Archivo:** [`package.json`](package.json:63-67)

**Cambio:** Se actualizó la fuente del paquete `strip-pragma-loader` de la versión publicada en npm a una versión personalizada desde GitHub.

```diff
- "strip-pragma-loader": "^1.0.0",
+ "strip-pragma-loader": "github:4m1g0/strip-pragma-loader",
```

**Impacto:** Uso de una versión personalizada del loader que probablemente incluye mejoras o correcciones específicas para el proyecto.

### 2. Configuración de Satélites (src/app.js)
**Archivo:** [`src/app.js`](src/app.js:22-37)

**Cambios principales:**
- **Deshabilitación de catálogos de satélites genéricos:** Todos los TLEs de satélites tradicionales (Planet, Starlink, Globalstar, etc.) fueron comentados
- **Activación de TinyGS:** Se añadió y activó la fuente de satélites TinyGS desde la API oficial

```diff
- cc.sats.addFromTleUrl("data/tle/norad/planet.txt", ["Planet"]);
+ /*cc.sats.addFromTleUrl("data/tle/norad/planet.txt", ["Planet"]);
  cc.sats.addFromTleUrl("data/tle/norad/starlink.txt", ["Starlink"]);
  cc.sats.addFromTleUrl("data/tle/norad/globalstar.txt", ["Globalstar"]);
  cc.sats.addFromTleUrl("data/tle/norad/resource.txt", ["Resource"]);
  cc.sats.addFromTleUrl("data/tle/norad/science.txt", ["Science"]);
  cc.sats.addFromTleUrl("data/tle/norad/stations.txt", ["Stations"]);
- cc.sats.addFromTleUrl("data/tle/norad/tle-new.txt", ["New"]);
+ cc.sats.addFromTleUrl("data/tle/norad/tle-new.txt", ["New"]);*/
+ cc.sats.addFromTleUrl("https://api.tinygs.com/v1/tles.txt", ["TinyGS"]);

- cc.sats.addFromTleUrl("data/tle/ext/move.txt", ["MOVE"]);
+ cc.sats.addFromTleUrl("https://api.tinygs.com/v1/tles.txt", ["TinyGS"]);
  if (cc.sats.enabledTags.length === 0) {
-   cc.sats.enableTag("MOVE");
+   cc.sats.enableTag("TinyGS");
 }
```

**Impacto:** La aplicación ahora se centra exclusivamente en los satélites del ecosistema TinyGS, eliminando el resto de catálogos.

### 3. Interfaz de Usuario (src/components/Cesium.vue)
**Archivo:** [`src/components/Cesium.vue`](src/components/Cesium.vue:2-50, 205-220)

**Cambios principales:**
- **Eliminación de botones de la barra de herramientas izquierda:** Se removieron todos los botones de selección de satélites, elementos, estaciones terrestres, mapa, móvil y debug
- **Eliminación de botones de la barra de herramientas derecha:** Se removieron el enlace a GitHub y el botón de toggle UI

```diff
- <b-tooltip label="Satellite selection" ...> ... </b-tooltip>
- <b-tooltip label="Satellite elements" ...> ... </b-tooltip>
- <b-tooltip label="Ground station" ...> ... </b-tooltip>
- <b-tooltip label="Map" ...> ... </b-tooltip>
- <b-tooltip v-if="cc.minimalUI" label="Mobile" ...> ... </b-tooltip>
- <b-tooltip label="Debug" ...> ... </b-tooltip>
```

**Impacto:** Interfaz minimalista que probablemente se adapta mejor a pantallas pequeñas o a un caso de uso más específico.

### 4. Controlador de Cesium (src/modules/CesiumController.js)
**Archivo:** [`src/modules/CesiumController.js`](src/modules/CesiumController.js:14-31, 37, 441)

**Cambios principales:**

#### 4.1. Configuración de vista inicial por parámetros URL
```javascript
// Nuevo código añadido
const urlParams = new URLSearchParams(window.location.search);
const gsParam = urlParams.get('gs');
if (gsParam) {
  const gs = gsParam.split(",");
  console.log(gs[0] + ' ' + gs[1])

  var west = gs[1] - 10;
  var south = gs[0] - 10;
  var east = gs[1] + 10;
  var north = gs[0] + 10;

  var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

  Cesium.Camera.DEFAULT_VIEW_FACTOR = 1;
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;
}
```

#### 4.2. Desactivación de iluminación global
```diff
- this.viewer.scene.globe.enableLighting = true;
+ this.viewer.scene.globe.enableLighting = false;
```

#### 4.3. Desactivación del botón de información N2YO
```diff
- container.appendChild(infoButton);
+ //container.appendChild(infoButton);
```

**Impacto:**
- Permite centrar la vista en una estación terrestre específica mediante parámetros URL
- Mejora el rendimiento al desactivar la iluminación dinámica
- Simplifica la interfaz removiendo enlaces externos

### 5. Configuración de Satélites (src/modules/SatelliteManager.js)
**Archivo:** [`src/modules/SatelliteManager.js`](src/modules/SatelliteManager.js:23-27)

**Cambio:** Se eliminó la restricción `no-cors` en las peticiones fetch para obtener TLEs

```diff
  fetch(url, {
-   mode: "no-cors",
+   //mode: "no-cors",
  })
```

**Impacto:** Permite obtener correctamente los TLEs desde la API de TinyGS sin restricciones CORS.

### 6. Configuración del Cono de Cobertura (src/modules/SatelliteEntityWrapper.js)
**Archivo:** [`src/modules/SatelliteEntityWrapper.js`](src/modules/SatelliteEntityWrapper.js:157-167)

**Cambios en los parámetros del cono de cobertura:**
- **Campo de visión:** De 12° a 65°
- **Radio del cono:** De 1,000,000m a 3,000,000m

```diff
-  createCone(fov = 12) {
+  createCone(fov = 65) {
     const cone = new Cesium.Entity();
     cone.addProperty("conicSensor");
     cone.conicSensor = new CesiumSensorVolumes.ConicSensorGraphics({
-       radius: 1000000,
+       radius: 3000000,
        innerHalfAngle: Cesium.Math.toRadians(0),
        outerHalfAngle: Cesium.Math.toRadians(fov),
```

**Impacto:** Aumenta significativamente el área de cobertura visual mostrada para cada satélite TinyGS, adaptándose mejor a las características de estos satélites.

## Resumen de Adaptación TinyGS

Los cambios realizados transforman la aplicación satvis general en una herramienta especializada para el ecosistema TinyGS:

1. **Especialización:** Se centra exclusivamente en satélites TinyGS
2. **Simplificación:** Interfaz minimalista sin controles innecesarios
3. **Configuración dinámica:** Permite centrarse en estaciones específicas via URL
4. **Optimización visual:** Mejor representación del área de cobertura de satélites
5. **Integración API:** Uso directo de la API oficial de TinyGS para datos actualizados

Esta transformación convierte la aplicación en una herramienta específica para la visualización y seguimiento de satélites dentro del ecosistema TinyGS.
