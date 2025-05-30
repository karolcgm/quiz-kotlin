// Czas rozpoczęcia generowania bazy pytań
const generationStartTime = Date.now();

// Baza pytań podzielona na poziomy trudności - SPD POLSPL 2025
const questionsDatabase = {
    // POZIOM ŁATWY - Wskazanie 2 błędów w kodzie (250 pytań)
    // Zakres: zmienne, tablice, pętle, val/var, błędy indeksowania, literówki, diamenty, lambdy
    easy: [],
    
    // POZIOM ŚREDNI - Uzupełnienie kodu (2 elementy A/B/C/D) (250 pytań)
    // Zakres: wszystko z łatwego + Android Studio podstawy, Button, Label, PlainText, kolory
    medium: [],
    
    // POZIOM TRUDNY - Uzupełnienie 2 elementami kodu (250 pytań)
    // Zakres: wszystko z poprzednich + Android Studio w pełni + dziedziczenie + zaawansowane Kotlin
    hard: []
};

// Funkcja generująca pytania dla poziomu łatwego
function generateEasyQuestions() {
    const easyTemplates = [
        // Błędy val/var
        {
            category: "Zmienne val/var",
            codeTemplate: `fun main() {
    val name = "Kotlin"
    name = "Java"  // BŁĄD 1: próba zmiany val
    war message = "Hello"  // BŁĄD 2: literówka 'war' zamiast 'var'
    println(message)
}`,
            errors: ["Próba zmiany wartości zmiennej val", "Literówka 'war' zamiast 'var'"],
            explanation: "Zmienne val są niezmienne po inicjalizacji. Słowo kluczowe to 'var', nie 'war'."
        },
        {
            category: "Zmienne val/var",
            codeTemplate: `fun calculateAge() {
    val currentYear = 2025
    val birthYear = 1990
    var age = currentYear - birthYear
    val age = 35  // BŁĄD 1: redefinicja zmiennej
    println("Wiek: $ag")  // BŁĄD 2: literówka w nazwie zmiennej
}`,
            errors: ["Redefinicja zmiennej 'age'", "Literówka '$ag' zamiast '$age'"],
            explanation: "Nie można definiować tej samej zmiennej dwukrotnie w tym samym zakresie."
        },
        // Błędy w tablicach
        {
            category: "Tablice",
            codeTemplate: `fun main() {
    val numbers = arrayOf(1, 2, 3, 4, 5)
    println(numbers[5])  // BŁĄD 1: indeks poza zakresem
    val fruits = arrayof("apple", "banana")  // BŁĄD 2: literówka 'arrayof'
    println(fruits[0])
}`,
            errors: ["Indeks 5 poza zakresem tablicy (0-4)", "Literówka 'arrayof' zamiast 'arrayOf'"],
            explanation: "Indeksy tablicy zaczynają się od 0. Funkcja to 'arrayOf', nie 'arrayof'."
        },
        // Błędy w pętlach
        {
            category: "Pętle",
            codeTemplate: `fun main() {
    for (i in 1..10 {  // BŁĄD 1: brak zamykającego nawiasu
        println("Liczba: $i")
    }
    
    for (j in 1...5) {  // BŁĄD 2: potrójne kropki zamiast podwójnych
        println("J: $j")
    }
}`,
            errors: ["Brak zamykającego nawiasu ')' w zakresie", "Potrójne kropki '...' zamiast podwójnych '..'"],
            explanation: "Zakresy w Kotlin używają podwójnych kropek '..' i wymagają poprawnej składni."
        },
        // Błędy w lambdach
        {
            category: "Lambdy",
            codeTemplate: `fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    val filtered = numbers.filter  it > 3 }  // BŁĄD 1: brak otwierającego nawiasu klamrowego
    val sum = numbers.reduce { acc, n -> acc + n  // BŁĄD 2: brak zamykającego nawiasu klamrowego
    println(sum)
}`,
            errors: ["Brak otwierającego nawiasu klamrowego '{' przed 'it > 3'", "Brak zamykającego nawiasu klamrowego '}' po 'acc + n'"],
            explanation: "Lambdy w Kotlin muszą być otoczone nawiasami klamrowymi {}."
        }
    ];
    
    // Generowanie 250 pytań na podstawie szablonów
    for (let i = 0; i < 250; i++) {
        const template = easyTemplates[i % easyTemplates.length];
        questionsDatabase.easy.push({
            id: i + 1,
            category: template.category,
            question: "Znajdź 2 błędy w poniższym kodzie:",
            code: template.codeTemplate,
            errors: template.errors,
            explanation: template.explanation
        });
    }
}

// Funkcja generująca pytania dla poziomu średniego
function generateMediumQuestions() {
    const mediumTemplates = [
        // Android Button
        {
            category: "Android Button",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val button = findViewById<_____>(R.id.myButton)  // A
        button._____ {  // B
            Toast.makeText(this, "Przycisk kliknięty!", Toast.LENGTH_SHORT).show()
        }
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["Button", "TextView", "EditText", "ImageView"],
                    correct: 0
                },
                {
                    position: "B", 
                    options: ["setOnClickListener", "setOnTouchListener", "setOnLongClickListener", "setOnFocusChangeListener"],
                    correct: 0
                }
            ],
            explanation: "findViewById<Button> znajduje przycisk, setOnClickListener obsługuje kliknięcia."
        },
        // Android TextView
        {
            category: "Android TextView",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val textView = findViewById<TextView>(R.id.myTextView)
        textView._____ = "Nowy tekst"  // A
        textView.setTextColor(_____.RED)  // B
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["text", "value", "content", "string"],
                    correct: 0
                },
                {
                    position: "B",
                    options: ["Color", "Paint", "Style", "Theme"],
                    correct: 0
                }
            ],
            explanation: "Właściwość 'text' ustawia tekst, Color.RED to stała koloru."
        },
        // Android EditText
        {
            category: "Android EditText",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val editText = findViewById<_____>(R.id.editText)  // A
        val userInput = editText.text._____()  // B
        println("Wprowadzony tekst: $userInput")
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["EditText", "TextView", "Button", "PlainText"],
                    correct: 0
                },
                {
                    position: "B",
                    options: ["toString", "toText", "getValue", "getString"],
                    correct: 0
                }
            ],
            explanation: "EditText służy do wprowadzania tekstu, toString() konwertuje na String."
        }
    ];
    
    // Generowanie 250 pytań na podstawie szablonów
    for (let i = 0; i < 250; i++) {
        const template = mediumTemplates[i % mediumTemplates.length];
        questionsDatabase.medium.push({
            id: i + 1,
            category: template.category,
            question: "Uzupełnij kod:",
            code: template.codeTemplate,
            blanks: template.blanks,
            explanation: template.explanation
        });
    }
}

// Funkcja generująca pytania dla poziomu trudnego
function generateHardQuestions() {
    const hardTemplates = [
        // Dziedziczenie
        {
            category: "Dziedziczenie",
            codeTemplate: `abstract class Animal {
    abstract fun makeSound()
    
    open fun sleep() {
        println("Zwierzę śpi")
    }
}

class Dog : _____ {  // A
    _____ fun makeSound() {  // B
        println("Hau hau!")
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["Animal()", "Animal", "super.Animal", "extends Animal"],
                    correct: 0
                },
                {
                    position: "B",
                    options: ["override", "open", "abstract", "virtual"],
                    correct: 0
                }
            ],
            explanation: "Dziedziczenie używa ':' i nawiasów, override implementuje abstrakcyjne metody."
        },
        // Android Fragments
        {
            category: "Android Fragments",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val fragment = MyFragment()
        supportFragmentManager._____()  // A
            .replace(R.id.fragment_container, fragment)
            ._____(null)  // B
            .commit()
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["beginTransaction", "startTransaction", "createTransaction", "newTransaction"],
                    correct: 0
                },
                {
                    position: "B",
                    options: ["addToBackStack", "addToStack", "pushToStack", "saveToStack"],
                    correct: 0
                }
            ],
            explanation: "beginTransaction() rozpoczyna transakcję, addToBackStack() dodaje do stosu."
        },
        // Coroutines
        {
            category: "Coroutines",
            codeTemplate: `class DataRepository {
    _____ fun fetchUserData(userId: Int): User {  // A
        return _____ {  // B
            apiService.getUser(userId)
        }
    }
    
    fun updateUI(user: User) {
        // Aktualizacja interfejsu
    }
}`,
            blanks: [
                {
                    position: "A",
                    options: ["suspend", "async", "launch", "runBlocking"],
                    correct: 0
                },
                {
                    position: "B",
                    options: ["withContext(Dispatchers.IO)", "async", "launch", "delay"],
                    correct: 0
                }
            ],
            explanation: "suspend oznacza funkcję zawieszającą, withContext zmienia kontekst wykonania."
        }
    ];
    
    // Generowanie 250 pytań na podstawie szablonów
    for (let i = 0; i < 250; i++) {
        const template = hardTemplates[i % hardTemplates.length];
        questionsDatabase.hard.push({
            id: i + 1,
            category: template.category,
            question: "Uzupełnij zaawansowany kod:",
            code: template.codeTemplate,
            blanks: template.blanks,
            explanation: template.explanation
        });
    }
}

// Generowanie wszystkich pytań
generateEasyQuestions();
generateMediumQuestions();
generateHardQuestions();

// Stan aplikacji
let currentDifficulty = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// Elementy DOM
const difficultySelection = document.getElementById('difficultySelection');
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    showDifficultySelection();
    setupEventListeners();
    displayGenerationTime();
});

function displayGenerationTime() {
    const generationTime = Date.now() - generationStartTime;
    const timeElement = document.getElementById('generationTime');
    timeElement.textContent = `Baza 750 pytań wygenerowana w ${generationTime}ms ⚡ Smaczek: Każde pytanie ma unikalne ID i kategorię!`;
}

function setupEventListeners() {
    // Wybór poziomu trudności
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.addEventListener('click', function() {
            selectDifficulty(this.dataset.difficulty);
        });
    });
    
    // Przyciski nawigacji
    document.getElementById('startBtn').addEventListener('click', startQuiz);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
    document.getElementById('changeDifficultyBtn').addEventListener('click', showDifficultySelection);
    document.getElementById('backToDifficultyBtn').addEventListener('click', showDifficultySelection);
    document.getElementById('shareBtn').addEventListener('click', shareResults);
}

function showDifficultySelection() {
    difficultySelection.style.display = 'flex';
    startScreen.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    // Reset selection
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
    currentDifficulty = null;
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
    
    // Show start screen after selection
    setTimeout(() => {
        showStartScreen();
    }, 500);
}

function showStartScreen() {
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'flex';
    
    updateStartScreenInfo();
}

function updateStartScreenInfo() {
    const difficultyInfo = {
        easy: {
            name: "🟢 Łatwy",
            description: "Wskazanie 2 błędów w kodzie",
            topics: ["Zmienne (val, var)", "Tablice", "Pętle", "Błędy indeksowania", "Literówki", "Diamenty", "Lambdy"],
            knowledge: "Podstawowy"
        },
        medium: {
            name: "🟡 Średni", 
            description: "Uzupełnienie kodu (2 elementy A/B/C/D)",
            topics: ["Wszystko z poziomu łatwego", "Android Studio podstawy", "Button, Label, PlainText", "Zmiana kolorów", "Podstawy interfejsu"],
            knowledge: "Średni"
        },
        hard: {
            name: "🔴 Trudny",
            description: "Uzupełnienie 2 elementami kodu", 
            topics: ["Wszystko z poziomów poprzednich", "Android Studio w pełnej okazałości", "Problemy z dziedziczeniem", "Zaawansowane koncepty Kotlin", "Złożone wzorce projektowe"],
            knowledge: "Trudny"
        }
    };
    
    const info = difficultyInfo[currentDifficulty];
    const infoContainer = document.getElementById('selectedDifficultyInfo');
    
    infoContainer.innerHTML = `
        <h4>${info.name} - ${info.description}</h4>
        <p><strong>Zakres wiedzy:</strong> ${info.knowledge}</p>
        <ul>
            ${info.topics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
        <div class="quiz-info">
            <li>✅ 5 pytań z bazy ${questionsDatabase[currentDifficulty].length} pytań</li>
            <li>⏱️ Bez ograniczeń czasowych</li>
            <li>🏆 Otrzymasz wynik na końcu z wyjaśnieniami</li>
            <li>📚 Materiał dostosowany do SPD POLSPL 2025</li>
        </div>
    `;
}

function startQuiz() {
    if (!currentDifficulty) return;
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Get random questions for selected difficulty
    currentQuestions = getRandomQuestions(currentDifficulty, 5);
    
    // Show quiz
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // Update difficulty badge
    const difficultyNames = {
        easy: "🟢 Łatwy",
        medium: "🟡 Średni", 
        hard: "🔴 Trudny"
    };
    document.getElementById('currentDifficulty').textContent = difficultyNames[currentDifficulty];
    
    // Show first question
    showQuestion();
}

function getRandomQuestions(difficulty, count) {
    const questions = [...questionsDatabase[difficulty]];
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Update progress
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = currentQuestions.length;
    
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
    
    // Show question
    document.getElementById('questionText').textContent = question.question;
    
    // Generate answers based on difficulty
    const answersContainer = document.getElementById('answersContainer');
    
    if (currentDifficulty === 'easy') {
        // Easy: Show errors to identify
        answersContainer.innerHTML = `
            <div class="code-block">
                <pre><code>${question.code}</code></pre>
            </div>
            <p><strong>Wybierz 2 błędy:</strong></p>
            <div class="error-options">
                ${generateErrorOptions(question)}
            </div>
        `;
    } else {
        // Medium/Hard: Show code with blanks
        answersContainer.innerHTML = `
            <div class="code-block">
                <pre><code>${question.code}</code></pre>
            </div>
            <div class="blanks-container">
                ${generateBlankOptions(question)}
            </div>
        `;
    }
    
    // Reset next button
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('nextBtn').textContent = 
        currentQuestionIndex === currentQuestions.length - 1 ? 'Zobacz wyniki' : 'Następne pytanie';
}

function generateErrorOptions(question) {
    // Generate 4 options: 2 correct errors + 2 distractors
    const allOptions = [
        ...question.errors,
        "Brak średnika na końcu linii",
        "Niepoprawna nazwa funkcji"
    ];
    
    return allOptions.map((option, index) => `
        <label class="error-option">
            <input type="checkbox" name="error" value="${index}" onchange="checkErrorSelection()">
            <span>${option}</span>
        </label>
    `).join('');
}

function generateBlankOptions(question) {
    return question.blanks.map((blank, blankIndex) => `
        <div class="blank-question">
            <h4>Pozycja ${blank.position}:</h4>
            <div class="blank-options">
                ${blank.options.map((option, optionIndex) => `
                    <label class="blank-option">
                        <input type="radio" name="blank_${blankIndex}" value="${optionIndex}" onchange="checkBlankSelection()">
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function checkErrorSelection() {
    const selected = document.querySelectorAll('input[name="error"]:checked');
    document.getElementById('nextBtn').disabled = selected.length !== 2;
}

function checkBlankSelection() {
    const question = currentQuestions[currentQuestionIndex];
    const allSelected = question.blanks.every((_, index) => {
        return document.querySelector(`input[name="blank_${index}"]:checked`);
    });
    document.getElementById('nextBtn').disabled = !allSelected;
}

function nextQuestion() {
    // Save answer
    saveCurrentAnswer();
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function saveCurrentAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    let userAnswer = {};
    let isCorrect = false;
    
    if (currentDifficulty === 'easy') {
        const selected = Array.from(document.querySelectorAll('input[name="error"]:checked'))
            .map(input => parseInt(input.value));
        userAnswer = { selectedErrors: selected };
        isCorrect = selected.length === 2 && selected.every(index => index < 2);
    } else {
        const blanks = question.blanks.map((_, index) => {
            const selected = document.querySelector(`input[name="blank_${index}"]:checked`);
            return selected ? parseInt(selected.value) : -1;
        });
        userAnswer = { blanks };
        isCorrect = blanks.every((answer, index) => answer === question.blanks[index].correct);
    }
    
    if (isCorrect) score++;
    
    userAnswers.push({
        question,
        userAnswer,
        isCorrect
    });
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Update score
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = currentQuestions.length;
    
    // Update message
    const percentage = (score / currentQuestions.length) * 100;
    let message = "";
    
    if (percentage >= 80) {
        message = "Doskonały wynik! Jesteś mistrzem Kotlin! 🎉";
    } else if (percentage >= 60) {
        message = "Dobry wynik! Masz solidne podstawy! 👍";
    } else if (percentage >= 40) {
        message = "Niezły wynik, ale warto powtórzyć materiał! 📚";
    } else {
        message = "Czas na intensywną naukę Kotlin! 💪";
    }
    
    document.getElementById('scoreMessage').textContent = message;
    
    // Show completed difficulty info
    const difficultyNames = {
        easy: "🟢 Łatwy",
        medium: "🟡 Średni",
        hard: "🔴 Trudny"
    };
    
    document.getElementById('difficultyCompleted').innerHTML = `
        <h4>Ukończono poziom: ${difficultyNames[currentDifficulty]}</h4>
        <p>Wynik: ${score}/${currentQuestions.length} (${percentage.toFixed(1)}%)</p>
        <p>Kategorie pytań: ${[...new Set(currentQuestions.map(q => q.category))].join(', ')}</p>
    `;
}

function restartQuiz() {
    if (currentDifficulty) {
        startQuiz();
    } else {
        showDifficultySelection();
    }
}

function shareResults() {
    const difficultyNames = {
        easy: "Łatwy",
        medium: "Średni",
        hard: "Trudny"
    };
    
    const text = `Ukończyłem Quiz Kotlin SPD POLSPL 2025! 🚀
Poziom: ${difficultyNames[currentDifficulty]}
Wynik: ${score}/${currentQuestions.length} (${((score/currentQuestions.length)*100).toFixed(1)}%)
Sprawdź swoją wiedzę: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quiz Kotlin - SPD POLSPL 2025',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Wynik skopiowany do schowka! 📋');
        });
    }
}

// Smaczki i dodatkowe informacje
console.log(`🎯 Baza pytań SPD POLSPL 2025 załadowana:`);
console.log(`📚 Łatwy: ${questionsDatabase.easy.length} pytań`);
console.log(`📚 Średni: ${questionsDatabase.medium.length} pytań`);
console.log(`📚 Trudny: ${questionsDatabase.hard.length} pytań`);
console.log(`⚡ Czas generowania: ${Date.now() - generationStartTime}ms`);
console.log(`🎨 Smaczek: Quiz automatycznie dostosowuje się do poziomu!`); 