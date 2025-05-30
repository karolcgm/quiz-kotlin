# 🚀 Quiz Kotlin - SPD POLSPL 2025

Interaktywny quiz do nauki języka programowania Kotlin i Android Studio, stworzony specjalnie dla studentów Semestru Projektowego Dyplomowego na POLSPL w 2025 roku.

## ✨ Nowe funkcje

### 🎯 System poziomów trudności
- **🟢 Łatwy** - Wskazanie 2 błędów w kodzie (250 pytań)
- **🟡 Średni** - Uzupełnienie kodu (2 elementy A/B/C/D) (250 pytań)  
- **🔴 Trudny** - Uzupełnienie 2 elementami kodu (250 pytań)

### 📚 Zakresy wiedzy

#### Poziom Podstawowy (Łatwy)
- Zmienne (val, var)
- Tablice
- Pętle
- Błędy indeksowania
- Literówki
- Diamenty
- Lambdy

#### Poziom Średni
- Wszystko z poziomu podstawowego
- Android Studio podstawy
- Button, Label, PlainText
- Zmiana kolorów
- Podstawy interfejsu użytkownika

#### Poziom Trudny
- Wszystko z poziomów poprzednich
- Android Studio w pełnej okazałości
- Problemy z dziedziczeniem
- Zaawansowane koncepty Kotlin
- Złożone wzorce projektowe
- Coroutines
- Fragments
- Services

## 🎮 Jak korzystać

1. **Wybierz poziom trudności** - Dostosuj quiz do swojego poziomu wiedzy
2. **Przeczytaj informacje** - Sprawdź zakres tematów dla wybranego poziomu
3. **Rozpocznij quiz** - Odpowiedz na 5 losowych pytań z bazy 250 pytań
4. **Zobacz wyniki** - Otrzymaj szczegółowe informacje o swoim wyniku

## 🔧 Funkcje techniczne

### 📊 Baza pytań
- **750 pytań łącznie** (250 na każdy poziom)
- Automatyczne generowanie pytań na podstawie szablonów
- Unikalne ID i kategorie dla każdego pytania
- Losowe wybieranie pytań dla każdego quizu

### 🎨 Interfejs użytkownika
- Responsywny design dostosowany do wszystkich urządzeń
- Animacje i efekty wizualne
- Intuicyjna nawigacja między poziomami
- Podświetlanie składni kodu

### ⚡ Wydajność
- Szybkie generowanie bazy pytań (< 100ms)
- Optymalizacja dla urządzeń mobilnych
- Płynne animacje i przejścia

## 🛠️ Struktura projektu

```
quiz-kotlin/
├── index.html          # Główny plik HTML z interfejsem
├── styles.css          # Style CSS z animacjami
├── script.js           # Logika aplikacji i baza pytań
├── README.md           # Dokumentacja projektu
├── vercel.json         # Konfiguracja deploymentu
└── DEPLOYMENT_INSTRUCTIONS.md
```

## 🚀 Deployment

### Vercel (Zalecane)
```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
1. Wgraj pliki do repozytorium GitHub
2. Włącz GitHub Pages w ustawieniach repozytorium
3. Wybierz branch main jako źródło

### Netlify
1. Przeciągnij folder projektu na netlify.com
2. Lub połącz z repozytorium GitHub

## 📱 Kompatybilność

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Urządzenia mobilne (iOS/Android)

## 🎯 Smaczki i dodatki

- **Czas generowania** - Wyświetlanie czasu potrzebnego na wygenerowanie bazy pytań
- **Kategorie pytań** - Pokazywanie kategorii pytań w wynikach
- **Udostępnianie wyników** - Możliwość udostępnienia wyniku
- **Animacje** - Efekt pulsowania dla wybranego poziomu
- **Responsywność** - Pełna obsługa urządzeń mobilnych

## 🔄 Aktualizacje

### Wersja 2.0 (Styczeń 2025)
- ✅ System poziomów trudności
- ✅ 750 pytań w bazie danych
- ✅ Nowy interfejs wyboru poziomu
- ✅ Ulepszone animacje i efekty
- ✅ Zmiana nazwy na SPD POLSPL 2025

### Wersja 1.0 (Grudzień 2024)
- ✅ Podstawowy quiz z 100 pytaniami
- ✅ Responsywny design
- ✅ System wyników

## 👨‍💻 Rozwój

### Dodawanie nowych pytań

Pytania są generowane automatycznie na podstawie szablonów w pliku `script.js`. Aby dodać nowe szablony:

1. Znajdź odpowiednią funkcję (`generateEasyQuestions`, `generateMediumQuestions`, `generateHardQuestions`)
2. Dodaj nowy szablon do tablicy `templates`
3. Pytania zostaną automatycznie wygenerowane

### Przykład szablonu (poziom łatwy):
```javascript
{
    category: "Nazwa kategorii",
    codeTemplate: `kod z błędami`,
    errors: ["Opis błędu 1", "Opis błędu 2"],
    explanation: "Wyjaśnienie"
}
```

### Przykład szablonu (poziom średni/trudny):
```javascript
{
    category: "Nazwa kategorii", 
    codeTemplate: `kod z lukami _____`,
    blanks: [
        {
            position: "A",
            options: ["opcja1", "opcja2", "opcja3", "opcja4"],
            correct: 0
        }
    ],
    explanation: "Wyjaśnienie"
}
```

## 📞 Kontakt

Projekt stworzony dla studentów SPD POLSPL 2025 ❤️

---

**Powodzenia w nauce Kotlin i Android Studio! 🚀**
