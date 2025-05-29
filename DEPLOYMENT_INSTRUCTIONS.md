# 🚀 Instrukcje Wdrożenia Quiz Kotlin

## 📋 Krok 1: Utwórz repozytorium na GitHub

1. **Idź na GitHub:**
   - Otwórz https://github.com/karolcgm
   - Zaloguj się na swoje konto

2. **Utwórz nowe repozytorium:**
   - Kliknij zielony przycisk **"New repository"**
   - Repository name: `quiz-kotlin`
   - Description: `Interactive Kotlin/Android code completion quiz with 100 questions`
   - Wybierz **"Public"**
   - **NIE zaznaczaj** "Initialize this repository with a README"
   - Kliknij **"Create repository"**

## 💻 Krok 2: Wyślij kod na GitHub

Po utworzeniu repozytorium, wykonaj następujące komendy w terminalu (w folderze `c:\workspace\quiz-kotlin`):

```bash
# Dodaj remote origin
git remote add origin https://github.com/karolcgm/quiz-kotlin.git

# Zmień nazwę brancha na main
git branch -M main

# Wyślij kod na GitHub
git push -u origin main
```

## 🌐 Krok 3: Wdróż na Vercel

1. **Idź na Vercel:**
   - Otwórz https://vercel.com
   - Zaloguj się (możesz użyć konta GitHub)

2. **Utwórz nowy projekt:**
   - Kliknij **"New Project"**
   - Wybierz **"Import Git Repository"**
   - Znajdź i wybierz repozytorium **"quiz-kotlin"**

3. **Konfiguracja:**
   - Project Name: `quiz-kotlin`
   - Framework Preset: **"Other"** (Vercel automatycznie wykryje statyczną stronę)
   - Root Directory: `./` (domyślnie)
   - Kliknij **"Deploy"**

4. **Gotowe!**
   - Vercel automatycznie zbuduje i wdroży aplikację
   - Otrzymasz URL typu: `https://quiz-kotlin-xxx.vercel.app`
   - Każdy push do GitHub automatycznie aktualizuje aplikację

## ✅ Weryfikacja

Po wdrożeniu sprawdź:

- ✅ Aplikacja ładuje się poprawnie
- ✅ Quiz działa (można rozpocząć test)
- ✅ Pytania się wyświetlają z fragmentami kodu
- ✅ Można uzupełniać pola input
- ✅ Walidacja działa (zielone/czerwone pola)
- ✅ Wyniki się wyświetlają
- ✅ Responsywność na mobile

## 🔧 Dodatkowe opcje

### GitHub Pages (alternatywa dla Vercel)

Jeśli wolisz GitHub Pages:

1. Idź do Settings repozytorium na GitHub
2. Przewiń do sekcji "Pages"
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/ (root)"
6. Kliknij "Save"

Aplikacja będzie dostępna pod: `https://karolcgm.github.io/quiz-kotlin`

### Aktualizacje

Aby zaktualizować aplikację:

```bash
# Wprowadź zmiany w kodzie
# Następnie:
git add .
git commit -m "Opis zmian"
git push
```

Vercel automatycznie wdroży nową wersję!

## 📞 Pomoc

Jeśli masz problemy:

1. Sprawdź czy wszystkie pliki są w repozytorium GitHub
2. Sprawdź logi wdrożenia w Vercel Dashboard
3. Upewnij się, że `vercel.json` jest poprawny
4. Sprawdź czy nie ma błędów w konsoli przeglądarki

---

🎉 **Powodzenia z wdrożeniem Quiz Kotlin!** 🎉 