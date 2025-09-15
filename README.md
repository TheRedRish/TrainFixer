Kort instruktion – kør tests

Installer og kør:

npm install
npm test

Big-O for sort()

Køretid: O(n) — funktionen itererer én gang over toglisten (for-loop kører this.train.size gange). Hjælpeoperationerne (moveAfterPointer, removeNode, prepend, append) er konstante tidsoperationer. 

 

Tæl hvor mange gange funktionen løber hele toget igennem?

1 fuldt gennemløb af toget i sort() (for-loop). Tilføjelsen af lokomotiver i slutningen bruger prepend/append uden at traversere hele listen. 



Ét gennemløb vs. flere gennemløb

Fordele ved ét gennemløb: hurtigst i praksis (lineær tid, tidlige afbrydelser mulige), lav hukommelse.

Ulemper ved ét gennemløb: mere kompleks pointer-logik; lettere at lave rækkefølgefejl.

Fordele ved flere gennemløb (f.eks. pass 1: flyt gods, pass 2: passagerer, pass 3: lokomotiver): enklere at forstå og teste; hver pass har et klart mål.

Ulemper ved flere gennemløb: stadig O(n), men med større konstantfaktor (k·n).