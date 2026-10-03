# Reglas de progreso

`src/domain/progress.ts` contiene funciones puras, independientes de React,
navegación y persistencia. Reciben grupos ordenados con los IDs de las lecciones
que tienen contenido disponible, y los IDs completados de esa ruta. Los IDs de
grupo y de lección deben ser únicos en la ruta. Las filas anunciadas sin contenido
pueden representarse como grupos vacíos; no cuentan en el total ni se desbloquean.

Completar una lección añade su ID sin borrar los anteriores. Repetirla no cambia
el progreso. La siguiente lección es la primera pendiente según el orden de los
grupos y sus lecciones, incluso cuando hay huecos en los completados. Un grupo
con contenido se desbloquea cuando todas las lecciones disponibles de los grupos
anteriores están completadas; los grupos vacíos no bloquean el avance.

El progreso cuenta IDs disponibles únicos: los completados desconocidos no
cuentan y los duplicados no aumentan el porcentaje. El progreso de la ruta se
calcula sobre todas sus lecciones, no como promedio de los grupos. Sin contenido,
el porcentaje es cero, la ruta no está completada y no hay siguiente lección.
Añadir contenido puede reducir el porcentaje; repetir una lección no lo reduce.

## Persistencia local

`src/stores/progress.ts` expone una única instancia sobre AsyncStorage. La lógica
de lectura y completado está en `src/domain/progress-store.ts`, con almacenamiento
inyectable para probarla sin React Native. No mantiene una copia en memoria:
cada operación lee el estado guardado, y completar escribe el conjunto acumulado.

Cada ruta usa una clave `yolingo:progress:v1:<ID de ruta codificado>` que contiene
un array JSON de IDs completados. Los datos ausentes, el JSON inválido o un valor
que no sea un array se leen como vacíos. En arrays parcialmente corruptos se
conservan los strings no vacíos y se eliminan duplicados. Leer no reescribe datos;
el siguiente completado guarda el conjunto recuperado. Los IDs desconocidos se
conservan: las reglas de progreso deciden si pertenecen al contenido disponible.

Las operaciones de la instancia se serializan para evitar pérdidas entre
completados concurrentes. Esto no sincroniza pestañas del navegador ni otras
instancias. Los errores de acceso a AsyncStorage se propagan al llamador; no se
tratan como datos vacíos ni se confirma un completado cuyo guardado haya fallado.
Una operación fallida permite reintentos posteriores.

## Integración con Hiragana

`hiragana-lessons.ts` relaciona el contenido disponible con las pantallas de las
cinco vocales. Sus IDs de carácter (`hiragana-a`, etc.) son los IDs persistidos.
La ruta lee el store al recuperar el foco y calcula el siguiente pendiente y el
progreso a partir de este contenido. Durante la carga o si falla la lectura, no
permite abrir una lección desde la ruta; un fallo ofrece reintentar.

Al confirmar el reconocimiento, la lección espera el guardado antes de avanzar
o mostrar el resultado. Un fallo conserva el quiz y permite reintentar. Volver
atrás antes de confirmar no completa la lección; hacerlo después conserva lo
guardado. Los enlaces profundos abren contenido, no otorgan progreso: el parámetro
antiguo `completed` ya no se lee. Su eliminación de los callbacks de retorno
queda para el paso 7 de UX-0.
