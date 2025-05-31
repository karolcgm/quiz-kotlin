// Czas rozpoczęcia generowania bazy pytań
const generationStartTime = Date.now();

// NOWA BAZA ĆWICZEŃ - 50 statycznych przykładów z 4 miejscami do uzupełnienia
// Zakres: pierwiastek, data, Toast, findViewById, Button, EditText, Math.sqrt, SimpleDateFormat
const practiceExercises = [
    {
        id: "practice_1",
        title: "Obliczanie pierwiastka - podstawy",
        description: "Aplikacja obliczająca pierwiastek kwadratowy z liczby",
        code: `package com.example.appab

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val p = findViewById<___A___>(R.id.p)

        p.setOnClickListener {
            val e = findViewById<___B___>(R.id.e)
            val inputText = e.text.toString().replace(',', '.')
            val number = inputText.toDouble()
            val root = ___C___.sqrt(number)
            ___D___.makeText(applicationContext, "Pierwiastek z \\$number to \\$root", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "EditText", options: ["EditText", "Button", "TextView", "ImageButton"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        explanation: "findViewById<Button> znajduje przycisk, EditText pobiera tekst, Math.sqrt() oblicza pierwiastek, Toast wyświetla komunikat."
    },
    {
        id: "practice_2",
        title: "Przełącznik START/STOP",
        description: "Przycisk zmieniający tekst i kolor",
        code: `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var isStarted = ___A___

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btn = findViewById<Button>(R.id.myButton)

        btn.___B___ = "START"
        btn.setBackgroundColor(Color.GREEN)

        btn.setOnClickListener {
            if (!isStarted) {
                btn.text = "STOP"
                btn.setBackgroundColor(Color.___C___)
                isStarted = ___D___
            } else {
                btn.text = "START"
                btn.setBackgroundColor(Color.GREEN)
                isStarted = false
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "false", options: ["false", "true", "null", "0"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "label"] },
            { position: "C", correct: "RED", options: ["RED", "BLUE", "YELLOW", "BLACK"] },
            { position: "D", correct: "true", options: ["true", "false", "1", "null"] }
        ],
        explanation: "Zmienna Boolean przechowuje stan, text ustawia tekst przycisku, Color.RED to czerwony kolor, true oznacza aktywny stan."
    },
    {
        id: "practice_3",
        title: "Walidacja danych wejściowych",
        description: "Sprawdzanie poprawności liczby przed obliczeniem pierwiastka",
        code: `package pl.polsl.mojaaplikacjia

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val p = findViewById<Button>(R.id.p)

        p.setOnClickListener {
            val e = findViewById<EditText>(R.id.e)
            val liczba = e.text.toString().___A___()

            if (liczba != ___B___ && liczba >= 0) {
                val pierwiastek = Math.___C___(liczba)
                Toast.makeText(applicationContext, "√\\$liczba = \\$pierwiastek", Toast.___D___).show()
            } else {
                Toast.makeText(applicationContext, "Wpisz poprawną liczbę (>= 0)", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toInt", "toString"] },
            { position: "B", correct: "null", options: ["null", "0", "false", "empty"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "toDoubleOrNull() bezpiecznie konwertuje na Double, null oznacza brak wartości, sqrt() to pierwiastek, LENGTH_SHORT to krótki czas wyświetlania."
    },
    {
        id: "practice_4",
        title: "Formatowanie daty",
        description: "Wyświetlanie aktualnej daty w formacie dd.MM.yyyy",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val d = findViewById<Button>(R.id.d)

        d.setOnClickListener {
            val currentDate = ___A___("dd.MM.yyyy", Locale.getDefault()).___B___(___C___())
            ___D___.makeText(applicationContext, currentDate, Toast.LENGTH_SHORT).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "SimpleDateFormat", options: ["SimpleDateFormat", "DateFormat", "Calendar", "LocalDate"] },
            { position: "B", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "C", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        explanation: "SimpleDateFormat formatuje daty, format() konwertuje Date na String, Date() tworzy aktualną datę, Toast wyświetla komunikat."
    },
    {
        id: "practice_5",
        title: "Obsługa kliknięć przycisku",
        description: "Podstawowa obsługa zdarzeń w Android",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val button = ___A___<Button>(R.id.myButton)

        button.___B___ {
            ___C___.makeText(___D___, "Przycisk został kliknięty!", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "B", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setClickListener", "onClickListener"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Notification"] },
            { position: "D", correct: "this", options: ["this", "context", "applicationContext", "activity"] }
        ],
        explanation: "findViewById znajduje widok, setOnClickListener obsługuje kliknięcia, Toast wyświetla komunikat, this odnosi się do aktywności."
    }
];

// Generuj pozostałe 45 ćwiczeń programowo z różnymi wariantami tego samego zakresu
for (let i = 6; i <= 50; i++) {
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
    
    const descriptions = [
        "Odczytywanie danych wprowadzonych przez użytkownika", "Dynamiczna zmiana wyglądu przycisku", 
        "Bezpieczna konwersja tekstu na liczbę", "Sprawdzanie warunków i wykonywanie różnych akcji", 
        "Podstawowe obliczenia matematyczne", "Obliczanie pierwiastka z sprawdzeniem", 
        "Formatowanie daty", "Wyświetlanie komunikatu", "Obsługa przycisku", 
        "Pobieranie tekstu", "Operacje matematyczne", "Praca z datą i czasem", 
        "Znajdowanie widoków", "Zmiana kolorów", "Konwersja typów", 
        "Komunikaty użytkownika", "Zdarzenia kliknięć", "Kontekst aplikacji", 
        "Metody tekstowe", "Instrukcje warunkowe", "Modyfikacja widoków", 
        "Funkcje matematyczne", "Aktualna data", "Ustawienia regionalne", 
        "Kolory tła", "Kolory tekstu", "Operacje na stringach", 
        "Typy danych", "Zasoby aplikacji", "Cykl życia aktywności", 
        "Układ interfejsu", "Identyfikatory zasobów", "Stan aplikacji", 
        "Klasy bazowe", "Importy bibliotek", "Zmienne prywatne", 
        "Deklaracje zmiennych", "Formatowanie tekstu", "Obsługa błędów", 
        "Typy logiczne", "Liczby zmiennoprzecinkowe", "Liczby całkowite", 
        "Tworzenie komunikatów", "Metody wyświetlania", "Referencje kontekstu"
    ];
    
    // Różne warianty kodu z tym samym zakresem materiału
    const codeVariants = [
        // Wariant 1: Pierwiastek z różnymi elementami
        `package com.example.app${i}

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val calculateBtn = ___A___<Button>(R.id.calculateBtn)
        val numberEdit = findViewById<EditText>(R.id.numberEdit)

        calculateBtn.setOnClickListener {
            val input = numberEdit.___B___.toString()
            val num = input.toDoubleOrNull()
            if (num != null && num >= 0) {
                val result = Math.___C___(num)
                Toast.makeText(this, "√\\$num = \\$result", Toast.___D___).show()
            }
        }
    }
}`,
        // Wariant 2: Data z różnymi formatami
        `import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val dateBtn = findViewById<___A___>(R.id.dateBtn)

        dateBtn.setOnClickListener {
            val formatter = SimpleDateFormat("___B___", Locale.getDefault())
            val today = formatter.format(___C___())
            ___D___.makeText(applicationContext, "Dzisiaj: \\$today", Toast.LENGTH_LONG).show()
        }
    }
}`,
        // Wariant 3: Przycisk z kolorami
        `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val colorBtn = findViewById<Button>(R.id.colorBtn)
        
        colorBtn.___A___ {
            colorBtn.setBackgroundColor(Color.___B___)
            colorBtn.___C___ = "Kliknięty!"
            colorBtn.setTextColor(Color.___D___)
        }
    }
}`,
        // Wariant 4: EditText z walidacją
        `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val inputField = findViewById<___A___>(R.id.inputField)
        val submitBtn = findViewById<Button>(R.id.submitBtn)

        submitBtn.setOnClickListener {
            val userText = inputField.___B___.toString()
            if (userText.isNotEmpty()) {
                ___C___.makeText(this, "Wprowadzono: \\$userText", Toast.___D___).show()
            } else {
                Toast.makeText(this, "Pole nie może być puste!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        // Wariant 5: Operacje matematyczne
        `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val num1 = findViewById<EditText>(R.id.num1)
        val num2 = findViewById<EditText>(R.id.num2)
        val calcBtn = findViewById<___A___>(R.id.calcBtn)

        calcBtn.setOnClickListener {
            val a = num1.text.toString().___B___()
            val b = num2.text.toString().toDoubleOrNull()
            if (a != null && b != null) {
                val result = Math.___C___(a, b)
                Toast.makeText(this, "Wynik: \\$result", Toast.___D___).show()
            }
        }
    }
}`
    ];
    
    // Różne zestawy blanks dla każdego wariantu
    const blankSets = [
        // Blanks dla wariantu 1 (pierwiastek)
        [
            { position: "A", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 2 (data)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "dd/MM/yyyy", options: ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd.MM.yyyy"] },
            { position: "C", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 3 (kolory)
        [
            { position: "A", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setListener", "onTouch"] },
            { position: "B", correct: "YELLOW", options: ["YELLOW", "RED", "BLUE", "GREEN"] },
            { position: "C", correct: "text", options: ["text", "label", "title", "content"] },
            { position: "D", correct: "BLACK", options: ["BLACK", "WHITE", "GRAY", "CYAN"] }
        ],
        // Blanks dla wariantu 4 (EditText)
        [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 5 (matematyka)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toInt", "toNumber"] },
            { position: "C", correct: "pow", options: ["pow", "sqrt", "abs", "max"] },
            { position: "D", correct: "LENGTH_LONG", options: ["LENGTH_LONG", "LENGTH_SHORT", "LONG", "SHORT"] }
        ]
    ];
    
    // Wybierz wariant na podstawie indeksu
    const variantIndex = (i - 6) % codeVariants.length;
    let selectedCode = codeVariants[variantIndex];
    
    practiceExercises.push({
        id: `practice_${i}`,
        title: titles[(i - 6) % titles.length],
        description: descriptions[(i - 6) % descriptions.length],
        code: selectedCode,
        blanks: blankSets[variantIndex],
        explanation: `Przykład ${i}: ${descriptions[(i - 6) % descriptions.length]} - podstawowe elementy Android/Kotlin zgodnie z zakresem SPD POLSPL 2025.`
    });
}

console.log('🎯 NOWA BAZA: Wygenerowano', practiceExercises.length, 'prostych ćwiczeń z zakresu podstawowego!');
console.log('📚 Zakres: pierwiastek, data, Toast, findViewById, Button, EditText, Math.sqrt, SimpleDateFormat');

// Baza pytań dla quizu (uproszczona wersja)
const questionsDatabase = {
    basic: {
        easy: [],
        medium: [],
        hard: []
    },
    intermediate: {
        easy: [],
        medium: [],
        hard: []
    },
    advanced: {
        easy: [],
        medium: [],
        hard: []
    }
};

// Szablony pytań dla quizu
const questionTemplates = {
    basic: [
        {
            category: "findViewById",
            codeTemplate: `val button = _____(R.id.button)`,
            blanks: [{ position: "A", correct: "findViewById<Button>", options: ["findViewById<Button>", "findView<Button>", "getButton", "Button.find"] }]
        },
        {
            category: "Toast",
            codeTemplate: `_____.makeText(this, "Hello", Toast.LENGTH_SHORT).show()`,
            blanks: [{ position: "A", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }]
        }
    ],
    intermediate: [
        {
            category: "Math.sqrt",
            codeTemplate: `val result = _____.sqrt(number)`,
            blanks: [{ position: "A", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] }]
        }
    ],
    advanced: [
        {
            category: "SimpleDateFormat",
            codeTemplate: `val formatter = _____(\"dd.MM.yyyy\", Locale.getDefault())`,
            blanks: [{ position: "A", correct: "SimpleDateFormat", options: ["SimpleDateFormat", "DateFormat", "Calendar", "LocalDate"] }]
        }
    ]
};

// Generowanie pytań dla quizu
function generateAllQuestions() {
    Object.keys(questionsDatabase).forEach(knowledge => {
        Object.keys(questionsDatabase[knowledge]).forEach(difficulty => {
            const templates = questionTemplates[knowledge] || [];
            
            templates.forEach((template, index) => {
                for (let i = 0; i < 5; i++) { // 5 pytań na szablon
                    const question = {
                        id: `${knowledge}_${difficulty}_${index}_${i}`,
                        category: template.category,
                        question: `Uzupełnij kod:`,
                        code: template.codeTemplate,
                        blanks: template.blanks,
                        explanation: `Podstawy Android/Kotlin - ${template.category}`
                    };
                    
                    questionsDatabase[knowledge][difficulty].push(question);
                }
            });
        });
    });
}

generateAllQuestions();

// Stan aplikacji
let currentKnowledge = null;
let currentDifficulty = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let usedQuestionIds = new Map();

// Stan aplikacji ćwiczeń
let currentPracticeIndex = 0;
let practiceAnswers = [];
let showingSolution = false;

// Elementy DOM
const knowledgeSelection = document.getElementById('knowledgeSelection');
const difficultySelection = document.getElementById('difficultySelection');
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const practiceContainer = document.getElementById('practiceContainer');
const homeBtn = document.getElementById('homeBtn');

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    showKnowledgeSelection();
    setupEventListeners();
});

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
    
    // NOWE: Przyciski dla ćwiczeń
    document.getElementById('practiceBtn').addEventListener('click', startPracticeMode);
    document.getElementById('practiceNextBtn').addEventListener('click', nextPracticeExercise);
    document.getElementById('practicePrevBtn').addEventListener('click', prevPracticeExercise);
    document.getElementById('practiceCheckBtn').addEventListener('click', checkPracticeAnswers);
    document.getElementById('practiceShowSolutionBtn').addEventListener('click', showPracticeSolution);
    document.getElementById('practiceBackBtn').addEventListener('click', showKnowledgeSelection);
    
    // Przycisk HOME
    homeBtn.addEventListener('click', showKnowledgeSelection);
}

function showKnowledgeSelection() {
    knowledgeSelection.style.display = 'flex';
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    practiceContainer.style.display = 'none';
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
    
    setTimeout(() => {
        showDifficultySelection();
    }, 500);
}

function showDifficultySelection() {
    knowledgeSelection.style.display = 'none';
    difficultySelection.style.display = 'flex';
    homeBtn.style.display = 'block';
    
    // Reset difficulty selection
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
    
    setTimeout(() => {
        showStartScreen();
    }, 500);
}

function showStartScreen() {
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'flex';
    homeBtn.style.display = 'block';
}

function startQuiz() {
    if (!currentKnowledge || !currentDifficulty) return;
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    // Get random questions
    const allQuestions = questionsDatabase[currentKnowledge][currentDifficulty];
    currentQuestions = allQuestions.slice(0, 5); // Pierwsze 5 pytań
    
    // Show quiz
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    homeBtn.style.display = 'block';
    
    showQuestion();
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    document.getElementById('questionNumber').textContent = `${currentQuestionIndex + 1}`;
    document.getElementById('totalQuestions').textContent = `${currentQuestions.length}`;
    document.getElementById('questionText').textContent = question.question;
    
    // Wyświetl kod z miejscami do uzupełnienia
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    // Dodaj kod
    const codeDiv = document.createElement('div');
    codeDiv.className = 'code-block';
    const preElement = document.createElement('pre');
    const codeInnerElement = document.createElement('code');
    codeInnerElement.textContent = question.code;
    preElement.appendChild(codeInnerElement);
    codeDiv.appendChild(preElement);
    answersContainer.appendChild(codeDiv);
    
    // Generuj opcje odpowiedzi
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    question.blanks.forEach(blank => {
        const blankDiv = document.createElement('div');
        blankDiv.className = 'blank-section';
        blankDiv.innerHTML = `<h4>Pozycja ${blank.position}:</h4>`;
        
        blank.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => selectOption(blank.position, option, button);
            blankDiv.appendChild(button);
        });
        
        optionsContainer.appendChild(blankDiv);
    });
    
    answersContainer.appendChild(optionsContainer);
    
    // Aktualizuj przycisk Next
    updateNextButton();
}

function selectOption(position, option, button) {
    // Usuń poprzednie zaznaczenie dla tej pozycji
    const blankSection = button.parentElement;
    blankSection.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Zaznacz wybraną opcję
    button.classList.add('selected');
    
    // Zapisz odpowiedź
    if (!userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex] = {};
    }
    userAnswers[currentQuestionIndex][position] = option;
    
    // Aktualizuj przycisk Next
    updateNextButton();
}

function updateNextButton() {
    const question = currentQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex] || {};
    
    // Sprawdź czy wszystkie pozycje są uzupełnione
    const allAnswered = question.blanks.every(blank => userAnswer[blank.position]);
    
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = !allAnswered;
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.textContent = allAnswered ? 'Zobacz wyniki' : 'Uzupełnij wszystkie pola';
    } else {
        nextBtn.textContent = allAnswered ? 'Następne pytanie' : 'Uzupełnij wszystkie pola';
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Oblicz wynik
    let correctAnswers = 0;
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index] || {};
        let questionCorrect = true;
        
        question.blanks.forEach(blank => {
            if (userAnswer[blank.position] !== blank.correct) {
                questionCorrect = false;
            }
        });
        
        if (questionCorrect) correctAnswers++;
    });
    
    score = Math.round((correctAnswers / currentQuestions.length) * 100);
    
    document.getElementById('finalScore').textContent = `${score}%`;
    document.getElementById('correctCount').textContent = `${correctAnswers} z ${currentQuestions.length}`;
}

function restartQuiz() {
    showKnowledgeSelection();
}

// NOWE FUNKCJE DLA ĆWICZEŃ
function startPracticeMode() {
    currentPracticeIndex = 0;
    practiceAnswers = [];
    showingSolution = false;
    
    knowledgeSelection.style.display = 'none';
    practiceContainer.style.display = 'block';
    homeBtn.style.display = 'block';
    
    showPracticeExercise();
}

function showPracticeExercise() {
    const exercise = practiceExercises[currentPracticeIndex];
    
    document.getElementById('practiceTitle').textContent = exercise.title;
    document.getElementById('practiceDescription').textContent = exercise.description;
    document.getElementById('practiceProgress').textContent = `${currentPracticeIndex + 1} / ${practiceExercises.length}`;
    
    // Aktualizuj pasek postępu
    const progressPercent = ((currentPracticeIndex + 1) / practiceExercises.length) * 100;
    document.getElementById('practiceProgressBar').style.width = `${progressPercent}%`;
    
    // Wyświetl kod
    const codeElement = document.getElementById('practiceCode');
    codeElement.innerHTML = '';
    const preElement = document.createElement('pre');
    const codeInnerElement = document.createElement('code');
    codeInnerElement.textContent = exercise.code;
    preElement.appendChild(codeInnerElement);
    codeElement.appendChild(preElement);
    
    // Generuj pola do uzupełnienia
    const answersContainer = document.getElementById('practiceBlanks');
    answersContainer.innerHTML = '';
    
    exercise.blanks.forEach(blank => {
        const blankDiv = document.createElement('div');
        blankDiv.className = 'practice-blank';
        blankDiv.innerHTML = `
            <label>Pozycja ${blank.position}:</label>
            <select id="blank_${blank.position}">
                <option value="">-- Wybierz --</option>
                ${blank.options.map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
        `;
        answersContainer.appendChild(blankDiv);
    });
    
    // Ukryj wyniki i wyjaśnienia
    document.getElementById('practiceResult').style.display = 'none';
    document.getElementById('practiceExplanation').style.display = 'none';
    showingSolution = false;
    
    // Aktualizuj przyciski nawigacji
    document.getElementById('practicePrevBtn').disabled = currentPracticeIndex === 0;
    document.getElementById('practiceNextBtn').disabled = currentPracticeIndex === practiceExercises.length - 1;
}

function nextPracticeExercise() {
    if (currentPracticeIndex < practiceExercises.length - 1) {
        savePracticeAnswers();
        currentPracticeIndex++;
        showPracticeExercise();
    }
}

function prevPracticeExercise() {
    if (currentPracticeIndex > 0) {
        savePracticeAnswers();
        currentPracticeIndex--;
        showPracticeExercise();
    }
}

function savePracticeAnswers() {
    const exercise = practiceExercises[currentPracticeIndex];
    const answers = {};
    
    exercise.blanks.forEach(blank => {
        const select = document.getElementById(`blank_${blank.position}`);
        if (select) {
            answers[blank.position] = select.value;
        }
    });
    
    practiceAnswers[currentPracticeIndex] = answers;
}

function checkPracticeAnswers() {
    savePracticeAnswers();
    const exercise = practiceExercises[currentPracticeIndex];
    const userAnswers = practiceAnswers[currentPracticeIndex] || {};
    
    let correct = 0;
    let total = exercise.blanks.length;
    
    exercise.blanks.forEach(blank => {
        const select = document.getElementById(`blank_${blank.position}`);
        const isCorrect = userAnswers[blank.position] === blank.correct;
        
        // Pokoloruj odpowiedzi
        if (select) {
            select.style.backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
            select.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
        }
        
        if (isCorrect) correct++;
    });
    
    // Pokaż wynik
    const resultText = `Wynik: ${correct}/${total} (${Math.round(correct/total*100)}%)`;
    
    const resultDiv = document.getElementById('practiceResult');
    resultDiv.textContent = resultText;
    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = correct === total ? '#d4edda' : '#fff3cd';
    resultDiv.style.borderColor = correct === total ? '#28a745' : '#ffc107';
    resultDiv.style.border = '1px solid';
    resultDiv.style.padding = '10px';
    resultDiv.style.borderRadius = '5px';
    resultDiv.style.marginTop = '20px';
}

function showPracticeSolution() {
    const exercise = practiceExercises[currentPracticeIndex];
    const explanationDiv = document.getElementById('practiceExplanation');
    const explanationText = document.getElementById('practiceExplanationText');
    
    if (!showingSolution) {
        // Pokaż rozwiązanie
        explanationText.innerHTML = `
            <div class="solution-blanks">
                ${exercise.blanks.map(blank => 
                    `<div><strong>Pozycja ${blank.position}:</strong> ${blank.correct}</div>`
                ).join('')}
            </div>
            <div class="solution-explanation">
                <strong>Wyjaśnienie:</strong> ${exercise.explanation}
            </div>
        `;
        explanationDiv.style.display = 'block';
        document.getElementById('practiceShowSolutionBtn').textContent = 'Ukryj rozwiązanie';
        showingSolution = true;
    } else {
        // Ukryj rozwiązanie
        explanationDiv.style.display = 'none';
        document.getElementById('practiceShowSolutionBtn').textContent = '💡 Pokaż rozwiązanie';
        showingSolution = false;
    }
}
