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

Estas reglas todavía no están conectadas a las pantallas. La persistencia y su
integración corresponden a los siguientes incrementos de UX-0.
