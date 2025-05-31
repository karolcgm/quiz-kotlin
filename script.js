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
    
    // Różne warianty kodu z tym samym zakresem materiału - TYLKO PODSTAWOWE ELEMENTY
    const codeVariants = [
        // Wariant 1: Pierwiastek - findViewById<Button>
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

        calculateBtn.setOnClickListener {
            val e = findViewById<EditText>(R.id.e)
            val inputText = e.___B___.toString().replace(',', '.')
            val number = inputText.toDouble()
            val root = ___C___.sqrt(number)
            ___D___.makeText(applicationContext, "Pierwiastek z \\$number to \\$root", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        // Wariant 2: Data - SimpleDateFormat
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

        val d = ___A___<Button>(R.id.d)

        d.setOnClickListener {
            val currentDate = ___B___("dd.MM.yyyy", Locale.getDefault()).format(___C___())
            Toast.makeText(___D___, "Data: \\$currentDate", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        // Wariant 3: Przycisk z kolorami - Color.RED/GREEN
        `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private var isStarted = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btn = findViewById<Button>(R.id.myButton)

        btn.text = "START"
        btn.setBackgroundColor(Color.___B___)

        btn.setOnClickListener {
            if (!isStarted) {
                btn.___C___ = "STOP"
                btn.setBackgroundColor(Color.RED)
                isStarted = ___D___
            } else {
                btn.text = "START"
                btn.setBackgroundColor(Color.GREEN)
                isStarted = false
            }
        }
    }
}`,
        // Wariant 4: EditText z walidacją - toDoubleOrNull
        `package pl.polsl.mojaaplikacjia

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
            val e = findViewById<___A___>(R.id.e)
            val liczba = e.text.toString().___B___()

            if (liczba != null && liczba >= 0) {
                val pierwiastek = Math.___C___(liczba)
                ___D___.makeText(applicationContext, "√\\$liczba = \\$pierwiastek", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(applicationContext, "Wpisz poprawną liczbę (>= 0)", Toast.LENGTH_SHORT).show()
            }
        }
    }
}`,
        // Wariant 5: Dwa przyciski - pierwiastek i data
        `package pl.polsl.mojaaplikacjia

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val p = findViewById<___A___>(R.id.p)
        val d = findViewById<Button>(R.id.d)

        p.setOnClickListener {
            val e = findViewById<EditText>(R.id.e)
            val liczba = e.text.toString().toDoubleOrNull()
            if (liczba != null && liczba >= 0) {
                val pierwiastek = ___B___.sqrt(liczba)
                Toast.makeText(applicationContext, "√\\$liczba = \\$pierwiastek", Toast.___C___).show()
            }
        }

        d.setOnClickListener {
            val currentDate = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault()).format(Date())
            Toast.makeText(___D___, currentDate, Toast.LENGTH_SHORT).show()
        }
    }
}`,
        // Wariant 6: findViewById bez typu - podstawy
        `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val p = ___A___(R.id.p)

        p.setOnClickListener {
            val e = findViewById<EditText>(R.id.e)
            val inputText = e.text.___B___().replace(',', '.')
            val number = inputText.___C___()
            val root = Math.sqrt(number)
            Toast.___D___(applicationContext, "Pierwiastek z \\$number to \\$root", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        // Wariant 7: Toast.LENGTH_LONG
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

        val d = findViewById<Button>(R.id.d)

        d.___A___ {
            val currentDate = SimpleDateFormat("___B___", Locale.getDefault()).format(Date())
            Toast.makeText(applicationContext, "Data: \\$currentDate", ___C___.LENGTH_LONG).___D___()
        }
    }
}`,
        // Wariant 8: replace i toDouble
        `import android.os.Bundle
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
            val e = findViewById<___A___>(R.id.e)
            val inputText = e.text.toString().___B___(',', '.')
            val number = inputText.___C___()
            val root = Math.sqrt(number)
            Toast.makeText(___D___, "Pierwiastek z \\$number to \\$root", Toast.LENGTH_SHORT).show()
        }
    }
}`,
        // Wariant 9: Locale.getDefault
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

        val d = findViewById<Button>(R.id.d)

        d.setOnClickListener {
            val currentDate = SimpleDateFormat("dd.MM.yyyy", ___A___.getDefault()).___B___(Date())
            Toast.___C___(applicationContext, "Data: \\$currentDate", Toast.LENGTH_SHORT).___D___()
        }
    }
}`,
        // Wariant 10: setBackgroundColor różne kolory
        `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private var isStarted = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btn = findViewById<Button>(R.id.myButton)

        btn.text = "START"
        btn.___A___(Color.GREEN)

        btn.setOnClickListener {
            if (!___B___) {
                btn.text = "STOP"
                btn.setBackgroundColor(Color.___C___)
                isStarted = true
            } else {
                btn.text = "START"
                btn.setBackgroundColor(Color.GREEN)
                isStarted = ___D___
            }
        }
    }
}`,
        // Wariant 11: applicationContext vs this
        `import android.os.Bundle
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
            val inputText = e.___A___.toString()
            val number = inputText.toDouble()
            val root = Math.___B___(number)
            Toast.makeText(___C___, "Pierwiastek z \\$number to \\$root", Toast.___D___).show()
        }
    }
}`,
        // Wariant 12: Date() vs new Date()
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

        val d = findViewById<___A___>(R.id.d)

        d.setOnClickListener {
            val currentDate = ___B___("dd.MM.yyyy", Locale.getDefault()).format(___C___())
            Toast.makeText(applicationContext, "Data: \\$currentDate", Toast.LENGTH_SHORT).___D___()
        }
    }
}`,
        // Wariant 13: text vs setText
        `import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private var isStarted = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btn = findViewById<Button>(R.id.myButton)

        btn.___A___ = "START"
        btn.setBackgroundColor(Color.GREEN)

        btn.setOnClickListener {
            if (!isStarted) {
                btn.text = "___B___"
                btn.setBackgroundColor(Color.RED)
                isStarted = true
            } else {
                btn.text = "START"
                btn.setBackgroundColor(Color.___C___)
                isStarted = ___D___
            }
        }
    }
}`,
        // Wariant 14: Math.sqrt vs sqrt
        `import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val p = findViewById<Button>(R.id.p)

        p.___A___ {
            val e = findViewById<___B___>(R.id.e)
            val inputText = e.text.toString().replace(',', '.')
            val number = inputText.toDouble()
            val root = ___C___.sqrt(number)
            Toast.makeText(applicationContext, "Pierwiastek z \\$number to \\$root", Toast.___D___).show()
        }
    }
}`,
        // Wariant 15: format vs toString
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

        val d = findViewById<Button>(R.id.d)

        d.setOnClickListener {
            val formatter = SimpleDateFormat("___A___", Locale.getDefault())
            val currentDate = formatter.___B___(Date())
            Toast.makeText(applicationContext, "Data: \\$currentDate", ___C___.LENGTH_SHORT).___D___()
        }
    }
}`
    ];
    
    // Różne zestawy blanks dla każdego wariantu - TYLKO PODSTAWOWE ELEMENTY
    const blankSets = [
        // Blanks dla wariantu 1 (findViewById<Button>)
        [
            { position: "A", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "B", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 2 (SimpleDateFormat)
        [
            { position: "A", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "B", correct: "SimpleDateFormat", options: ["SimpleDateFormat", "DateFormat", "Calendar", "LocalDate"] },
            { position: "C", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "D", correct: "applicationContext", options: ["applicationContext", "this", "context", "activity"] }
        ],
        // Blanks dla wariantu 3 (Color)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "GREEN", options: ["GREEN", "RED", "BLUE", "YELLOW"] },
            { position: "C", correct: "text", options: ["text", "label", "title", "content"] },
            { position: "D", correct: "true", options: ["true", "false", "1", "null"] }
        ],
        // Blanks dla wariantu 4 (toDoubleOrNull)
        [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "toDoubleOrNull", options: ["toDoubleOrNull", "toDouble", "toInt", "toString"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 5 (dwa przyciski)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "C", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "D", correct: "applicationContext", options: ["applicationContext", "this", "context", "activity"] }
        ],
        // Blanks dla wariantu 6 (findViewById bez typu)
        [
            { position: "A", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "B", correct: "toString", options: ["toString", "getText", "getValue", "getContent"] },
            { position: "C", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "D", correct: "makeText", options: ["makeText", "showText", "displayText", "createText"] }
        ],
        // Blanks dla wariantu 7 (Toast.LENGTH_LONG)
        [
            { position: "A", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setListener", "onTouch"] },
            { position: "B", correct: "dd.MM.yyyy", options: ["dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] },
            { position: "C", correct: "LENGTH_LONG", options: ["LENGTH_LONG", "LENGTH_SHORT", "LONG", "SHORT"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 8 (replace i toDouble)
        [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "replace", options: ["replace", "substitute", "change", "swap"] },
            { position: "C", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "D", correct: "applicationContext", options: ["applicationContext", "this", "context", "activity"] }
        ],
        // Blanks dla wariantu 9 (Locale.getDefault)
        [
            { position: "A", correct: "Locale", options: ["Locale", "Language", "Region", "Country"] },
            { position: "B", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "C", correct: "makeText", options: ["makeText", "showText", "displayText", "createText"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 10 (setBackgroundColor)
        [
            { position: "A", correct: "setBackgroundColor", options: ["setBackgroundColor", "setColor", "setBackground", "changeColor"] },
            { position: "B", correct: "isStarted", options: ["isStarted", "started", "active", "running"] },
            { position: "C", correct: "RED", options: ["RED", "BLUE", "YELLOW", "BLACK"] },
            { position: "D", correct: "false", options: ["false", "true", "0", "null"] }
        ],
        // Blanks dla wariantu 11 (applicationContext vs this)
        [
            { position: "A", correct: "this", options: ["this", "applicationContext", "context", "activity"] },
            { position: "B", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "C", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 12 (Date)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "SimpleDateFormat", options: ["SimpleDateFormat", "DateFormat", "Calendar", "LocalDate"] },
            { position: "C", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 13 (text vs setText)
        [
            { position: "A", correct: "text", options: ["text", "setText", "label", "title"] },
            { position: "B", correct: "STOP", options: ["STOP", "PAUSE", "END", "HALT"] },
            { position: "C", correct: "GREEN", options: ["GREEN", "BLUE", "YELLOW", "BLACK"] },
            { position: "D", correct: "false", options: ["false", "true", "0", "null"] }
        ],
        // Blanks dla wariantu 14 (Math.sqrt)
        [
            { position: "A", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setListener", "onTouch"] },
            { position: "B", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 15 (format)
        [
            { position: "A", correct: "dd.MM.yyyy", options: ["dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] },
            { position: "B", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 16 (Bundle i setContentView)
        [
            { position: "A", correct: "Bundle", options: ["Bundle", "State", "Data", "Params"] },
            { position: "B", correct: "setContentView", options: ["setContentView", "setLayout", "setView", "loadLayout"] },
            { position: "C", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 17 (R.id)
        [
            { position: "A", correct: "R", options: ["R", "Resources", "Res", "Resource"] },
            { position: "B", correct: "findViewById", options: ["findViewById", "findView", "getView", "findElement"] },
            { position: "C", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 18 (super.onCreate)
        [
            { position: "A", correct: "super", options: ["super", "parent", "base", "this"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "D", correct: "makeText", options: ["makeText", "showText", "displayText", "createText"] }
        ],
        // Blanks dla wariantu 19 (AppCompatActivity)
        [
            { position: "A", correct: "AppCompatActivity", options: ["AppCompatActivity", "Activity", "BaseActivity", "MainActivity"] },
            { position: "B", correct: "onCreate", options: ["onCreate", "onStart", "onResume", "initialize"] },
            { position: "C", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 20 (String interpolacja)
        [
            { position: "A", correct: "Pierwiastek z ", options: ["Pierwiastek z ", "√", "Wynik: ", "Sqrt: "] },
            { position: "B", correct: " to ", options: [" to ", " = ", " equals ", " is "] },
            { position: "C", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 21 (null sprawdzanie)
        [
            { position: "A", correct: "null", options: ["null", "0", "false", "empty"] },
            { position: "B", correct: "0", options: ["0", "1", "null", "false"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 22 (Boolean)
        [
            { position: "A", correct: "false", options: ["false", "true", "null", "0"] },
            { position: "B", correct: "true", options: ["true", "false", "1", "null"] },
            { position: "C", correct: "START", options: ["START", "BEGIN", "PLAY", "GO"] },
            { position: "D", correct: "GREEN", options: ["GREEN", "BLUE", "YELLOW", "BLACK"] }
        ],
        // Blanks dla wariantu 23 (private var)
        [
            { position: "A", correct: "private", options: ["private", "public", "protected", "internal"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "text", options: ["text", "label", "title", "content"] },
            { position: "D", correct: "isStarted", options: ["isStarted", "started", "active", "running"] }
        ],
        // Blanks dla wariantu 24 (val vs var)
        [
            { position: "A", correct: "val", options: ["val", "var", "const", "let"] },
            { position: "B", correct: "val", options: ["val", "var", "const", "let"] },
            { position: "C", correct: "val", options: ["val", "var", "const", "let"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 25 (class MainActivity)
        [
            { position: "A", correct: "class", options: ["class", "object", "interface", "enum"] },
            { position: "B", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 26 (import statements)
        [
            { position: "A", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 27 (package)
        [
            { position: "A", correct: "package", options: ["package", "namespace", "module", "import"] },
            { position: "B", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 28 (java.text.SimpleDateFormat)
        [
            { position: "A", correct: "java", options: ["java", "kotlin", "android", "javax"] },
            { position: "B", correct: "java", options: ["java", "kotlin", "android", "javax"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 29 (java.util.Date)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "util", options: ["util", "text", "io", "net"] },
            { position: "C", correct: "applicationContext", options: ["applicationContext", "this", "context", "activity"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 30 (override fun)
        [
            { position: "A", correct: "override", options: ["override", "virtual", "abstract", "open"] },
            { position: "B", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "C", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 31 (R.layout)
        [
            { position: "A", correct: "R", options: ["R", "Resources", "Res", "Resource"] },
            { position: "B", correct: "dd.MM.yyyy", options: ["dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] },
            { position: "C", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 32 (android.graphics.Color)
        [
            { position: "A", correct: "android", options: ["android", "java", "kotlin", "androidx"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "Color", options: ["Color", "Paint", "Style", "Theme"] },
            { position: "D", correct: "RED", options: ["RED", "BLUE", "YELLOW", "BLACK"] }
        ],
        // Blanks dla wariantu 33 (androidx.appcompat)
        [
            { position: "A", correct: "androidx", options: ["androidx", "android", "java", "kotlin"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 34 (android.widget.Button)
        [
            { position: "A", correct: "android", options: ["android", "java", "kotlin", "androidx"] },
            { position: "B", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "C", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 35 (android.widget.EditText)
        [
            { position: "A", correct: "android", options: ["android", "java", "kotlin", "androidx"] },
            { position: "B", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "C", correct: "text", options: ["text", "value", "content", "input"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 36 (android.widget.Toast)
        [
            { position: "A", correct: "android", options: ["android", "java", "kotlin", "androidx"] },
            { position: "B", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] }
        ],
        // Blanks dla wariantu 37 (android.os.Bundle)
        [
            { position: "A", correct: "android", options: ["android", "java", "kotlin", "androidx"] },
            { position: "B", correct: "Bundle", options: ["Bundle", "State", "Data", "Params"] },
            { position: "C", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 38 (java.text.SimpleDateFormat import)
        [
            { position: "A", correct: "java", options: ["java", "kotlin", "android", "javax"] },
            { position: "B", correct: "SimpleDateFormat", options: ["SimpleDateFormat", "DateFormat", "Calendar", "LocalDate"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 39 (java.util.*)
        [
            { position: "A", correct: "java", options: ["java", "kotlin", "android", "javax"] },
            { position: "B", correct: "Locale", options: ["Locale", "Language", "Region", "Country"] },
            { position: "C", correct: "Date", options: ["Date", "Calendar", "Time", "Now"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 40 (setOnClickListener)
        [
            { position: "A", correct: "setOnClickListener", options: ["setOnClickListener", "onClick", "setListener", "onTouch"] },
            { position: "B", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 41 (String.format)
        [
            { position: "A", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "B", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "C", correct: "message", options: ["message", "text", "content", "string"] },
            { position: "D", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] }
        ],
        // Blanks dla wariantu 42 (Double vs toDouble)
        [
            { position: "A", correct: "EditText", options: ["EditText", "TextView", "Button", "Input"] },
            { position: "B", correct: "Double", options: ["Double", "Float", "Int", "Number"] },
            { position: "C", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 43 (Math vs kotlin.math)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "Math", options: ["Math", "Calculate", "Number", "Double"] },
            { position: "C", correct: "makeText", options: ["makeText", "showText", "displayText", "createText"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 44: applicationContext vs this vs context
        [
            { position: "A", correct: "this", options: ["this", "applicationContext", "context", "activity"] },
            { position: "B", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "C", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 45: LENGTH_SHORT vs LENGTH_LONG
        [
            { position: "A", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "B", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "C", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 46: show() vs display()
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "dd.MM.yyyy", options: ["dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] },
            { position: "C", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 47 (replace)
        [
            { position: "A", correct: ",", options: [",", ".", ";", ":"] },
            { position: "B", correct: ".", options: [".", ",", ";", ":"] },
            { position: "C", correct: "toDouble", options: ["toDouble", "toInt", "toFloat", "toNumber"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 48 (>= 0)
        [
            { position: "A", correct: ">=", options: [">=", ">", "==", "!="] },
            { position: "B", correct: "0", options: ["0", "1", "null", "false"] },
            { position: "C", correct: "applicationContext", options: ["applicationContext", "this", "context", "activity"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 49 (dd.MM.yyyy vs MM/dd/yyyy)
        [
            { position: "A", correct: "dd.MM.yyyy", options: ["dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] },
            { position: "B", correct: "format", options: ["format", "parse", "toString", "convert"] },
            { position: "C", correct: "Toast", options: ["Toast", "Message", "Alert", "Dialog"] },
            { position: "D", correct: "show", options: ["show", "display", "present", "visible"] }
        ],
        // Blanks dla wariantu 50 (kombinacja wszystkich)
        [
            { position: "A", correct: "Button", options: ["Button", "TextView", "EditText", "ImageView"] },
            { position: "B", correct: "sqrt", options: ["sqrt", "pow", "abs", "round"] },
            { position: "C", correct: "LENGTH_SHORT", options: ["LENGTH_SHORT", "LENGTH_LONG", "SHORT", "LONG"] },
            { position: "D", correct: "RED", options: ["RED", "BLUE", "YELLOW", "BLACK"] }
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
    
    // Generuj pola tekstowe do uzupełnienia - BRAK PODPOWIEDZI!
    const answersContainer = document.getElementById('practiceBlanks');
    answersContainer.innerHTML = '';
    
    exercise.blanks.forEach(blank => {
        const blankDiv = document.createElement('div');
        blankDiv.className = 'practice-blank';
        blankDiv.innerHTML = `
            <label>Pozycja ${blank.position}:</label>
            <input type="text" id="blank_${blank.position}" placeholder="Wpisz odpowiedź..." autocomplete="off">
        `;
        answersContainer.appendChild(blankDiv);
    });
    
    // Przywróć poprzednie odpowiedzi jeśli istnieją
    if (practiceAnswers[currentPracticeIndex]) {
        exercise.blanks.forEach(blank => {
            const input = document.getElementById(`blank_${blank.position}`);
            if (input && practiceAnswers[currentPracticeIndex][blank.position]) {
                input.value = practiceAnswers[currentPracticeIndex][blank.position];
            }
        });
    }
    
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
        const input = document.getElementById(`blank_${blank.position}`);
        if (input) {
            answers[blank.position] = input.value.trim();
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
        const input = document.getElementById(`blank_${blank.position}`);
        const userAnswer = userAnswers[blank.position] || '';
        const isCorrect = userAnswer.toLowerCase().trim() === blank.correct.toLowerCase().trim();
        
        // Pokoloruj odpowiedzi
        if (input) {
            input.style.backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
            input.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
            input.style.border = '2px solid';
            
            // Dodaj ikonę obok pola
            let icon = input.parentElement.querySelector('.answer-icon');
            if (!icon) {
                icon = document.createElement('span');
                icon.className = 'answer-icon';
                input.parentElement.appendChild(icon);
            }
            icon.textContent = isCorrect ? ' ✅' : ' ❌';
            icon.style.marginLeft = '10px';
            icon.style.fontSize = '18px';
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
    resultDiv.style.fontWeight = 'bold';
    resultDiv.style.textAlign = 'center';
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
