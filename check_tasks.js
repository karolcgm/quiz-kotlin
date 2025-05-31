// Sprawdzenie czy zadania 13 i 18 są identyczne PO NAPRAWIE
const titles = [
    "Pobieranie tekstu z EditText", "Zmiana koloru tła przycisku", 
    "Konwersja String na Double", "Warunek if-else", "Operacje matematyczne", 
    "Pierwiastek z walidacją", "Data w formacie MM/dd/yyyy", "Toast z długim czasem", 
    "Przycisk z TextView", "EditText z liczbami", "Math.pow() - potęgowanie", 
    "SimpleDateFormat z czasem", "findViewById z TextView", "Color.GREEN dla przycisku", 
    "toIntOrNull() konwersja", "LENGTH_LONG dla Toast", "setOnClickListener podstawy", 
    "applicationContext użycie", "text.toString() metoda", "if-else z liczbami", 
    "Button.setText() zmiana", "Math.abs() wartość bezwzględna", "Date() aktualna data", 
    "Locale.getDefault() ustawienia", "setBackgroundColor() kolor", "setTextColor() tekst", 
    "replace() zamiana znaków", "toDouble() konwersja", "getString() pobieranie", 
    "onCreate() metoda", "setContentView() layout", "R.id.button identyfikator", 
    "Bundle savedInstanceState", "AppCompatActivity klasa", "import android.os.Bundle", 
    "private var zmienna", "val vs var różnica", "String interpolacja", 
    "null sprawdzanie", "Boolean typ danych", "Double typ liczbowy", 
    "Int typ całkowity", "Toast.makeText() tworzenie", "show() wyświetlanie", 
    "this kontekst"
];

const codeVariants = [
    "Wariant 1: Pierwiastek",
    "Wariant 2: Data", 
    "Wariant 3: Kolory",
    "Wariant 4: EditText",
    "Wariant 5: Matematyka",
    "Wariant 6: TextView",
    "Wariant 7: Licznik",
    "Wariant 8: Wiek",
    "Wariant 9: BMI",
    "Wariant 10: Temperatura",
    "Wariant 11: Random",
    "Wariant 12: Parzystość",
    "Wariant 13: Czas",
    "Wariant 14: Widoczność",
    "Wariant 15: Procenty"
];

console.log('=== ANALIZA PO NAPRAWIE (15 wariantów) ===');
console.log('');

// Zadanie 13 (i=13, więc indeks 13-6=7)
const task13Index = (13 - 6) % titles.length; // 7
const task13Variant = (13 - 6) % codeVariants.length; // 7 % 15 = 7

// Zadanie 18 (i=18, więc indeks 18-6=12)  
const task18Index = (18 - 6) % titles.length; // 12
const task18Variant = (18 - 6) % codeVariants.length; // 12 % 15 = 12

console.log('Zadanie 13:');
console.log('- Indeks tytułu:', task13Index, '(' + (13-6) + ' % ' + titles.length + ')');
console.log('- Tytuł:', titles[task13Index]);
console.log('- Indeks wariantu:', task13Variant, '(' + (13-6) + ' % ' + codeVariants.length + ')');
console.log('- Wariant kodu:', codeVariants[task13Variant]);

console.log('');
console.log('Zadanie 18:');
console.log('- Indeks tytułu:', task18Index, '(' + (18-6) + ' % ' + titles.length + ')');
console.log('- Tytuł:', titles[task18Index]);
console.log('- Indeks wariantu:', task18Variant, '(' + (18-6) + ' % ' + codeVariants.length + ')');
console.log('- Wariant kodu:', codeVariants[task18Variant]);

console.log('');
console.log('=== PORÓWNANIE ===');
console.log('Czy tytuły są takie same?', titles[task13Index] === titles[task18Index]);
console.log('Czy warianty kodu są takie same?', task13Variant === task18Variant);

if (titles[task13Index] === titles[task18Index] && task13Variant === task18Variant) {
    console.log('');
    console.log('❌ NADAL PROBLEM: Zadania 13 i 18 SĄ IDENTYCZNE!');
} else {
    console.log('');
    console.log('✅ NAPRAWIONE: Zadania 13 i 18 są teraz różne!');
}

// Sprawdźmy wszystkie zadania 6-50 pod kątem duplikatów
console.log('');
console.log('=== SPRAWDZENIE WSZYSTKICH ZADAŃ POD KĄTEM DUPLIKATÓW ===');
const taskMap = new Map();
let duplicates = [];

for (let i = 6; i <= 50; i++) {
    const titleIndex = (i - 6) % titles.length;
    const variantIndex = (i - 6) % codeVariants.length;
    const taskKey = `${titleIndex}-${variantIndex}`;
    
    if (taskMap.has(taskKey)) {
        duplicates.push({
            task1: taskMap.get(taskKey),
            task2: i,
            title: titles[titleIndex],
            variant: codeVariants[variantIndex]
        });
    } else {
        taskMap.set(taskKey, i);
    }
    
    console.log(`Zadanie ${i}: "${titles[titleIndex]}" (${codeVariants[variantIndex]})`);
}

console.log('');
console.log('=== WYNIKI ANALIZY DUPLIKATÓW ===');
if (duplicates.length === 0) {
    console.log('🎉 ŚWIETNIE! Nie znaleziono duplikatów w zadaniach 6-50!');
} else {
    console.log('⚠️  Znalezione duplikaty:');
    duplicates.forEach(dup => {
        console.log(`- Zadania ${dup.task1} i ${dup.task2}: "${dup.title}" (${dup.variant})`);
    });
}

// Sprawdźmy cykl powtarzania
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const cycleLCM = lcm(titles.length, codeVariants.length);

console.log('');
console.log('=== ANALIZA CYKLU POWTARZANIA ===');
console.log('Liczba tytułów:', titles.length);
console.log('Liczba wariantów kodu:', codeVariants.length);
console.log('Cykl powtarzania (LCM):', cycleLCM);
console.log('Pierwsze powtórzenie nastąpi w zadaniu:', cycleLCM + 6);
console.log('Czy 45 zadań (6-50) mieści się w cyklu?', 45 <= cycleLCM ? 'TAK ✅' : 'NIE ❌'); 