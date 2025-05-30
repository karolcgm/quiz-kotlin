# 🚀 Quiz Kotlin - SPD POLSPL 2025

Interaktywny quiz sprawdzający wiedzę z języka programowania **Kotlin** i **Android Studio**, stworzony specjalnie dla studentów **Semestru Projektowego Dyplomowego POLSPL 2025**.

## ✨ Nowe funkcje - System 9 kombinacji!

Quiz oferuje **9 unikalnych kombinacji** pytań:
- **3 zakresy wiedzy** × **3 poziomy trudności** = **9 różnych doświadczeń**
- Każda kombinacja ma **84 unikalne pytania** (łącznie **756 pytań**)
- Dwuetapowy wybór: najpierw zakres wiedzy, potem poziom trudności

### 📚 Zakresy wiedzy

#### 🟢 Podstawowy
- Zmienne (val, var)
- Tablice i kolekcje
- Pętle i instrukcje warunkowe
- Błędy indeksowania
- Literówki w kodzie
- Diamenty (diamond operator)
- Lambdy i funkcje wyższego rzędu

#### 🟡 Średni (Podstawowy + Android)
- Wszystko z poziomu podstawowego
- Android Studio - podstawy
- Komponenty UI: Button, TextView, EditText
- Zmiana kolorów i stylów
- Toast i Intent
- Podstawy interfejsu użytkownika

#### 🔴 Trudny (Zaawansowany)
- Wszystko z poziomów poprzednich
- Android Studio - zaawansowane funkcje
- Dziedziczenie i polimorfizm
- Coroutines i programowanie asynchroniczne
- Fragments i nawigacja
- Wzorce projektowe

### 🎯 Poziomy trudności

#### 🟢 Łatwy - Wskazanie błędów
- **Zadanie:** Znajdź 2 błędy w kodzie
- **Format:** Checkboxy z opcjami błędów
- **Cel:** Rozwój umiejętności czytania kodu

#### 🟡 Średni - Uzupełnienie kodu
- **Zadanie:** Wybierz poprawne uzupełnienie (A/B/C/D)
- **Format:** Radio buttons z opcjami
- **Cel:** Testowanie znajomości składni

#### 🔴 Trudny - Kompleksowe uzupełnienie
- **Zadanie:** Uzupełnij 2 elementy kodu
- **Format:** Wieloetapowe uzupełnienie
- **Cel:** Praktyczne zastosowanie wiedzy

## 🎮 Jak korzystać z quizu

1. **Krok 1:** Wybierz zakres wiedzy (Podstawowy/Średni/Trudny)
2. **Krok 2:** Wybierz poziom trudności (Łatwy/Średni/Trudny)
3. **Krok 3:** Rozwiąż 5 losowych pytań z wybranej kombinacji
4. **Krok 4:** Zobacz wyniki z wyjaśnieniami

## 🏆 Przykładowe kombinacje

| Zakres wiedzy | Poziom trudności | Opis |
|---------------|------------------|------|
| 📚 Podstawowy + 🟢 Łatwy | Znajdowanie błędów w podstawowym Kotlin |
| 📱 Średni + 🟡 Średni | Uzupełnianie kodu Android Studio |
| 🚀 Trudny + 🔴 Trudny | Zaawansowane koncepty i coroutines |

## 🛠️ Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - nowoczesny design z animacjami
- **JavaScript (ES6+)** - logika quizu i generowanie pytań
- **Responsive Design** - działa na wszystkich urządzeniach

## 📱 Funkcje

- ✅ **756 unikalnych pytań** w 9 kombinacjach
- ✅ **Responsywny design** - działa na telefonie, tablecie i komputerze
- ✅ **Różne typy pytań** dostosowane do poziomu trudności
- ✅ **Wyjaśnienia** do każdego pytania
- ✅ **Udostępnianie wyników** na social media
- ✅ **Bez ograniczeń czasowych** - ucz się w swoim tempie
- ✅ **Lokalne działanie** - nie wymaga internetu po załadowaniu

## 🚀 Uruchomienie

### Opcja 1: Bezpośrednio w przeglądarce
Otwórz plik `index.html` w przeglądarce.

### Opcja 2: Lokalny serwer
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (jeśli masz zainstalowany)
npx serve .

# PHP
php -S localhost:8000
```

Następnie otwórz: `http://localhost:8000`

## 📊 Statystyki bazy pytań

- **Łącznie pytań:** 756
- **Kombinacji:** 9 (3×3)
- **Pytań na kombinację:** 84
- **Kategorii tematycznych:** 15+
- **Czas generowania:** < 100ms

## 🎨 Smaczki i dodatki

- 🕐 **Wyświetlanie czasu generowania** bazy pytań w stopce
- 🏷️ **Pokazywanie kategorii pytań** w wynikach końcowych
- ✨ **Efekt pulsowania** dla wybranej kombinacji
- 🎭 **Animacje hover** i płynne przejścia
- 📱 **Pełna responsywność** na wszystkich urządzeniach
- 🌈 **Kolorowe badge'y** dla zakresów wiedzy i poziomów
- 🎯 **Inteligentne mieszanie** pytań z różnych kategorii

## 👨‍💻 Dla deweloperów

### Dodawanie nowych pytań

Pytania są generowane z szablonów w pliku `script.js`. Aby dodać nowe pytania:

1. Znajdź odpowiedni szablon (`basicTemplates`, `intermediateTemplates`, `advancedTemplates`)
2. Dodaj nowy obiekt z polami:
   ```javascript
   {
       category: "Nazwa kategorii",
       codeTemplate: `kod z błędami lub lukami`,
       errors: ["błąd 1", "błąd 2"], // dla poziomu łatwego
       blanks: [
           { position: "A", options: ["opcja1", "opcja2"], correct: 0 }
       ], // dla poziomów średniego/trudnego
       explanation: "Wyjaśnienie"
   }
   ```

### Struktura projektu
```
quiz-kotlin/
├── index.html          # Główna strona
├── styles.css          # Style CSS
├── script.js           # Logika JavaScript
├── README.md           # Dokumentacja
├── DEPLOYMENT_INSTRUCTIONS.md  # Instrukcje wdrożenia
└── vercel.json         # Konfiguracja Vercel
```

## 🎓 Dla studentów SPD POLSPL 2025

Ten quiz został stworzony specjalnie dla Was! Wykorzystajcie go do:

- 📚 **Przygotowania do egzaminów** z Kotlin i Android
- 🔍 **Identyfikacji luk** w wiedzy
- 💪 **Treningu** przed projektami
- 🏆 **Sprawdzenia postępów** w nauce

## 📞 Wsparcie

Jeśli masz pytania lub sugestie:
- Utwórz **Issue** na GitHubie
- Skontaktuj się z prowadzącymi zajęcia
- Sprawdź dokumentację Android i Kotlin

## 📄 Licencja

Projekt stworzony dla celów edukacyjnych SPD POLSPL 2025.

---

**Powodzenia w nauce Kotlin i Android Studio!** 🚀📱

*Wygenerowano automatycznie dla SPD POLSPL 2025 ❤️*
