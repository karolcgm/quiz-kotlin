# 🚀 Quiz Kotlin - Interaktywny Test Wiedzy

Nowoczesna aplikacja webowa do testowania wiedzy z języka programowania Kotlin i Android Studio. Quiz zawiera 100 pytań z fragmentami kodu do uzupełnienia, obejmujących wszystkie kluczowe zagadnienia programowania w Kotlin.

## ✨ Funkcje

- 📝 **100 pytań z fragmentami kodu** - Uzupełnianie brakujących części kodu Kotlin/Android
- 🎯 **Losowe pytania** - Każdy test składa się z 5 losowo wybranych pytań
- 💡 **Interaktywne sprawdzanie** - Natychmiastowa walidacja odpowiedzi z kolorowym oznaczeniem
- 📊 **System punktacji** - Szczegółowe wyniki z procentowym podsumowaniem
- 🎨 **Nowoczesny design** - Responsywny interfejs z płynnymi animacjami
- 📱 **Mobile-friendly** - Pełna responsywność na wszystkich urządzeniach
- 🔄 **Udostępnianie wyników** - Możliwość udostępnienia wyniku w mediach społecznościowych

## 🎯 Zagadnienia

Quiz obejmuje następujące tematy:

### Podstawy Kotlin
- Zmienne (val/var)
- Funkcje i typy zwracane
- Nullable types i safe calls
- String templates
- Data classes

### Android Development
- Activities i lifecycle
- Views (Button, TextView, EditText)
- Event handling
- Intents i nawigacja
- Toast messages

### Zaawansowane Kotlin
- Coroutines i async programming
- Extension functions
- Lambda expressions
- Higher-order functions
- Sealed classes i enums

### Android Components
- RecyclerView i adaptery
- Fragments
- SharedPreferences
- Room Database
- Retrofit API calls

### UI Components
- Layout management
- Animation
- Custom views
- Material Design

## 🚀 Demo

Aplikacja jest dostępna online: [Quiz Kotlin](https://quiz-kotlin.vercel.app)

## 🛠️ Instalacja i uruchomienie

### Wymagania
- Przeglądarka internetowa
- Serwer HTTP (opcjonalnie dla lokalnego developmentu)

### Lokalne uruchomienie

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/karolcgm/quiz-kotlin.git
cd quiz-kotlin
```

2. **Uruchom lokalny serwer:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (jeśli masz zainstalowany http-server)
npx http-server

# Live Server w VS Code
# Kliknij prawym przyciskiem na index.html -> "Open with Live Server"
```

3. **Otwórz w przeglądarce:**
```
http://localhost:8000
```

## 📁 Struktura projektu

```
quiz-kotlin/
├── index.html          # Główny plik HTML
├── styles.css          # Style CSS z responsywnym designem
├── script.js           # Logika aplikacji i baza pytań
├── README.md           # Dokumentacja projektu
└── vercel.json         # Konfiguracja dla Vercel
```

## 🎮 Jak używać

1. **Rozpocznij quiz** - Kliknij "Rozpocznij Quiz" na stronie głównej
2. **Uzupełnij kod** - Wpisz brakujące fragmenty kodu w polach tekstowych
3. **Sprawdź odpowiedzi** - Aplikacja automatycznie sprawdzi poprawność
4. **Zobacz wyjaśnienia** - Jeśli odpowiedź jest błędna, zobaczysz poprawną wersję z wyjaśnieniem
5. **Przejdź dalej** - Kontynuuj do następnego pytania
6. **Zobacz wyniki** - Na końcu otrzymasz szczegółowe podsumowanie

## 🎨 Technologie

- **HTML5** - Struktura aplikacji
- **CSS3** - Stylizacja z Flexbox/Grid i animacjami
- **Vanilla JavaScript** - Logika aplikacji bez zewnętrznych bibliotek
- **Google Fonts** - Czcionka Inter dla lepszej czytelności

## 📱 Responsywność

Aplikacja jest w pełni responsywna i działa na:
- 💻 Komputerach desktop
- 📱 Telefonach komórkowych
- 📟 Tabletach
- 🖥️ Dużych ekranach

## 🚀 Deployment

### Vercel (Zalecane)

1. **Połącz z GitHub:**
   - Zaloguj się na [Vercel](https://vercel.com)
   - Kliknij "New Project"
   - Wybierz repozytorium GitHub

2. **Automatyczne wdrożenie:**
   - Vercel automatycznie wykryje projekt jako statyczną stronę
   - Każdy push do main branch automatycznie aktualizuje aplikację

### GitHub Pages

1. **Włącz GitHub Pages:**
   - Idź do Settings repozytorium
   - Przewiń do sekcji "Pages"
   - Wybierz source: "Deploy from a branch"
   - Wybierz branch: main

2. **Dostęp:**
   - Aplikacja będzie dostępna pod: `https://karolcgm.github.io/quiz-kotlin`

## 🤝 Współpraca

Chętnie przyjmujemy pull requesty! Jeśli chcesz dodać nowe pytania lub poprawić funkcjonalność:

1. Fork repozytorium
2. Stwórz branch dla swojej funkcji (`git checkout -b feature/nowe-pytania`)
3. Commit zmian (`git commit -am 'Dodaj nowe pytania o coroutines'`)
4. Push do branch (`git push origin feature/nowe-pytania`)
5. Stwórz Pull Request

## 📝 Dodawanie nowych pytań

Aby dodać nowe pytanie, edytuj plik `script.js` i dodaj obiekt do tablicy `questionsDatabase`:

```javascript
{
    id: 101,
    category: "Nazwa kategorii",
    code: `kod z lukami oznaczonymi _____`,
    blanks: ["odpowiedź1", "odpowiedź2"],
    explanation: "Wyjaśnienie dlaczego ta odpowiedź jest poprawna"
}
```

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik [LICENSE](LICENSE) dla szczegółów.

## 👨‍💻 Autor

**Karol** - [GitHub](https://github.com/karolcgm)

## 🙏 Podziękowania

- Społeczność Kotlin za inspirację
- JetBrains za stworzenie Kotlin
- Google za Android Development

---

⭐ **Jeśli podoba Ci się ten projekt, zostaw gwiazdkę na GitHub!** ⭐
