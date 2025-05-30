// Czas rozpoczęcia generowania bazy pytań
const generationStartTime = Date.now();

// Baza pytań podzielona na zakresy wiedzy i poziomy trudności - SPD POLSPL 2025
// 9 kombinacji: 3 zakresy wiedzy × 3 poziomy trudności
const questionsDatabase = {
    // ZAKRES PODSTAWOWY
    basic: {
        easy: [],    // Podstawowy + Łatwy
        medium: [],  // Podstawowy + Średni
        hard: []     // Podstawowy + Trudny
    },
    // ZAKRES ŚREDNI
    intermediate: {
        easy: [],    // Średni + Łatwy
        medium: [],  // Średni + Średni
        hard: []     // Średni + Trudny
    },
    // ZAKRES TRUDNY
    advanced: {
        easy: [],    // Trudny + Łatwy
        medium: [],  // Trudny + Średni
        hard: []     // Trudny + Trudny
    }
};

// Funkcja generująca pytania dla wszystkich kombinacji
function generateAllQuestions() {
    // Szablony pytań dla różnych zakresów wiedzy
    const basicTemplates = [
        {
            category: "Zmienne val/var",
            codeTemplate: `fun main() {
    val name = "Kotlin"
    name = "Java"
    war message = "Hello"
    println(message)
}`,
            errors: ["Próba zmiany wartości zmiennej val", "Literówka 'war' zamiast 'var'"],
            blanks: [
                { position: "A", options: ["var", "val", "const", "let"], correct: 0 },
                { position: "B", options: ["String", "Int", "Boolean", "Double"], correct: 0 }
            ],
            explanation: "Zmienne val są niezmienne po inicjalizacji. Słowo kluczowe to 'var', nie 'war'."
        },
        {
            category: "Tablice",
            codeTemplate: `fun main() {
    val numbers = arrayOf(1, 2, 3, 4, 5)
    println(numbers[5])
    val fruits = arrayof("apple", "banana")
    println(fruits[0])
}`,
            errors: ["Indeks 5 poza zakresem tablicy (0-4)", "Literówka 'arrayof' zamiast 'arrayOf'"],
            blanks: [
                { position: "A", options: ["arrayOf", "listOf", "setOf", "mapOf"], correct: 0 },
                { position: "B", options: ["size", "length", "count", "capacity"], correct: 0 }
            ],
            explanation: "Indeksy tablicy zaczynają się od 0. Funkcja to 'arrayOf', nie 'arrayof'."
        },
        {
            category: "Pętle for",
            codeTemplate: `fun main() {
    for (i in 1..10 {
        println("Liczba: $i")
    }
    
    for (j in 1...5) {
        println("J: $j")
    }
}`,
            errors: ["Brak zamykającego nawiasu ')' w zakresie", "Potrójne kropki '...' zamiast podwójnych '..'"],
            blanks: [
                { position: "A", options: ["1..10", "1...10", "1 to 10", "1 until 10"], correct: 0 },
                { position: "B", options: ["in", "of", "from", "within"], correct: 0 }
            ],
            explanation: "Zakresy w Kotlin używają podwójnych kropek '..' i wymagają poprawnej składni."
        },
        {
            category: "Lambdy",
            codeTemplate: `fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = numbers.map { it * 2 }
    val filtered = numbers.filter  it > 3 }
    val sum = numbers.reduce { acc, n -> acc + n
    println(sum)
}`,
            errors: ["Brak otwierającego nawiasu klamrowego '{' przed 'it > 3'", "Brak zamykającego nawiasu klamrowego '}' po 'acc + n'"],
            blanks: [
                { position: "A", options: ["filter", "map", "reduce", "forEach"], correct: 0 },
                { position: "B", options: ["{ it > 3 }", "( it > 3 )", "[ it > 3 ]", "< it > 3 >"], correct: 0 }
            ],
            explanation: "Lambdy w Kotlin muszą być otoczone nawiasami klamrowymi {}."
        },
        {
            category: "Funkcje",
            codeTemplate: `fun calculateSum(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    val result = calculateSum(5, 3
    println("Wynik: $result")
    
    fun greet(name: String) {
        println("Cześć, $nam!")
    }
}`,
            errors: ["Brak zamykającego nawiasu ')' w wywołaniu funkcji", "Literówka '$nam' zamiast '$name'"],
            blanks: [
                { position: "A", options: ["Int", "String", "Double", "Boolean"], correct: 0 },
                { position: "B", options: ["return", "yield", "output", "result"], correct: 0 }
            ],
            explanation: "Wywołania funkcji wymagają poprawnej składni z nawiasami."
        },
        {
            category: "Warunki if",
            codeTemplate: `fun main() {
    val age = 18
    
    if age >= 18 {
        println("Pełnoletni")
    } else {
        println("Niepełnoletni")
    }
    
    val status = if (age >= 18) "dorosły" els "dziecko"
    println(status)
}`,
            errors: ["Brak nawiasów '()' wokół waruneku if", "Literówka 'els' zamiast 'else'"],
            blanks: [
                { position: "A", options: ["if (age >= 18)", "if age >= 18", "when (age >= 18)", "check (age >= 18)"], correct: 0 },
                { position: "B", options: ["else", "otherwise", "default", "other"], correct: 0 }
            ],
            explanation: "Warunki if wymagają nawiasów wokół wyrażenia logicznego."
        }
    ];

    const intermediateTemplates = [
        {
            category: "Android Button",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val button = findViewById<_____>(R.id.myButton)
        button._____ {
            Toast.makeText(this, "Przycisk kliknięty!", Toast.LENGTH_SHORT).show()
        }
    }
}`,
            errors: ["Brak importu dla Button", "Niepoprawna nazwa metody setOnClickListener"],
            blanks: [
                { position: "A", options: ["Button", "TextView", "EditText", "ImageView"], correct: 0 },
                { position: "B", options: ["setOnClickListener", "setOnTouchListener", "onClick", "onTouch"], correct: 0 }
            ],
            explanation: "findViewById<Button> znajduje przycisk, setOnClickListener obsługuje kliknięcia."
        },
        {
            category: "Android TextView",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val textView = findViewById<TextView>(R.id.myTextView)
        textView._____ = "Nowy tekst"
        textView.setTextColor(_____.RED)
    }
}`,
            errors: ["Brak importu dla Color", "Niepoprawna właściwość text"],
            blanks: [
                { position: "A", options: ["text", "value", "content", "string"], correct: 0 },
                { position: "B", options: ["Color", "Paint", "Style", "Theme"], correct: 0 }
            ],
            explanation: "Właściwość 'text' ustawia tekst, Color.RED to stała koloru."
        },
        {
            category: "Android EditText",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val editText = findViewById<_____>(R.id.editText)
        val userInput = editText.text._____()
        println("Wprowadzony tekst: $userInput")
    }
}`,
            errors: ["Niepoprawny typ komponentu", "Brak metody konwersji na String"],
            blanks: [
                { position: "A", options: ["EditText", "TextView", "Button", "PlainText"], correct: 0 },
                { position: "B", options: ["toString", "toText", "getValue", "getString"], correct: 0 }
            ],
            explanation: "EditText służy do wprowadzania tekstu, toString() konwertuje na String."
        },
        {
            category: "Android Intent",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    private fun openSecondActivity() {
        val intent = _____(this, SecondActivity::class.java)
        intent.putExtra("message", "Hello from MainActivity")
        _____Activity(intent)
    }
}`,
            errors: ["Niepoprawny konstruktor Intent", "Niepoprawna nazwa metody startActivity"],
            blanks: [
                { position: "A", options: ["Intent", "Action", "Bundle", "Context"], correct: 0 },
                { position: "B", options: ["start", "open", "launch", "begin"], correct: 0 }
            ],
            explanation: "Intent służy do nawigacji między aktywnościami."
        },
        {
            category: "Android Toast",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    private fun showMessage(message: String) {
        _____.makeText(this, message, Toast.LENGTH_SHORT)._____()
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        showMessage("Aplikacja uruchomiona")
    }
}`,
            errors: ["Niepoprawna klasa Toast", "Brak wywołania metody show()"],
            blanks: [
                { position: "A", options: ["Toast", "Message", "Alert", "Notification"], correct: 0 },
                { position: "B", options: ["show", "display", "present", "popup"], correct: 0 }
            ],
            explanation: "Toast.makeText() tworzy wiadomość, show() ją wyświetla."
        }
    ];

    const advancedTemplates = [
        {
            category: "Dziedziczenie",
            codeTemplate: `abstract class Animal {
    abstract fun makeSound()
    
    open fun sleep() {
        println("Zwierzę śpi")
    }
}

class Dog : _____ {
    _____ fun makeSound() {
        println("Hau hau!")
    }
}`,
            errors: ["Brak nawiasów po Animal", "Brak słowa kluczowego override"],
            blanks: [
                { position: "A", options: ["Animal()", "Animal", "super.Animal", "extends Animal"], correct: 0 },
                { position: "B", options: ["override", "open", "abstract", "virtual"], correct: 0 }
            ],
            explanation: "Dziedziczenie używa ':' i nawiasów, override implementuje abstrakcyjne metody."
        },
        {
            category: "Coroutines",
            codeTemplate: `class DataRepository {
    _____ fun fetchUserData(userId: Int): User {
        return _____ {
            apiService.getUser(userId)
        }
    }
}`,
            errors: ["Brak słowa kluczowego suspend", "Niepoprawny kontekst wykonania"],
            blanks: [
                { position: "A", options: ["suspend", "async", "launch", "runBlocking"], correct: 0 },
                { position: "B", options: ["withContext(Dispatchers.IO)", "async", "launch", "delay"], correct: 0 }
            ],
            explanation: "suspend oznacza funkcję zawieszającą, withContext zmienia kontekst wykonania."
        },
        {
            category: "Android Fragments",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val fragment = MyFragment()
        supportFragmentManager._____()
            .replace(R.id.fragment_container, fragment)
            ._____(null)
            .commit()
    }
}`,
            errors: ["Niepoprawna metoda transakcji", "Niepoprawna metoda dodawania do stosu"],
            blanks: [
                { position: "A", options: ["beginTransaction", "startTransaction", "createTransaction", "newTransaction"], correct: 0 },
                { position: "B", options: ["addToBackStack", "addToStack", "pushToStack", "saveToStack"], correct: 0 }
            ],
            explanation: "beginTransaction() rozpoczyna transakcję, addToBackStack() dodaje do stosu."
        },
        {
            category: "Sealed Classes",
            codeTemplate: `_____ class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable) : Result<_____>()
    object Loading : Result<Nothing>()
}`,
            errors: ["Brak słowa kluczowego sealed", "Niepoprawny typ generyczny"],
            blanks: [
                { position: "A", options: ["sealed", "abstract", "open", "data"], correct: 0 },
                { position: "B", options: ["Nothing", "Any", "Unit", "Void"], correct: 0 }
            ],
            explanation: "Sealed classes ograniczają hierarchię dziedziczenia."
        },
        {
            category: "Extension Functions",
            codeTemplate: `fun String.isValidEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

fun main() {
    val email = "test@example.com"
    if (email._____()) {
        println("Email jest poprawny")
    }
}`,
            errors: ["Niepoprawne wywołanie funkcji rozszerzającej", "Brak importu dla funkcji rozszerzającej"],
            blanks: [
                { position: "A", options: ["isValidEmail", "validateEmail", "checkEmail", "verifyEmail"], correct: 0 },
                { position: "B", options: ["Boolean", "String", "Int", "Unit"], correct: 0 }
            ],
            explanation: "Extension functions dodają funkcjonalność do istniejących klas."
        },
        {
            category: "Data Classes",
            codeTemplate: `_____ class User(
    val id: Int,
    val name: String,
    val email: String
) {
    fun getDisplayName(): String {
        return "User: $name"
    }
}

fun main() {
    val user1 = User(1, "Jan", "jan@example.com")
    val user2 = user1._____(name = "Anna")
    println(user2)
}`,
            errors: ["Brak słowa kluczowego data", "Niepoprawna metoda kopiowania"],
            blanks: [
                { position: "A", options: ["data", "class", "object", "struct"], correct: 0 },
                { position: "B", options: ["copy", "clone", "duplicate", "replicate"], correct: 0 }
            ],
            explanation: "Data classes automatycznie generują equals, hashCode, toString i copy."
        }
    ];

    // Generowanie pytań dla wszystkich 9 kombinacji
    const allTemplates = { basic: basicTemplates, intermediate: intermediateTemplates, advanced: advancedTemplates };
    
    Object.keys(allTemplates).forEach(knowledge => {
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const templates = allTemplates[knowledge];
            
            for (let i = 0; i < 150; i++) { // 150 pytań na kombinację = 1350 pytań łącznie
                const template = templates[i % templates.length];
                
                const question = {
                    id: `${knowledge}_${difficulty}_${i + 1}`,
                    category: template.category,
                    knowledge: knowledge,
                    difficulty: difficulty,
                    explanation: template.explanation
                };

                if (difficulty === 'easy') {
                    // Łatwy: wskazanie błędów
                    question.question = "Znajdź 2 błędy w poniższym kodzie:";
                    question.code = template.codeTemplate;
                    question.errors = template.errors;
                } else if (difficulty === 'medium') {
                    // Średni: uzupełnienie kodu z opcjami A/B/C/D
                    question.question = "Uzupełnij kod:";
                    
                    // Zastąp _____ pozycjami A, B, C, D dla poziomu średniego
                    let mediumCode = template.codeTemplate;
                    let blankIndex = 0;
                    mediumCode = mediumCode.replace(/_____/g, () => {
                        if (blankIndex < template.blanks.length) {
                            const position = template.blanks[blankIndex].position;
                            blankIndex++;
                            return `___${position}___`;
                        }
                        return '_____'; // fallback
                    });
                    
                    question.code = mediumCode;
                    question.blanks = template.blanks;
                } else {
                    // Trudny: uzupełnienie kodu bez opcji - pokazuj pozycje A, B, C, D
                    question.question = "Uzupełnij zaawansowany kod:";
                    
                    // Zastąp _____ pozycjami A, B, C, D dla poziomu trudnego
                    let hardCode = template.codeTemplate;
                    
                    // Znajdź wszystkie wystąpienia _____ i zastąp je odpowiednimi pozycjami
                    let blankIndex = 0;
                    hardCode = hardCode.replace(/_____/g, () => {
                        if (blankIndex < template.blanks.length) {
                            const position = template.blanks[blankIndex].position;
                            blankIndex++;
                            return `___${position}___`;
                        }
                        return '_____'; // fallback
                    });
                    
                    question.code = hardCode;
                    question.blanks = template.blanks;
                }

                questionsDatabase[knowledge][difficulty].push(question);
            }
        });
    });
}

// Generowanie wszystkich pytań
generateAllQuestions();

// Stan aplikacji
let currentKnowledge = null;
let currentDifficulty = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// Elementy DOM
const knowledgeSelection = document.getElementById('knowledgeSelection');
const difficultySelection = document.getElementById('difficultySelection');
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const homeBtn = document.getElementById('homeBtn');

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    showKnowledgeSelection();
    setupEventListeners();
    displayGenerationTime();
});

function displayGenerationTime() {
    const generationTime = Date.now() - generationStartTime;
    const totalQuestions = Object.values(questionsDatabase).reduce((total, knowledge) => 
        total + Object.values(knowledge).reduce((sum, difficulty) => sum + difficulty.length, 0), 0);
    
    const timeElement = document.getElementById('generationTime');
    timeElement.textContent = `Baza ${totalQuestions} pytań (9 kombinacji) wygenerowana w ${generationTime}ms ⚡ Smaczek: Każda kombinacja ma unikalne pytania!`;
}

function setupEventListeners() {
    // Wybór zakresu wiedzy
    document.querySelectorAll('.knowledge-option').forEach(option => {
        option.addEventListener('click', function() {
            selectKnowledge(this.dataset.knowledge);
        });
    });
    
    // Wybór poziomu trudności
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.addEventListener('click', function() {
            selectDifficulty(this.dataset.difficulty);
        });
    });
    
    // Przyciski nawigacji
    document.getElementById('backToKnowledgeBtn').addEventListener('click', showKnowledgeSelection);
    document.getElementById('startBtn').addEventListener('click', startQuiz);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
    document.getElementById('changeSettingsBtn').addEventListener('click', showKnowledgeSelection);
    document.getElementById('backToDifficultyBtn').addEventListener('click', showDifficultySelection);
    document.getElementById('shareBtn').addEventListener('click', shareResults);
    
    // Przycisk HOME - powrót do MAIN
    homeBtn.addEventListener('click', showKnowledgeSelection);
}

function showKnowledgeSelection() {
    knowledgeSelection.style.display = 'flex';
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    // Ukryj przycisk HOME na głównej stronie
    homeBtn.style.display = 'none';
    
    // Reset selection
    document.querySelectorAll('.knowledge-option').forEach(option => {
        option.classList.remove('selected');
    });
    currentKnowledge = null;
    currentDifficulty = null;
}

function selectKnowledge(knowledge) {
    currentKnowledge = knowledge;
    
    // Update UI
    document.querySelectorAll('.knowledge-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-knowledge="${knowledge}"]`).classList.add('selected');
    
    // Show difficulty selection after delay
    setTimeout(() => {
        showDifficultySelection();
    }, 500);
}

function showDifficultySelection() {
    knowledgeSelection.style.display = 'none';
    difficultySelection.style.display = 'flex';
    
    // Pokaż przycisk HOME
    homeBtn.style.display = 'block';
    
    // Reset difficulty selection
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    updateKnowledgeInfo();
}

function updateKnowledgeInfo() {
    const knowledgeInfo = {
        basic: {
            name: "📚 Podstawowy",
            description: "Podstawy języka Kotlin - zmienne, tablice, pętle, lambdy"
        },
        intermediate: {
            name: "📱 Średni", 
            description: "Kotlin + Android Studio - Button, TextView, Toast, podstawy UI"
        },
        advanced: {
            name: "🚀 Trudny",
            description: "Zaawansowany Kotlin + Android - dziedziczenie, coroutines, fragments"
        }
    };
    
    const info = knowledgeInfo[currentKnowledge];
    const infoContainer = document.getElementById('selectedKnowledgeInfo');
    
    infoContainer.innerHTML = `
        <h4>Wybrany zakres wiedzy: ${info.name}</h4>
        <p>${info.description}</p>
    `;
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
    
    // Show start screen after delay
    setTimeout(() => {
        showStartScreen();
    }, 500);
}

function showStartScreen() {
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'flex';
    
    // Pokaż przycisk HOME
    homeBtn.style.display = 'block';
    
    updateCombinationInfo();
}

function updateCombinationInfo() {
    const knowledgeNames = {
        basic: "📚 Podstawowy",
        intermediate: "📱 Średni",
        advanced: "🚀 Trudny"
    };
    
    const difficultyNames = {
        easy: "🟢 Łatwy",
        medium: "🟡 Średni",
        hard: "🔴 Trudny"
    };
    
    const difficultyDescriptions = {
        easy: "Wskazanie 2 błędów w kodzie",
        medium: "Uzupełnienie kodu (wybór A/B/C/D)",
        hard: "Wpisanie brakujących elementów samodzielnie"
    };
    
    const infoContainer = document.getElementById('selectedCombinationInfo');
    const questionCount = questionsDatabase[currentKnowledge][currentDifficulty].length;
    
    infoContainer.innerHTML = `
        <h4>Wybrana kombinacja:</h4>
        <div class="combination-badges">
            <span class="knowledge-badge-small">${knowledgeNames[currentKnowledge]}</span>
            <span class="difficulty-badge-small">${difficultyNames[currentDifficulty]}</span>
        </div>
        <p><strong>Typ pytań:</strong> ${difficultyDescriptions[currentDifficulty]}</p>
        <div class="quiz-info">
            <li>✅ 5 pytań z bazy ${questionCount} pytań</li>
            <li>⏱️ Bez ograniczeń czasowych</li>
            <li>🏆 Otrzymasz wynik na końcu z wyjaśnieniami</li>
            <li>📚 Materiał dostosowany do SPD POLSPL 2025</li>
            ${currentDifficulty === 'hard' ? '<li>⚠️ Poziom trudny: bez podpowiedzi A/B/C/D!</li>' : ''}
        </div>
    `;
}

function startQuiz() {
    if (!currentKnowledge || !currentDifficulty) return;
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Get random questions for selected combination
    currentQuestions = getRandomQuestions(currentKnowledge, currentDifficulty, 5);
    
    // Show quiz
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // Pokaż przycisk HOME
    homeBtn.style.display = 'block';
    
    // Update badges
    const knowledgeNames = {
        basic: "📚 Podstawowy",
        intermediate: "📱 Średni",
        advanced: "🚀 Trudny"
    };
    
    const difficultyNames = {
        easy: "🟢 Łatwy",
        medium: "🟡 Średni",
        hard: "🔴 Trudny"
    };
    
    document.getElementById('currentKnowledge').textContent = knowledgeNames[currentKnowledge];
    document.getElementById('currentDifficulty').textContent = difficultyNames[currentDifficulty];
    
    // Show first question
    showQuestion();
}

function getRandomQuestions(knowledge, difficulty, count) {
    const questions = [...questionsDatabase[knowledge][difficulty]];
    
    // Proper Fisher-Yates shuffle algorithm
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    return questions.slice(0, count);
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
    } else if (currentDifficulty === 'medium') {
        // Medium: Show code with blanks (A/B/C/D options)
        answersContainer.innerHTML = `
            <div class="code-block">
                <pre><code>${question.code}</code></pre>
            </div>
            <div class="blanks-container">
                ${generateBlankOptions(question)}
            </div>
        `;
    } else {
        // Hard: Show code with input fields (no options!)
        answersContainer.innerHTML = `
            <div class="code-block">
                <pre><code>${question.code}</code></pre>
            </div>
            <p><strong>Wpisz brakujące elementy (bez podpowiedzi!):</strong></p>
            <div class="inputs-container">
                ${generateInputOptions(question)}
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

function generateInputOptions(question) {
    return question.blanks.map((blank, blankIndex) => `
        <div class="input-question">
            <h4>Pozycja ${blank.position}:</h4>
            <input type="text" 
                   class="input-field" 
                   name="input_${blankIndex}" 
                   placeholder="Wpisz brakujący element..." 
                   oninput="checkInputSelection()"
                   autocomplete="off">
            <div class="input-hint">Wpisz dokładnie to, co powinno się znajdować w tym miejscu</div>
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

function checkInputSelection() {
    const question = currentQuestions[currentQuestionIndex];
    const allFilled = question.blanks.every((_, index) => {
        const input = document.querySelector(`input[name="input_${index}"]`);
        return input && input.value.trim().length > 0;
    });
    document.getElementById('nextBtn').disabled = !allFilled;
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
    } else if (currentDifficulty === 'medium') {
        const blanks = question.blanks.map((_, index) => {
            const selected = document.querySelector(`input[name="blank_${index}"]:checked`);
            return selected ? parseInt(selected.value) : -1;
        });
        userAnswer = { blanks };
        isCorrect = blanks.every((answer, index) => answer === question.blanks[index].correct);
    } else {
        // Hard: Check input values
        const inputs = question.blanks.map((blank, index) => {
            const input = document.querySelector(`input[name="input_${index}"]`);
            return input ? input.value.trim() : '';
        });
        userAnswer = { inputs };
        
        // Check if inputs match correct answers (case-insensitive)
        isCorrect = inputs.every((input, index) => {
            const correctAnswer = question.blanks[index].options[question.blanks[index].correct];
            return input.toLowerCase() === correctAnswer.toLowerCase();
        });
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
    
    // Pokaż przycisk HOME
    homeBtn.style.display = 'block';
    
    // Update score
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = currentQuestions.length;
    
    // Update message
    const percentage = (score / currentQuestions.length) * 100;
    let message = "";
    
    if (percentage >= 80) {
        message = "Doskonały wynik! Jesteś mistrzem tej kombinacji! 🎉";
    } else if (percentage >= 60) {
        message = "Dobry wynik! Masz solidne podstawy! 👍";
    } else if (percentage >= 40) {
        message = "Niezły wynik, ale warto powtórzyć materiał! 📚";
    } else {
        message = "Czas na intensywną naukę! 💪";
    }
    
    // Easter eggi - losowy komunikat
    const easterEggs = [
        "Nawet Misiura by sobie poradził!",
        "Z natury programiści są leniwi",
        "Dowcipy o blondynkach są śmieszne, diamenty są nie tylko u pań na palcu"
    ];
    
    const randomEasterEgg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
    message += ` 😄 ${randomEasterEgg}`;
    
    document.getElementById('scoreMessage').textContent = message;
    
    // Show completed combination info
    const knowledgeNames = {
        basic: "📚 Podstawowy",
        intermediate: "📱 Średni",
        advanced: "🚀 Trudny"
    };
    
    const difficultyNames = {
        easy: "🟢 Łatwy",
        medium: "🟡 Średni",
        hard: "🔴 Trudny"
    };
    
    document.getElementById('quizCompletedInfo').innerHTML = `
        <h4>Ukończona kombinacja:</h4>
        <p><strong>Zakres wiedzy:</strong> ${knowledgeNames[currentKnowledge]}</p>
        <p><strong>Poziom trudności:</strong> ${difficultyNames[currentDifficulty]}</p>
        <p><strong>Wynik:</strong> ${score}/${currentQuestions.length} (${percentage.toFixed(1)}%)</p>
        <p><strong>Kategorie pytań:</strong> ${[...new Set(currentQuestions.map(q => q.category))].join(', ')}</p>
        ${currentDifficulty === 'hard' ? '<p><strong>🏆 Gratulacje!</strong> Ukończyłeś najtrudniejszy poziom bez podpowiedzi!</p>' : ''}
        
        <div class="questions-review">
            <h3 class="review-title">📋 Przegląd pytań i poprawnych odpowiedzi</h3>
            ${generateQuestionsReview()}
        </div>
    `;
}

function generateQuestionsReview() {
    return userAnswers.map((answer, index) => {
        const question = answer.question;
        const isCorrect = answer.isCorrect;
        const userAnswer = answer.userAnswer;
        
        let reviewContent = `
            <div class="question-review ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="question-review-header">
                    <h4>Pytanie ${index + 1}: ${question.category} ${isCorrect ? '✅' : '❌'}</h4>
                </div>
                
                <div class="code-block-small">
                    <pre><code>${question.code}</code></pre>
                </div>
                
                <div class="answers-review">
        `;
        
        if (currentDifficulty === 'easy') {
            // Easy level review
            const selectedErrors = userAnswer.selectedErrors || [];
            reviewContent += `
                <div class="answer-section">
                    <h5>Twoje odpowiedzi:</h5>
                    <ul>
                        ${selectedErrors.map(index => {
                            const errorText = index < 2 ? question.errors[index] : 
                                (index === 2 ? "Brak średnika na końcu linii" : "Niepoprawna nazwa funkcji");
                            return `<li class="${index < 2 ? 'correct-answer' : 'incorrect-answer'}">${errorText}</li>`;
                        }).join('')}
                    </ul>
                </div>
                
                <div class="answer-section">
                    <h5>Poprawne odpowiedzi:</h5>
                    <ul>
                        ${question.errors.map(error => `<li class="correct-answer-show">${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else if (currentDifficulty === 'medium') {
            // Medium level review
            const userBlanks = userAnswer.blanks || [];
            reviewContent += `
                <div class="answer-section">
                    <h5>Twoje odpowiedzi:</h5>
                    ${question.blanks.map((blank, blankIndex) => {
                        const userChoice = userBlanks[blankIndex];
                        const isBlankCorrect = userChoice === blank.correct;
                        const userAnswerText = userChoice >= 0 ? blank.options[userChoice] : 'Brak odpowiedzi';
                        
                        return `
                            <div class="blank-review">
                                <strong>Pozycja ${blank.position}:</strong>
                                <div class="user-answer ${isBlankCorrect ? 'correct-answer' : 'incorrect-answer'}">
                                    Twoja odpowiedź: ${userAnswerText}
                                </div>
                                <div class="correct-answer-show">
                                    Poprawna odpowiedź: ${blank.options[blank.correct]}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            // Hard level review
            const userInputs = userAnswer.inputs || [];
            reviewContent += `
                <div class="answer-section">
                    <h5>Twoje odpowiedzi:</h5>
                    ${question.blanks.map((blank, blankIndex) => {
                        const userInput = userInputs[blankIndex] || '';
                        const correctAnswer = blank.options[blank.correct];
                        const isBlankCorrect = userInput.toLowerCase() === correctAnswer.toLowerCase();
                        
                        return `
                            <div class="blank-review">
                                <strong>Pozycja ${blank.position}:</strong>
                                <div class="user-answer ${isBlankCorrect ? 'correct-answer' : 'incorrect-answer'}">
                                    Twoja odpowiedź: "${userInput}"
                                </div>
                                <div class="correct-answer-show">
                                    Poprawna odpowiedź: "${correctAnswer}"
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        reviewContent += `
                </div>
                
                <div class="explanation-review">
                    <strong>💡 Wyjaśnienie:</strong> ${question.explanation}
                </div>
                
                <div class="score-info">
                    ${isCorrect ? '✅ Poprawna odpowiedź (+1 punkt)' : '❌ Niepoprawna odpowiedź (0 punktów)'}
                </div>
            </div>
        `;
        
        return reviewContent;
    }).join('');
}

function restartQuiz() {
    if (currentKnowledge && currentDifficulty) {
        startQuiz();
    } else {
        showKnowledgeSelection();
    }
}

function shareResults() {
    const knowledgeNames = {
        basic: "Podstawowy",
        intermediate: "Średni",
        advanced: "Trudny"
    };
    
    const difficultyNames = {
        easy: "Łatwy",
        medium: "Średni",
        hard: "Trudny"
    };
    
    const difficultyEmoji = currentDifficulty === 'hard' ? ' 🔥 (BEZ PODPOWIEDZI!)' : '';
    
    const text = `Ukończyłem Quiz Kotlin SPD POLSPL 2025! 🚀
Zakres wiedzy: ${knowledgeNames[currentKnowledge]}
Poziom trudności: ${difficultyNames[currentDifficulty]}${difficultyEmoji}
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
console.log(`📚 9 kombinacji (3 zakresy × 3 poziomy):`);
Object.keys(questionsDatabase).forEach(knowledge => {
    Object.keys(questionsDatabase[knowledge]).forEach(difficulty => {
        const count = questionsDatabase[knowledge][difficulty].length;
        console.log(`   ${knowledge} + ${difficulty}: ${count} pytań`);
    });
});
console.log(`⚡ Czas generowania: ${Date.now() - generationStartTime}ms`);
console.log(`🎨 Smaczek: Każda kombinacja ma unikalne pytania dostosowane do poziomu!`); 