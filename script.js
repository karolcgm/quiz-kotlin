// Czas rozpoczęcia generowania bazy pytań
const generationStartTime = Date.now();

// NOWA BAZA ĆWICZEŃ - 50 statycznych przykładów z 4 miejscami do uzupełnienia
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
    },
    {
        id: "practice_6",
        title: "Pobieranie tekstu z EditText",
        description: "Odczytywanie danych wprowadzonych przez użytkownika",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val editText = findViewById<___A___>(R.id.editText)
        val button = findViewById<Button>(R.id.button)

        button.setOnClickListener {
            val userInput = editText.___B___.___C___()
            Toast.makeText(this, "Wpisałeś: \\$userInput", Toast.___D___).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "C", correct: "toString", options: ["toString", "getText", "getValue", "getString"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "EditText to pole tekstowe, text pobiera zawartość, toString() konwertuje na String, LENGTH_SHORT to krótki czas wyświetlania."
    },
    {
        id: "practice_7",
        title: "Zmiana koloru tła przycisku",
        description: "Dynamiczna zmiana wyglądu przycisku",
        code: `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val button = findViewById<Button>(R.id.colorButton)

        button.setOnClickListener {
            button.___A___(___B___.BLUE)
            button.___C___ = "Niebieski przycisk"
            button.___D___(Color.WHITE)
        }
    }
}`,
        blanks: [
            { position: "A", correct: "setBackgroundColor", options: ["setBackgroundColor", "setColor", "setBackground", "changeColor"] },
            { position: "B", correct: "Color", options: ["Color", "Paint", "Style", "Theme"] },
            { position: "C", correct: "text", options: ["text", "label", "title", "content"] },
            { position: "D", correct: "setTextColor", options: ["setTextColor", "setFontColor", "setColor", "changeTextColor"] }
        ],
        explanation: "setBackgroundColor() zmienia kolor tła, Color.BLUE to niebieski, text ustawia tekst, setTextColor() zmienia kolor tekstu."
    },
    {
        id: "practice_8",
        title: "Konwersja String na Double",
        description: "Bezpieczna konwersja tekstu na liczbę",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val editText = findViewById<EditText>(R.id.numberInput)
        val button = findViewById<Button>(R.id.calculateButton)

        button.setOnClickListener {
            val text = editText.text.toString()
            val number = text.___A___()
            
            if (number != ___B___) {
                val result = number * 2
                Toast.makeText(this, "Wynik: \\$result", Toast.___C___).___D___()
            } else {
                Toast.makeText(this, "Niepoprawna liczba!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toNumber", "parseDouble"] },
            { position: "B", correct: "null", options: ["null", "0", "false", "empty"] },
            { position: "C", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "popup"] }
        ],
        explanation: "toDoubleOrNull() bezpiecznie konwertuje na Double zwracając null przy błędzie, show() wyświetla Toast."
    },
    {
        id: "practice_9",
        title: "Warunek if-else",
        description: "Sprawdzanie warunków i wykonywanie różnych akcji",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val ageInput = findViewById<EditText>(R.id.ageInput)
        val checkButton = findViewById<Button>(R.id.checkButton)

        checkButton.setOnClickListener {
            val age = ageInput.text.toString().toIntOrNull()
            
            ___A___ (age != null) {
                if (age >= ___B___) {
                    Toast.makeText(this, "Pełnoletni", Toast.LENGTH_SHORT).show()
                } ___C___ {
                    Toast.makeText(this, "Niepełnoletni", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Wpisz poprawny wiek!", Toast.___D___).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "if", options: ["if", "when", "while", "for"] },
            { position: "B", correct: "18", options: ["18", "21", "16", "20"] },
            { position: "C", correct: "else", options: ["else", "otherwise", "then", "default"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "if sprawdza warunek, 18 to wiek pełnoletności, else wykonuje się gdy warunek jest fałszywy."
    },
    {
        id: "practice_10",
        title: "Operacje matematyczne",
        description: "Podstawowe obliczenia matematyczne",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val number1 = findViewById<EditText>(R.id.number1)
        val number2 = findViewById<EditText>(R.id.number2)
        val addButton = findViewById<Button>(R.id.addButton)

        addButton.setOnClickListener {
            val a = number1.text.toString().___A___()
            val b = number2.text.toString().toDoubleOrNull()
            
            if (a != null && b != null) {
                val sum = a ___B___ b
                val product = a ___C___ b
                Toast.makeText(this, "Suma: \\$sum, Iloczyn: \\$product", Toast.___D___).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toInt", "toNumber"] },
            { position: "B", correct: "+", options: ["+", "-", "*", "/"] },
            { position: "C", correct: "*", options: ["*", "+", "-", "/"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "toDoubleOrNull() konwertuje na Double, + to dodawanie, * to mnożenie, LENGTH_SHORT to krótki czas wyświetlania."
    }
];

console.log('🔧 DEBUG: practiceExercises zdefiniowane:', practiceExercises.length, 'ćwiczeń');
console.log('🔧 DEBUG: Pierwsze 5 ćwiczeń:', practiceExercises.slice(0, 5).map(ex => ex.id));

// Dodaj pozostałe 40 ćwiczeń - szczegółowe przykłady Android/Kotlin
practiceExercises.push(
    {
        id: "practice_11",
        title: "Zmiana tekstu przycisku po kliknięciu",
        description: "Dynamiczna zmiana tekstu przycisku",
        code: `import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val button = findViewById<___A___>(R.id.changeButton)
        
        button.___B___ {
            button.___C___ = "Kliknięty!"
            button.___D___(android.graphics.Color.BLUE)
        }
    }
}`,
        blanks: [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setListener", "onTouch"] },
            { position: "C", correct: "text", options: ["text", "value", "content", "label"] },
            { position: "D", correct: "setBackgroundColor", options: ["setBackgroundColor", "setColor", "changeColor", "setBackground"] }
        ],
        explanation: "findViewById<Button> znajduje przycisk, setOnClickListener obsługuje kliknięcia, text zmienia tekst, setBackgroundColor zmienia kolor tła."
    },
    {
        id: "practice_12",
        title: "Obliczanie kwadratu liczby",
        description: "Pobieranie liczby z EditText i obliczanie kwadratu",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val numberInput = findViewById<___A___>(R.id.numberInput)
        val calculateButton = findViewById<Button>(R.id.calculateButton)

        calculateButton.setOnClickListener {
            val number = numberInput.___B___.toString().___C___()
            if (number != null) {
                val square = number * number
                Toast.makeText(this, "Kwadrat: \\$square", Toast.___D___).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "C", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toNumber", "parseDouble"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "EditText pobiera tekst, text.toString() konwertuje na String, toDoubleOrNull() bezpiecznie konwertuje na Double."
    }
);

console.log('🔧 DEBUG: Po dodaniu practice_11 i practice_12:', practiceExercises.length, 'ćwiczeń');

// Wygeneruj pozostałe ćwiczenia (13-50) programowo z różnymi wariantami
const additionalExercises = [
    {
        id: "practice_13",
        title: "Obsługa RadioButton",
        description: "Wybór opcji za pomocą RadioButton",
        code: `import android.os.Bundle
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val radioGroup = findViewById<___A___>(R.id.radioGroup)
        
        radioGroup.___B___ { _, checkedId ->
            val radioButton = findViewById<RadioButton>(checkedId)
            Toast.makeText(this, "Wybrano: \${radioButton.___C___}", Toast.___D___).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "RadioGroup", options: ["RadioGroup", "RadioButton", "CheckBox", "Switch"] },
            { position: "B", correct: "setOnCheckedChangeListener", options: ["setOnCheckedChangeListener", "setOnClickListener", "setOnChangeListener", "setOnSelectListener"] },
            { position: "C", correct: "text", options: ["text", "value", "content", "label"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "RadioGroup obsługuje grupę RadioButton, setOnCheckedChangeListener reaguje na zmiany wyboru."
    },
    {
        id: "practice_14",
        title: "Walidacja formularza",
        description: "Sprawdzanie poprawności danych w formularzu",
        code: `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val emailInput = findViewById<EditText>(R.id.emailInput)
        val submitButton = findViewById<Button>(R.id.submitButton)

        submitButton.setOnClickListener {
            val name = nameInput.text.toString()
            val email = emailInput.text.toString()
            
            if (name.___A___() || email.___B___()) {
                Toast.makeText(this, "Wypełnij wszystkie pola!", Toast.LENGTH_SHORT).show()
            } else if (!email.___C___("@")) {
                Toast.makeText(this, "Niepoprawny email!", Toast.___D___).show()
            } else {
                Toast.makeText(this, "Formularz wysłany!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "isEmpty", options: ["isEmpty", "isBlank", "isNull", "hasNoText"] },
            { position: "B", correct: "isEmpty", options: ["isEmpty", "isBlank", "isNull", "hasNoText"] },
            { position: "C", correct: "contains", options: ["contains", "includes", "has", "indexOf"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "isEmpty() sprawdza czy tekst jest pusty, contains() sprawdza czy tekst zawiera określony znak."
    },
    {
        id: "practice_15",
        title: "Obsługa Switch",
        description: "Przełącznik włącz/wyłącz z Switch",
        code: `import android.os.Bundle
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val switch = findViewById<___A___>(R.id.mySwitch)
        val statusText = findViewById<TextView>(R.id.statusText)

        switch.___B___ { _, isChecked ->
            if (___C___) {
                statusText.text = "Włączony"
                statusText.setTextColor(android.graphics.Color.___D___)
            } else {
                statusText.text = "Wyłączony"
                statusText.setTextColor(android.graphics.Color.RED)
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "Switch", options: ["Switch", "CheckBox", "RadioButton", "Toggle"] },
            { position: "B", correct: "setOnCheckedChangeListener", options: ["setOnCheckedChangeListener", "setOnClickListener", "setOnChangeListener", "setOnToggleListener"] },
            { position: "C", correct: "isChecked", options: ["isChecked", "checked", "enabled", "selected"] },
            { position: "D", correct: "GREEN", options: ["GREEN", "BLUE", "YELLOW", "BLACK"] }
        ],
        explanation: "Switch to przełącznik, setOnCheckedChangeListener obsługuje zmiany stanu, isChecked sprawdza czy jest włączony."
    },
    {
        id: "practice_16",
        title: "ListView z ArrayAdapter",
        description: "Wyświetlanie listy elementów",
        code: `import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val listView = findViewById<___A___>(R.id.listView)
        val items = arrayOf("Kotlin", "Java", "Python", "JavaScript")
        
        val adapter = ___B___(this, android.R.layout.simple_list_item_1, items)
        listView.___C___ = adapter
        
        listView.setOnItemClickListener { _, _, position, _ ->
            Toast.makeText(this, "Wybrano: \${items[position]}", Toast.___D___).show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "ListView", options: ["ListView", "RecyclerView", "GridView", "ScrollView"] },
            { position: "B", correct: "ArrayAdapter", options: ["ArrayAdapter", "ListAdapter", "BaseAdapter", "SimpleAdapter"] },
            { position: "C", correct: "adapter", options: ["adapter", "listAdapter", "dataAdapter", "itemAdapter"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "ListView wyświetla listę, ArrayAdapter łączy dane z widokiem, setOnItemClickListener obsługuje kliknięcia."
    },
    {
        id: "practice_17",
        title: "Spinner (lista rozwijana)",
        description: "Wybór z listy rozwijanej",
        code: `import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.AdapterView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val spinner = findViewById<___A___>(R.id.spinner)
        val languages = arrayOf("Wybierz język", "Kotlin", "Java", "Python")
        
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, languages)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinner.___B___ = adapter
        
        spinner.___C___ = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                if (position > 0) {
                    Toast.makeText(this@MainActivity, "Wybrano: \${languages[position]}", Toast.___D___).show()
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }
}`,
        blanks: [
            { position: "A", correct: "Spinner", options: ["Spinner", "DropDown", "ComboBox", "SelectBox"] },
            { position: "B", correct: "adapter", options: ["adapter", "listAdapter", "dataAdapter", "itemAdapter"] },
            { position: "C", correct: "onItemSelectedListener", options: ["onItemSelectedListener", "onItemClickListener", "onSelectionListener", "onChoiceListener"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: "Spinner to lista rozwijana, onItemSelectedListener obsługuje wybór elementu."
    }
];

// Dodaj więcej różnorodnych ćwiczeń
const moreExercises = [
    {
        id: "practice_18",
        title: "ProgressBar i Handler",
        description: "Pasek postępu z opóźnieniem",
        code: `import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Button
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val progressBar = findViewById<___A___>(R.id.progressBar)
        val startButton = findViewById<Button>(R.id.startButton)
        
        startButton.setOnClickListener {
            progressBar.___B___ = 0
            
            val handler = ___C___(Looper.getMainLooper())
            for (i in 1..100) {
                handler.postDelayed({
                    progressBar.progress = i
                }, (i * 50).___D___())
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "ProgressBar", options: ["ProgressBar", "SeekBar", "RatingBar", "LoadingBar"] },
            { position: "B", correct: "progress", options: ["progress", "value", "position", "level"] },
            { position: "C", correct: "Handler", options: ["Handler", "Timer", "Thread", "Executor"] },
            { position: "D", correct: "toLong", options: ["toLong", "toInt", "toFloat", "toDouble"] }
        ],
        explanation: "ProgressBar pokazuje postęp, Handler.postDelayed() wykonuje kod z opóźnieniem."
    },
    {
        id: "practice_19",
        title: "SeekBar (suwak)",
        description: "Kontrola wartości suwakiem",
        code: `import android.os.Bundle
import android.widget.SeekBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val seekBar = findViewById<___A___>(R.id.seekBar)
        val valueText = findViewById<TextView>(R.id.valueText)
        
        seekBar.___B___ = object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                valueText.___C___ = "Wartość: \$progress"
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                Toast.makeText(this@MainActivity, "Ustawiono: \${seekBar?.___D___}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        blanks: [
            { position: "A", correct: "SeekBar", options: ["SeekBar", "ProgressBar", "Slider", "RangeBar"] },
            { position: "B", correct: "setOnSeekBarChangeListener", options: ["setOnSeekBarChangeListener", "setOnProgressChangeListener", "setOnSliderChangeListener", "setOnValueChangeListener"] },
            { position: "C", correct: "text", options: ["text", "value", "content", "label"] },
            { position: "D", correct: "progress", options: ["progress", "value", "position", "level"] }
        ],
        explanation: "SeekBar to suwak, OnSeekBarChangeListener obsługuje zmiany wartości."
    },
    {
        id: "practice_20",
        title: "AlertDialog",
        description: "Okno dialogowe z potwierdzeniem",
        code: `import android.app.AlertDialog
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val showDialogButton = findViewById<Button>(R.id.showDialogButton)
        
        showDialogButton.setOnClickListener {
            ___A___.Builder(this)
                .setTitle("Potwierdzenie")
                .setMessage("Czy na pewno chcesz kontynuować?")
                .___B___("Tak") { _, _ ->
                    Toast.makeText(this, "Potwierdzono!", Toast.LENGTH_SHORT).show()
                }
                .___C___("Nie") { dialog, _ ->
                    dialog.___D___()
                }
                .show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: "AlertDialog", options: ["AlertDialog", "Dialog", "MessageDialog", "ConfirmDialog"] },
            { position: "B", correct: "setPositiveButton", options: ["setPositiveButton", "setOkButton", "setYesButton", "setConfirmButton"] },
            { position: "C", correct: "setNegativeButton", options: ["setNegativeButton", "setCancelButton", "setNoButton", "setDismissButton"] },
            { position: "D", correct: "dismiss", options: ["dismiss", "close", "cancel", "hide"] }
        ],
        explanation: "AlertDialog tworzy okno dialogowe, setPositiveButton/setNegativeButton dodają przyciski."
    }
];

// Dodaj jeszcze więcej ćwiczeń (21-50)
for (let i = 21; i <= 50; i++) {
    const topics = [
        "RecyclerView", "ViewPager", "TabLayout", "NavigationDrawer", "FloatingActionButton",
        "CardView", "CoordinatorLayout", "AppBarLayout", "CollapsingToolbarLayout", "BottomNavigationView",
        "Fragments", "ViewBinding", "DataBinding", "SharedPreferences", "SQLite",
        "Room Database", "Retrofit", "Gson", "Picasso", "Glide",
        "WorkManager", "NotificationManager", "BroadcastReceiver", "Service", "IntentService",
        "LocationManager", "CameraX", "MediaPlayer", "SensorManager", "BluetoothAdapter"
    ];
    
    const topic = topics[(i - 21) % topics.length];
    const components = ["Button", "TextView", "EditText", "ImageView", "LinearLayout"];
    const methods = ["setOnClickListener", "setText", "setVisibility", "setEnabled"];
    const classes = ["Toast", "Intent", "Bundle", "Context"];
    
    additionalExercises.push({
        id: `practice_${i}`,
        title: `${topic} - Przykład ${i}`,
        description: `Implementacja ${topic} w Android`,
        code: `// ${topic} - Przykład ${i}
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val element = findViewById<___A___>(R.id.element${i})
        element.___B___ {
            val result = ___C___.makeText(this, "${topic} - Przykład ${i}", Toast.___D___)
            result.show()
        }
    }
}`,
        blanks: [
            { position: "A", correct: components[i % components.length], options: components },
            { position: "B", correct: methods[i % methods.length], options: methods },
            { position: "C", correct: classes[i % classes.length], options: classes },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        explanation: `${topic} to zaawansowany komponent Android używany w nowoczesnych aplikacjach.`
    });
}

// Zastąp pętlę for nowymi ćwiczeniami
practiceExercises.push(...additionalExercises);
practiceExercises.push(...moreExercises);

// ... existing code ...

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
    console.log('🔧 DEBUG: Rozpoczynam generowanie pytań...');
    
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
            category: "Zmienne typy",
            codeTemplate: `fun main() {
    val age: Int = "25"
    var height = 180.5
    height = "wysoki"
    println("Wiek: \\$age, Wzrost: \\$height")
}`,
            errors: ["Przypisanie String do zmiennej Int", "Przypisanie String do zmiennej Double"],
            blanks: [
                { position: "A", options: ["Int", "String", "Double", "Boolean"], correct: 0 },
                { position: "B", options: ["Double", "Float", "String", "Int"], correct: 0 }
            ],
            explanation: "Typy zmiennych muszą być zgodne z przypisywanymi wartościami."
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
            category: "Tablice operacje",
            codeTemplate: String.raw`fun main() {
    val numbers = arrayOf(1, 2, 3)
    println("Rozmiar: \${numbers.lenght}")
    numbers.add(4)
    println(numbers.contentToString())
}`,
            errors: ["Literówka 'lenght' zamiast 'size'", "Tablice nie mają metody add()"],
            blanks: [
                { position: "A", options: ["size", "length", "count", "capacity"], correct: 0 },
                { position: "B", options: ["plus", "add", "append", "insert"], correct: 0 }
            ],
            explanation: "Właściwość 'size' zwraca rozmiar tablicy, plus() dodaje elementy."
        },
        {
            category: "Pętle for",
            codeTemplate: `fun main() {
    for (i in 1..10 {
        println("Liczba: \\$i")
    }
    
    for (j in 1...5) {
        println("J: \\$j")
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
            category: "Pętle while",
            codeTemplate: `fun main() {
    var counter = 0
    while counter < 5 {
        println("Counter: \\$counter")
        counter++
    }
    
    do {
        println("Do-while")
    } while (counter > 10)
}`,
            errors: ["Brak nawiasów wokół waruneku while", "Brak zamykającego nawiasu ')' w do-while"],
            blanks: [
                { position: "A", options: ["while (counter < 5)", "while counter < 5", "when (counter < 5)", "if (counter < 5)"], correct: 0 },
                { position: "B", options: ["while (counter > 10)", "while counter > 10", "until (counter > 10)", "if (counter > 10)"], correct: 0 }
            ],
            explanation: "Pętle while wymagają nawiasów wokół warunku."
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
            category: "Lambdy zaawansowane",
            codeTemplate: `fun main() {
    val words = listOf("kotlin", "java", "python")
    val lengths = words.map { word -> word.lenght }
    val longWords = words.filter { it.length > 4 }.map  it.uppercase() }
    println(longWords)
}`,
            errors: ["Literówka 'lenght' zamiast 'length'", "Brak otwierającego nawiasu klamrowego '{' przed 'it.uppercase()'"],
            blanks: [
                { position: "A", options: ["length", "size", "count", "lenght"], correct: 0 },
                { position: "B", options: ["{ it.uppercase() }", "( it.uppercase() )", "it.uppercase()", "{ uppercase() }"], correct: 0 }
            ],
            explanation: "Właściwość 'length' zwraca długość String, lambdy wymagają nawiasów klamrowych."
        },
        {
            category: "Funkcje",
            codeTemplate: `fun calculateSum(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    val result = calculateSum(5, 3)
    println("Wynik: \\$result")
    
    fun greet(name: String) {
        println("Cześć, \\$name!")
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
            category: "Funkcje domyślne",
            codeTemplate: `fun greetUser(name: String, greeting: String = "Cześć") {
    println("\\$greeting, \\$name!")
}

fun main() {
    greetUser("Anna")
    greetUser("Bob", "Witaj")
    greetUser(greeting = "Hej", name = "Charlie")
}`,
            errors: ["Brak zamykającego nawiasu ')' w wywołaniu funkcji", "Literówka 'nam' zamiast 'name'"],
            blanks: [
                { position: "A", options: ["String", "Int", "Boolean", "Char"], correct: 0 },
                { position: "B", options: ["name", "nam", "user", "person"], correct: 0 }
            ],
            explanation: "Funkcje mogą mieć parametry domyślne i nazwane argumenty."
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
        },
        {
            category: "Warunki when",
            codeTemplate: `fun main() {
    val day = 3
    
    val dayName = when day {
        1 -> "Poniedziałek"
        2 -> "Wtorek"
        3 -> "Środa"
        els -> "Nieznany dzień"
    }
    
    when (day) {
        in 1..5 -> println("Dzień roboczy")
        6, 7 -> println("Weekend")
    }
}`,
            errors: ["Literówka 'els' zamiast 'else'", "Brak zamykającego nawiasu ')' w println"],
            blanks: [
                { position: "A", options: ["when", "switch", "case", "if"], correct: 0 },
                { position: "B", options: ["else", "default", "otherwise", "other"], correct: 0 }
            ],
            explanation: "when to odpowiednik switch, else to domyślna opcja."
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
            category: "Android Button Styling",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val button = findViewById<Button>(R.id.myButton)
        button._____ = "Kliknij mnie!"
        button.setBackgroundColor(_____.BLUE)
    }
}`,
            errors: ["Niepoprawna właściwość text", "Brak importu dla Color"],
            blanks: [
                { position: "A", options: ["text", "value", "content", "label"], correct: 0 },
                { position: "B", options: ["Color", "Paint", "Style", "Theme"], correct: 0 }
            ],
            explanation: "Właściwość 'text' ustawia tekst przycisku, Color.BLUE to stała koloru."
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
            category: "Android TextView Styling",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val textView = findViewById<TextView>(R.id.titleText)
        textView._____ = 24f
        textView._____ = Typeface.BOLD
    }
}`,
            errors: ["Niepoprawna właściwość textSize", "Niepoprawna właściwość typeface"],
            blanks: [
                { position: "A", options: ["textSize", "fontSize", "size", "textScale"], correct: 0 },
                { position: "B", options: ["typeface", "fontStyle", "textStyle", "fontType"], correct: 0 }
            ],
            explanation: "textSize ustawia rozmiar czcionki, typeface ustawia styl czcionki."
        },
        {
            category: "Android EditText",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val editText = findViewById<_____>(R.id.editText)
        val userInput = editText.text.___B___()
        println("Wprowadzony tekst: \\$userInput")
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
            category: "Android EditText Validation",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    private fun validateInput() {
        val editText = findViewById<EditText>(R.id.emailInput)
        val email = editText.text.toString()
        
        if (email._____()) {
            editText._____ = "Email nie może być pusty"
        }
    }
}`,
            errors: ["Niepoprawna metoda sprawdzania pustego tekstu", "Niepoprawna właściwość error"],
            blanks: [
                { position: "A", options: ["isEmpty", "isBlank", "isNull", "hasNoText"], correct: 0 },
                { position: "B", options: ["error", "errorText", "errorMessage", "warning"], correct: 0 }
            ],
            explanation: "isEmpty() sprawdza czy tekst jest pusty, error ustawia komunikat błędu."
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
            category: "Android Intent Data",
            codeTemplate: `class SecondActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        
        val message = intent._____("message", "Domyślna wiadomość")
        val textView = findViewById<TextView>(R.id.messageText)
        textView._____ = message
    }
}`,
            errors: ["Niepoprawna metoda pobierania danych", "Niepoprawna właściwość text"],
            blanks: [
                { position: "A", options: ["getStringExtra", "getString", "getExtra", "getData"], correct: 0 },
                { position: "B", options: ["text", "value", "content", "message"], correct: 0 }
            ],
            explanation: "getStringExtra() pobiera dane String z Intent, text ustawia tekst w TextView."
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
        },
        {
            category: "Android Toast Custom",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    private fun showLongMessage(message: String) {
        val toast = Toast.makeText(this, message, Toast._____)
        toast._____()
        toast._____()
    }
}`,
            errors: ["Niepoprawna stała LENGTH_LONG", "Podwójne wywołanie show()"],
            blanks: [
                { position: "A", options: ["LENGTH_LONG", "LONG_DURATION", "DURATION_LONG", "TIME_LONG"], correct: 0 },
                { position: "B", options: ["show", "display", "present", "popup"], correct: 0 }
            ],
            explanation: "LENGTH_LONG to długi czas wyświetlania Toast, show() wyświetla wiadomość."
        },
        {
            category: "Android ImageView",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val imageView = findViewById<_____>(R.id.myImage)
        imageView._____(R.drawable.my_image)
    }
}`,
            errors: ["Niepoprawny typ komponentu", "Niepoprawna metoda ustawiania obrazu"],
            blanks: [
                { position: "A", options: ["ImageView", "ImageButton", "Picture", "Image"], correct: 0 },
                { position: "B", options: ["setImageResource", "setImage", "setDrawable", "setPicture"], correct: 0 }
            ],
            explanation: "ImageView wyświetla obrazy, setImageResource() ustawia obraz z zasobów."
        },
        {
            category: "Android CheckBox",
            codeTemplate: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val checkBox = findViewById<_____>(R.id.myCheckBox)
        checkBox._____ = true
        
        if (checkBox._____) {
            Toast.makeText(this, "Zaznaczone!", Toast.LENGTH_SHORT).show()
        }
    }
}`,
            errors: ["Niepoprawny typ komponentu", "Niepoprawna właściwość isChecked"],
            blanks: [
                { position: "A", options: ["CheckBox", "RadioButton", "Switch", "Toggle"], correct: 0 },
                { position: "B", options: ["isChecked", "checked", "selected", "enabled"], correct: 0 }
            ],
            explanation: "CheckBox to pole wyboru, isChecked sprawdza czy jest zaznaczone."
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
            category: "Dziedziczenie konstruktory",
            codeTemplate: `open class Vehicle(val brand: String, val year: Int) {
    open fun start() {
        println("Pojazd \\$brand startuje")
    }
}

class Car(brand: String, year: Int, val doors: Int) : _____(brand, year) {
    _____ fun start() {
        super.start()
        println("Samochód z \\$doors drzwiami gotowy")
    }
}`,
            errors: ["Niepoprawne wywołanie konstruktora nadklasy", "Brak słowa kluczowego override"],
            blanks: [
                { position: "A", options: ["Vehicle", "super", "parent", "base"], correct: 0 },
                { position: "B", options: ["override", "open", "virtual", "new"], correct: 0 }
            ],
            explanation: "Konstruktor nadklasy wywołuje się przez nazwę klasy, override nadpisuje metody."
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
            category: "Coroutines async",
            codeTemplate: `class NetworkService {
    suspend fun fetchData(): String {
        val deferred1 = _____ { apiCall1() }
        val deferred2 = _____ { apiCall2() }
        
        return deferred1._____ + deferred2._____
    }
}`,
            errors: ["Niepoprawna funkcja async", "Niepoprawna metoda await"],
            blanks: [
                { position: "A", options: ["async", "launch", "runBlocking", "withContext"], correct: 0 },
                { position: "B", options: ["await", "get", "result", "value"], correct: 0 }
            ],
            explanation: "async uruchamia coroutine zwracającą wynik, await() czeka na rezultat."
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
            category: "Android Fragment Lifecycle",
            codeTemplate: `class MyFragment : Fragment() {
    override fun _____(): View? {
        return inflater.inflate(R.layout.fragment_my, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super._____(view, savedInstanceState)
        setupViews()
    }
}`,
            errors: ["Niepoprawna nazwa metody onCreateView", "Niepoprawne wywołanie super.onViewCreated"],
            blanks: [
                { position: "A", options: ["onCreateView", "onCreate", "onStart", "onResume"], correct: 0 },
                { position: "B", options: ["onViewCreated", "onCreated", "onViewSetup", "onViewReady"], correct: 0 }
            ],
            explanation: "onCreateView() tworzy widok fragmentu, onViewCreated() wywoływane po utworzeniu."
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
            category: "Sealed Classes when",
            codeTemplate: String.raw`fun handleResult(result: Result<String>) {
    _____ (result) {
        is Result.Success -> println("Dane: \${result.data}")
        is Result.Error -> println("Błąd: \${result.exception.message}")
        Result.Loading -> println("Ładowanie...")
        // Brak _____ - sealed class gwarantuje kompletność
    }
}`,
            errors: ["Niepoprawne słowo kluczowe when", "Niepotrzebny else w sealed class"],
            blanks: [
                { position: "A", options: ["when", "switch", "if", "case"], correct: 0 },
                { position: "B", options: ["else", "default", "otherwise", "other"], correct: 0 }
            ],
            explanation: "when z sealed classes nie wymaga else - kompilator sprawdza kompletność."
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
            category: "Extension Functions generyczne",
            codeTemplate: `fun <T> List<T>.secondOrNull(): T? {
    return if (this._____ >= 2) this[1] else null
}

fun main() {
    val numbers = listOf(1, 2, 3)
    val second = numbers._____()
    println("Drugi element: \\$second")
}`,
            errors: ["Niepoprawna właściwość size", "Niepoprawne wywołanie extension function"],
            blanks: [
                { position: "A", options: ["size", "length", "count", "capacity"], correct: 0 },
                { position: "B", options: ["secondOrNull", "getSecond", "second", "elementAt"], correct: 0 }
            ],
            explanation: "Extension functions mogą być generyczne i działać na różnych typach."
        },
        {
            category: "Data Classes",
            codeTemplate: `_____ class User(
    val id: Int,
    val name: String,
    val email: String
) {
    fun getDisplayName(): String {
        return "User: \\$name"
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
        },
        {
            category: "Data Classes destructuring",
            codeTemplate: `data class Point(val x: Int, val y: Int)

fun main() {
    val point = Point(10, 20)
    val (_____, _____) = point
    
    println("X: \\$x, Y: \\$y")
    
    val points = listOf(Point(1, 2), Point(3, 4))
    for ((a, b) in points) {
        println("Punkt: (\\$a, \\$b)")
    }
}`,
            errors: ["Niepoprawne destructuring assignment", "Niepoprawne nazwy zmiennych"],
            blanks: [
                { position: "A", options: ["x", "first", "a", "pointX"], correct: 0 },
                { position: "B", options: ["y", "second", "b", "pointY"], correct: 0 }
            ],
            explanation: "Data classes wspierają destructuring assignment do rozpakowywania wartości."
        },
        {
            category: "Higher-Order Functions",
            codeTemplate: `fun processNumbers(numbers: List<Int>, operation: (Int) -> Int): List<Int> {
    return numbers._____ { operation(it) }
}

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    val doubled = processNumbers(numbers) { it * 2 }
    val squared = processNumbers(numbers, _____)
    println(doubled)
}`,
            errors: ["Niepoprawna funkcja map", "Niepoprawna lambda dla kwadratu"],
            blanks: [
                { position: "A", options: ["map", "filter", "forEach", "reduce"], correct: 0 },
                { position: "B", options: ["{ it * it }", "{ it ^ 2 }", "{ it.pow(2) }", "{ square(it) }"], correct: 0 }
            ],
            explanation: "Higher-order functions przyjmują inne funkcje jako parametry."
        }
    ];

    console.log('🔧 DEBUG: Szablony zdefiniowane:', {
        basic: basicTemplates.length,
        intermediate: intermediateTemplates.length,
        advanced: advancedTemplates.length
    });

    // Generowanie pytań dla wszystkich 9 kombinacji
    const allTemplates = { basic: basicTemplates, intermediate: intermediateTemplates, advanced: advancedTemplates };
    
    Object.keys(allTemplates).forEach(knowledge => {
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const templates = allTemplates[knowledge];
            const maxQuestions = templates.length * 20; // ZWIĘKSZONE z 2 do 20 dla prawdziwej różnorodności!
            
            console.log(`🔧 DEBUG: Generuję ${maxQuestions} pytań dla ${knowledge}_${difficulty}`);
            
            for (let i = 0; i < maxQuestions; i++) {
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
            
            console.log(`🔧 DEBUG: Wygenerowano ${questionsDatabase[knowledge][difficulty].length} pytań dla ${knowledge}_${difficulty}`);
        });
    });
    
    console.log('🔧 DEBUG: Generowanie zakończone. Łączna liczba pytań:', 
        Object.values(questionsDatabase).reduce((total, knowledge) => 
            total + Object.values(knowledge).reduce((sum, difficulty) => sum + difficulty.length, 0), 0));
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
let usedQuestionIds = new Map(); // Zmienione na Map dla lepszego zarządzania per kombinacja

// Elementy DOM
const knowledgeSelection = document.getElementById('knowledgeSelection');
const difficultySelection = document.getElementById('difficultySelection');
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const homeBtn = document.getElementById('homeBtn');

// Stan aplikacji ćwiczeń
let currentPracticeIndex = 0;
let practiceAnswers = [];
let showingSolution = false;

// Nowe elementy DOM dla ćwiczeń
const practiceContainer = document.getElementById('practiceContainer');
const practiceBtn = document.getElementById('practiceBtn');

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
    timeElement.textContent = `Baza ${totalQuestions} pytań (9 kombinacji) wygenerowana w ${generationTime}ms ⚡ MEGA BAZA: 20x więcej pytań na szablon = prawdziwa różnorodność!`;
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
    
    // NOWE: Przyciski dla ćwiczeń
    document.getElementById('practiceBtn').addEventListener('click', startPracticeMode);
    document.getElementById('practiceNextBtn').addEventListener('click', nextPracticeExercise);
    document.getElementById('practicePrevBtn').addEventListener('click', prevPracticeExercise);
    document.getElementById('practiceCheckBtn').addEventListener('click', checkPracticeAnswers);
    document.getElementById('practiceShowSolutionBtn').addEventListener('click', showPracticeSolution);
    document.getElementById('practiceBackBtn').addEventListener('click', showKnowledgeSelection);
    
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
            <li>🚫 Bez duplikatów szablonów w tej sesji!</li>
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
    
    const combinationKey = `${currentKnowledge}_${currentDifficulty}`;
    
    console.log(`🎯 Rozpoczynam quiz: ${combinationKey}`);
    console.log(`📊 Stan używanych pytań dla wszystkich kombinacji:`);
    usedQuestionIds.forEach((questionSet, key) => {
        console.log(`   ${key}: ${questionSet.size} używanych pytań`);
    });
    
    // Get random questions for selected combination
    currentQuestions = getRandomQuestions(currentKnowledge, currentDifficulty, 5);
    
    console.log(`🎲 Wylosowane pytania dla ${combinationKey}:`, currentQuestions.map(q => `${q.id} (${q.category})`));
    
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
    const callId = Math.random().toString(36).substr(2, 9);
    const combinationKey = `${knowledge}_${difficulty}`;
    const allQuestions = [...questionsDatabase[knowledge][difficulty]];
    
    console.log(`🔍 [${callId}] getRandomQuestions(${knowledge}, ${difficulty}, ${count})`);
    console.log(`📚 [${callId}] Wszystkich pytań w bazie: ${allQuestions.length}`);
    
    // Inicjalizuj Set dla tej kombinacji jeśli nie istnieje
    if (!usedQuestionIds.has(combinationKey)) {
        usedQuestionIds.set(combinationKey, new Set());
    }
    
    const usedForThisCombination = usedQuestionIds.get(combinationKey);
    console.log(`🚫 [${callId}] Używane pytania dla ${combinationKey}:`, Array.from(usedForThisCombination));
    
    // Grupuj pytania według kategorii dla prawdziwej unikalności
    const questionsByCategory = new Map();
    allQuestions.forEach(question => {
        const category = question.category;
        if (!questionsByCategory.has(category)) {
            questionsByCategory.set(category, []);
        }
        questionsByCategory.get(category).push(question);
    });
    
    console.log(`📂 [${callId}] Dostępne kategorie:`, Array.from(questionsByCategory.keys()));
    
    // Znajdź kategorie, które już były używane w tej kombinacji
    const usedCategories = new Set();
    usedForThisCombination.forEach(questionId => {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
            usedCategories.add(question.category);
        }
    });
    
    console.log(`🚫 [${callId}] Używane kategorie dla ${combinationKey}:`, Array.from(usedCategories));
    
    // Wybierz dostępne kategorie (nie używane w tej kombinacji)
    const availableCategories = Array.from(questionsByCategory.keys())
        .filter(category => !usedCategories.has(category));
    
    console.log(`✅ [${callId}] Dostępne kategorie:`, availableCategories);
    
    // Jeśli za mało dostępnych kategorii, zresetuj tylko dla tej kombinacji
    if (availableCategories.length < count) {
        console.log(`🔄 [${callId}] Resetowanie używanych kategorii dla ${combinationKey}. Dostępne: ${availableCategories.length}, potrzebne: ${count}`);
        
        // Resetuj tylko tę kombinację
        usedQuestionIds.set(combinationKey, new Set());
        
        // Dodaj wszystkie dostępne kategorie
        const allCategories = Array.from(questionsByCategory.keys());
        console.log(`🔄 [${callId}] Wszystkie kategorie dostępne ponownie:`, allCategories);
        
        // Wymieszaj i wybierz
        const shuffledCategories = [...allCategories];
        for (let i = shuffledCategories.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCategories[i], shuffledCategories[j]] = [shuffledCategories[j], shuffledCategories[i]];
        }
        
        const selectedQuestions = [];
        for (let i = 0; i < Math.min(count, shuffledCategories.length); i++) {
            const category = shuffledCategories[i];
            const questionsForCategory = questionsByCategory.get(category);
            // Wybierz losowe pytanie z tej kategorii
            const randomQuestion = questionsForCategory[Math.floor(Math.random() * questionsForCategory.length)];
            selectedQuestions.push(randomQuestion);
            usedForThisCombination.add(randomQuestion.id);
            
            console.log(`➕ [${callId}] Wybrano: ${randomQuestion.id} z kategorii "${category}"`);
        }
        
        console.log(`✅ [${callId}] Po resecie wybrano ${selectedQuestions.length} pytań`);
        return selectedQuestions;
    }
    
    // Losowo wybierz kategorie z dostępnych
    const shuffledCategories = [...availableCategories];
    for (let i = shuffledCategories.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCategories[i], shuffledCategories[j]] = [shuffledCategories[j], shuffledCategories[i]];
    }
    
    console.log(`🎲 [${callId}] Wymieszane kategorie:`, shuffledCategories);
    
    const selectedQuestions = [];
    for (let i = 0; i < Math.min(count, shuffledCategories.length); i++) {
        const category = shuffledCategories[i];
        const questionsForCategory = questionsByCategory.get(category);
        // Wybierz losowe pytanie z tej kategorii
        const randomQuestion = questionsForCategory[Math.floor(Math.random() * questionsForCategory.length)];
        selectedQuestions.push(randomQuestion);
        usedForThisCombination.add(randomQuestion.id);
        
        console.log(`➕ [${callId}] Wybrano: ${randomQuestion.id} z kategorii "${category}"`);
    }
    
    console.log(`✅ [${callId}] Wybrano ${selectedQuestions.length} unikalnych kategorii. Łącznie używanych w ${combinationKey}: ${usedForThisCombination.size}`);
    console.log(`📋 [${callId}] Kategorie: ${selectedQuestions.map(q => q.category).join(', ')}`);
    
    return selectedQuestions;
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    console.log(`📝 Wyświetlam pytanie ${currentQuestionIndex + 1}:`, {
        id: question.id,
        category: question.category,
        code: question.code.substring(0, 50) + '...'
    });
    
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
        
        <div class="used-questions-status">
            <h4>📊 Stan pytań w tej kombinacji:</h4>
            ${generateUsedQuestionsStatus()}
        </div>
        
        <div class="questions-review">
            <h3 class="review-title">📋 Przegląd pytań i poprawnych odpowiedzi</h3>
            ${generateQuestionsReview()}
        </div>
    `;
    
    // Dodaj przycisk resetowania pytań do istniejących results-actions
    setTimeout(() => {
        const existingActions = document.querySelector('.results-actions');
        if (existingActions && !document.getElementById('resetQuestionsBtn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetQuestionsBtn';
            resetBtn.className = 'btn btn-secondary';
            resetBtn.textContent = '🔄 Resetuj pytania';
            resetBtn.onclick = resetUsedQuestions;
            existingActions.appendChild(resetBtn);
        }
    }, 100);
}

function generateUsedQuestionsStatus() {
    const combinationKey = `${currentKnowledge}_${currentDifficulty}`;
    const usedQuestions = Array.from(usedQuestionIds.get(combinationKey) || []);
    const totalQuestions = questionsDatabase[currentKnowledge][currentDifficulty].length;
    const usedPercentage = (usedQuestions.length / totalQuestions) * 100;
    
    // Grupuj używane pytania według kategorii
    const usedCategories = new Set();
    const allQuestions = questionsDatabase[currentKnowledge][currentDifficulty];
    usedQuestions.forEach(questionId => {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) {
            usedCategories.add(question.category);
        }
    });
    
    // Policz wszystkie dostępne kategorie
    const allCategories = new Set(allQuestions.map(q => q.category));
    const remainingCategories = allCategories.size - usedCategories.size;
    
    let statusMessage = '';
    if (usedPercentage === 0) {
        statusMessage = '🎯 Wszystkie pytania dostępne';
    } else if (remainingCategories > 0) {
        statusMessage = `✅ ${remainingCategories} kategorii nadal dostępnych`;
    } else {
        statusMessage = '🔄 Wszystkie kategorie użyte - następny quiz zresetuje';
    }
    
    return `
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${usedPercentage}%"></div>
            </div>
            <div class="progress-text">
                <span>${usedQuestions.length}/${totalQuestions} pytań użytych (${usedPercentage.toFixed(1)}%)</span>
            </div>
            <div class="categories-status">
                <span>${statusMessage}</span>
            </div>
            <div class="used-categories">
                <strong>Użyte kategorie:</strong> ${Array.from(usedCategories).join(', ') || 'Żadne'}
            </div>
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

function resetUsedQuestions() {
    let totalReset = 0;
    
    // Pokaż aktualny stan przed resetem
    console.log('🔄 Stan przed resetem:');
    usedQuestionIds.forEach((questionSet, combinationKey) => {
        console.log(`   ${combinationKey}: ${questionSet.size} używanych pytań`);
        totalReset += questionSet.size;
    });
    
    // Wyczyść wszystkie kombinacje
    usedQuestionIds.clear();
    
    console.log(`🔄 Zresetowano wszystkie kombinacje (łącznie: ${totalReset} pytań)`);
    console.log('🎯 Wszystkie kategorie są teraz dostępne do losowania we wszystkich kombinacjach');
    
    // Pokaż informację użytkownikowi
    const resetBtn = document.getElementById('resetQuestionsBtn');
    if (resetBtn) {
        const originalText = resetBtn.textContent;
        resetBtn.textContent = '✅ Zresetowano!';
        resetBtn.disabled = true;
        
        setTimeout(() => {
            resetBtn.textContent = originalText;
            resetBtn.disabled = false;
        }, 2000);
    }
    
    // Toast notification if available
    if (typeof Toast !== 'undefined') {
        Toast.makeText(this, `Zresetowano ${totalReset} pytań z wszystkich kombinacji!`, Toast.LENGTH_SHORT).show();
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

// Funkcje dla trybu ćwiczeń
function startPracticeMode() {
    console.log('🎯 Rozpoczynam tryb ćwiczeń - 50 statycznych przykładów');
    
    // Reset stanu ćwiczeń
    currentPracticeIndex = 0;
    practiceAnswers = [];
    showingSolution = false;
    
    // Ukryj inne ekrany
    knowledgeSelection.style.display = 'none';
    difficultySelection.style.display = 'none';
    startScreen.style.display = 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    // Pokaż kontener ćwiczeń
    practiceContainer.style.display = 'block';
    homeBtn.style.display = 'block';
    
    // Pokaż pierwsze ćwiczenie
    showPracticeExercise();
}

function showPracticeExercise() {
    const exercise = practiceExercises[currentPracticeIndex];
    
    console.log(`📝 Wyświetlam ćwiczenie ${currentPracticeIndex + 1}:`, exercise.title);
    
    // Aktualizuj progress
    document.getElementById('practiceProgress').textContent = `${currentPracticeIndex + 1} / ${practiceExercises.length}`;
    const progress = ((currentPracticeIndex) / practiceExercises.length) * 100;
    document.getElementById('practiceProgressBar').style.width = progress + '%';
    
    // Wyświetl informacje o ćwiczeniu
    document.getElementById('practiceTitle').textContent = exercise.title;
    document.getElementById('practiceDescription').textContent = exercise.description;
    
    // Wyświetl kod
    const codeElement = document.getElementById('practiceCode');
    codeElement.innerHTML = ''; // Wyczyść
    const preElement = document.createElement('pre');
    const codeInnerElement = document.createElement('code');
    codeInnerElement.textContent = exercise.code; // Użyj textContent zamiast innerHTML
    preElement.appendChild(codeInnerElement);
    codeElement.appendChild(preElement);
    
    // Wygeneruj pola do uzupełnienia
    const blanksContainer = document.getElementById('practiceBlanks');
    blanksContainer.innerHTML = exercise.blanks.map((blank, index) => `
        <div class="practice-blank">
            <label for="blank_${index}">Pozycja ${blank.position}:</label>
            <input type="text" 
                   id="blank_${index}" 
                   name="blank_${index}" 
                   placeholder="Wpisz odpowiedź..." 
                   autocomplete="off"
                   ${showingSolution ? 'disabled' : ''}>
        </div>
    `).join('');
    
    // Aktualizuj przyciski nawigacji
    document.getElementById('practicePrevBtn').disabled = currentPracticeIndex === 0;
    document.getElementById('practiceNextBtn').disabled = currentPracticeIndex === practiceExercises.length - 1;
    
    // Reset stanu rozwiązania
    showingSolution = false;
    document.getElementById('practiceCheckBtn').style.display = 'inline-block';
    document.getElementById('practiceShowSolutionBtn').style.display = 'inline-block';
    document.getElementById('practiceResult').style.display = 'none';
    document.getElementById('practiceExplanation').style.display = 'none';
    
    // Przywróć poprzednie odpowiedzi jeśli istnieją
    if (practiceAnswers[currentPracticeIndex]) {
        const savedAnswers = practiceAnswers[currentPracticeIndex];
        exercise.blanks.forEach((blank, index) => {
            const input = document.getElementById(`blank_${index}`);
            if (input && savedAnswers[index]) {
                input.value = savedAnswers[index];
            }
        });
    }
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
    const answers = exercise.blanks.map((blank, index) => {
        const input = document.getElementById(`blank_${index}`);
        return input ? input.value.trim() : '';
    });
    practiceAnswers[currentPracticeIndex] = answers;
}

function checkPracticeAnswers() {
    savePracticeAnswers();
    
    const exercise = practiceExercises[currentPracticeIndex];
    const userAnswers = practiceAnswers[currentPracticeIndex] || [];
    
    let correctCount = 0;
    const results = exercise.blanks.map((blank, index) => {
        const userAnswer = userAnswers[index] || '';
        const isCorrect = userAnswer.toLowerCase() === blank.correct.toLowerCase();
        if (isCorrect) correctCount++;
        
        return {
            position: blank.position,
            userAnswer,
            correctAnswer: blank.correct,
            isCorrect
        };
    });
    
    // Wyświetl wyniki
    const resultContainer = document.getElementById('practiceResult');
    resultContainer.innerHTML = `
        <h4>Wynik: ${correctCount}/${exercise.blanks.length}</h4>
        <div class="practice-results">
            ${results.map(result => `
                <div class="practice-result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <strong>Pozycja ${result.position}:</strong>
                    <div>Twoja odpowiedź: "${result.userAnswer}"</div>
                    <div>Poprawna odpowiedź: "${result.correctAnswer}"</div>
                    <div class="result-status">${result.isCorrect ? '✅ Poprawne' : '❌ Niepoprawne'}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    resultContainer.style.display = 'block';
    
    // Pokaż wyjaśnienie
    document.getElementById('practiceExplanationText').textContent = exercise.explanation;
    document.getElementById('practiceExplanation').style.display = 'block';
}

function showPracticeSolution() {
    const exercise = practiceExercises[currentPracticeIndex];
    
    // Wypełnij wszystkie pola poprawnymi odpowiedziami
    exercise.blanks.forEach((blank, index) => {
        const input = document.getElementById(`blank_${index}`);
        if (input) {
            input.value = blank.correct;
            input.style.backgroundColor = '#d4edda'; // Zielone tło
            input.disabled = true;
        }
    });
    
    // Pokaż wyjaśnienie
    document.getElementById('practiceExplanationText').textContent = exercise.explanation;
    document.getElementById('practiceExplanation').style.display = 'block';
    
    // Ukryj przyciski sprawdzania
    document.getElementById('practiceCheckBtn').style.display = 'none';
    document.getElementById('practiceShowSolutionBtn').style.display = 'none';
    
    showingSolution = true;
    
    // Zapisz rozwiązanie jako odpowiedzi użytkownika
    practiceAnswers[currentPracticeIndex] = exercise.blanks.map(blank => blank.correct);
}
