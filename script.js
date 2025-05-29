// Baza 100 pytań z fragmentami kodu Kotlin/Android Studio do uzupełnienia
const questionsDatabase = [
    // Pytania o podstawy Kotlin
    {
        id: 1,
        category: "Podstawy Kotlin",
        code: `fun main() {
    val name = "Kotlin"
    _____ message = "Hello, $name!"
    println(message)
}`,
        blanks: ["var"],
        explanation: "Używamy 'var' dla zmiennych, które mogą być modyfikowane po inicjalizacji."
    },
    {
        id: 2,
        category: "Podstawy Kotlin",
        code: `fun calculateSum(a: Int, b: Int): _____ {
    return a + b
}`,
        blanks: ["Int"],
        explanation: "Funkcja zwraca typ Int, więc typ zwracany to Int."
    },
    {
        id: 3,
        category: "Android Views",
        code: `class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val button = findViewById<_____>(R.id.button)
    }
}`,
        blanks: ["Button"],
        explanation: "findViewById zwraca obiekt typu Button dla elementu button."
    },
    {
        id: 4,
        category: "Button Click",
        code: `button.setOnClickListener {
    val textView = findViewById<TextView>(R.id.textView)
    textView._____ = "Przycisk został kliknięty!"
}`,
        blanks: ["text"],
        explanation: "Właściwość 'text' służy do ustawiania tekstu w TextView."
    },
    {
        id: 5,
        category: "Toast",
        code: `Toast.makeText(
    this,
    "Wiadomość toast",
    Toast._____
).show()`,
        blanks: ["LENGTH_SHORT"],
        explanation: "LENGTH_SHORT to stała określająca krótki czas wyświetlania toast."
    },
    {
        id: 6,
        category: "Kalkulator",
        code: `fun addNumbers() {
    val num1 = editText1.text.toString().toInt()
    val num2 = editText2.text.toString()._____()
    val result = num1 + num2
    resultTextView.text = result.toString()
}`,
        blanks: ["toInt"],
        explanation: "Metoda toInt() konwertuje String na Int."
    },
    {
        id: 7,
        category: "When Expression",
        code: `fun getGrade(score: Int): String {
    return _____ (score) {
        in 90..100 -> "A"
        in 80..89 -> "B"
        in 70..79 -> "C"
        else -> "F"
    }
}`,
        blanks: ["when"],
        explanation: "Wyrażenie 'when' to odpowiednik switch w Kotlin."
    },
    {
        id: 8,
        category: "Pętla For",
        code: `for (i in 1.._____) {
    println("Liczba: $i")
}`,
        blanks: ["10"],
        explanation: "Zakres 1..10 tworzy pętlę od 1 do 10 włącznie."
    },
    {
        id: 9,
        category: "EditText",
        code: `val editText = findViewById<EditText>(R.id.editText)
val userInput = editText.text._____()`,
        blanks: ["toString"],
        explanation: "Metoda toString() konwertuje Editable na String."
    },
    {
        id: 10,
        category: "Zmiana koloru",
        code: `button.setOnClickListener {
    button.setBackgroundColor(
        ContextCompat.getColor(this, R.color._____)
    )
}`,
        blanks: ["red"],
        explanation: "R.color.red odnosi się do koloru zdefiniowanego w resources."
    },
    {
        id: 11,
        category: "Nullable Types",
        code: `var name: String_____ = null
if (name != null) {
    println(name.length)
}`,
        blanks: ["?"],
        explanation: "Znak ? oznacza, że zmienna może być null (nullable type)."
    },
    {
        id: 12,
        category: "Safe Call",
        code: `val length = name_____length
println("Długość: $length")`,
        blanks: ["?."],
        explanation: "Operator ?. to safe call - wywołuje metodę tylko jeśli obiekt nie jest null."
    },
    {
        id: 13,
        category: "Data Class",
        code: `_____ class Person(val name: String, val age: Int)

val person = Person("Jan", 25)
println(person.name)`,
        blanks: ["data"],
        explanation: "Słowo kluczowe 'data' tworzy klasę danych z automatycznymi metodami."
    },
    {
        id: 14,
        category: "List",
        code: `val numbers = _____Of(1, 2, 3, 4, 5)
for (number in numbers) {
    println(number)
}`,
        blanks: ["listOf"],
        explanation: "listOf() tworzy niemodyfikowalną listę elementów."
    },
    {
        id: 15,
        category: "Mutable List",
        code: `val mutableNumbers = _____Of(1, 2, 3)
mutableNumbers.add(4)
println(mutableNumbers)`,
        blanks: ["mutableListOf"],
        explanation: "mutableListOf() tworzy modyfikowalną listę."
    },
    {
        id: 16,
        category: "String Template",
        code: `val age = 25
val message = "Mam _____ lat"
println(message)`,
        blanks: ["$age"],
        explanation: "String template używa $ do wstawiania wartości zmiennych."
    },
    {
        id: 17,
        category: "Function Parameter",
        code: `fun greet(name: String = "_____") {
    println("Cześć, $name!")
}
greet() // Wywoła z domyślną wartością`,
        blanks: ["Świat"],
        explanation: "Parametry funkcji mogą mieć wartości domyślne."
    },
    {
        id: 18,
        category: "Extension Function",
        code: `fun String._____(): Boolean {
    return this.length > 5
}

val result = "Kotlin".isLong()`,
        blanks: ["isLong"],
        explanation: "Extension functions pozwalają dodawać nowe metody do istniejących klas."
    },
    {
        id: 19,
        category: "Lambda",
        code: `val numbers = listOf(1, 2, 3, 4, 5)
val doubled = numbers.map { it _____ 2 }
println(doubled)`,
        blanks: ["*"],
        explanation: "Lambda expression z operatorem mnożenia."
    },
    {
        id: 20,
        category: "Filter",
        code: `val numbers = listOf(1, 2, 3, 4, 5, 6)
val evenNumbers = numbers._____ { it % 2 == 0 }
println(evenNumbers)`,
        blanks: ["filter"],
        explanation: "Metoda filter() filtruje elementy spełniające warunek."
    },
    {
        id: 21,
        category: "Android Layout",
        code: `<TextView
    android:id="@+id/textView"
    android:layout_width="_____"
    android:layout_height="wrap_content"
    android:text="Hello World!" />`,
        blanks: ["match_parent"],
        explanation: "match_parent sprawia, że element zajmuje całą szerokość rodzica."
    },
    {
        id: 22,
        category: "Intent",
        code: `val intent = _____(this, SecondActivity::class.java)
startActivity(intent)`,
        blanks: ["Intent"],
        explanation: "Intent służy do nawigacji między aktywnościami."
    },
    {
        id: 23,
        category: "Bundle",
        code: `val intent = Intent(this, SecondActivity::class.java)
intent.putExtra("_____", "Hello")
startActivity(intent)`,
        blanks: ["message"],
        explanation: "putExtra() dodaje dane do Intent z kluczem 'message'."
    },
    {
        id: 24,
        category: "Receiving Intent Data",
        code: `val message = intent.getStringExtra("_____")
textView.text = message`,
        blanks: ["message"],
        explanation: "getStringExtra() pobiera String z Intent używając klucza."
    },
    {
        id: 25,
        category: "RecyclerView",
        code: `recyclerView._____ = LinearLayoutManager(this)
recyclerView.adapter = myAdapter`,
        blanks: ["layoutManager"],
        explanation: "layoutManager określa sposób układania elementów w RecyclerView."
    },
    {
        id: 26,
        category: "ViewHolder",
        code: `class MyViewHolder(itemView: View) : RecyclerView._____ViewHolder(itemView) {
    val textView: TextView = itemView.findViewById(R.id.textView)
}`,
        blanks: [""],
        explanation: "ViewHolder dziedziczy po RecyclerView.ViewHolder."
    },
    {
        id: 27,
        category: "Companion Object",
        code: `class MyClass {
    _____ object {
        const val CONSTANT = "Hello"
    }
}`,
        blanks: ["companion"],
        explanation: "companion object pozwala na tworzenie statycznych członków klasy."
    },
    {
        id: 28,
        category: "Const Val",
        code: `_____ val PI = 3.14159
fun calculateArea(radius: Double) = PI * radius * radius`,
        blanks: ["const"],
        explanation: "const val tworzy stałą kompilacji."
    },
    {
        id: 29,
        category: "Object Declaration",
        code: `_____ MySingleton {
    fun doSomething() {
        println("Doing something...")
    }
}`,
        blanks: ["object"],
        explanation: "object declaration tworzy singleton."
    },
    {
        id: 30,
        category: "Sealed Class",
        code: `_____ class Result {
    object Success : Result()
    data class Error(val message: String) : Result()
}`,
        blanks: ["sealed"],
        explanation: "sealed class ogranicza hierarchię klas do zdefiniowanych podklas."
    },
    {
        id: 31,
        category: "Enum Class",
        code: `_____ class Direction {
    NORTH, SOUTH, EAST, WEST
}`,
        blanks: ["enum"],
        explanation: "enum class definiuje typ wyliczeniowy."
    },
    {
        id: 32,
        category: "Try-Catch",
        code: `try {
    val result = 10 / 0
} _____ (e: ArithmeticException) {
    println("Błąd dzielenia przez zero")
}`,
        blanks: ["catch"],
        explanation: "catch blok obsługuje wyjątki."
    },
    {
        id: 33,
        category: "Elvis Operator",
        code: `val name: String? = null
val displayName = name _____ "Nieznany"
println(displayName)`,
        blanks: ["?:"],
        explanation: "Elvis operator ?: zwraca wartość domyślną gdy lewa strona jest null."
    },
    {
        id: 34,
        category: "Let Function",
        code: `val name: String? = "Kotlin"
name?._____{ 
    println("Długość: ${it.length}")
}`,
        blanks: ["let"],
        explanation: "let wykonuje blok kodu tylko gdy obiekt nie jest null."
    },
    {
        id: 35,
        category: "Apply Function",
        code: `val person = Person()._____{ 
    name = "Jan"
    age = 25
}`,
        blanks: ["apply"],
        explanation: "apply pozwala na konfigurację obiektu i zwraca ten obiekt."
    },
    {
        id: 36,
        category: "Also Function",
        code: `val numbers = mutableListOf(1, 2, 3)
    ._____{ println("Lista ma ${it.size} elementów") }
    .add(4)`,
        blanks: ["also"],
        explanation: "also wykonuje dodatkową akcję i zwraca oryginalny obiekt."
    },
    {
        id: 37,
        category: "With Function",
        code: `val result = _____(StringBuilder()) {
    append("Hello")
    append(" World")
    toString()
}`,
        blanks: ["with"],
        explanation: "with pozwala na wykonanie operacji na obiekcie bez powtarzania jego nazwy."
    },
    {
        id: 38,
        category: "Run Function",
        code: `val result = "Hello"._____{ 
    length > 3
}`,
        blanks: ["run"],
        explanation: "run wykonuje blok kodu i zwraca jego wynik."
    },
    {
        id: 39,
        category: "Higher-Order Function",
        code: `fun calculate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return _____(x, y)
}`,
        blanks: ["operation"],
        explanation: "Wywołujemy funkcję przekazaną jako parametr."
    },
    {
        id: 40,
        category: "Inline Function",
        code: `_____ fun measureTime(action: () -> Unit) {
    val start = System.currentTimeMillis()
    action()
    val end = System.currentTimeMillis()
    println("Czas: ${end - start}ms")
}`,
        blanks: ["inline"],
        explanation: "inline optymalizuje funkcje wyższego rzędu."
    },
    {
        id: 41,
        category: "Android Lifecycle",
        code: `override fun _____() {
    super.onResume()
    // Aktywność staje się widoczna
}`,
        blanks: ["onResume"],
        explanation: "onResume() jest wywoływane gdy aktywność staje się widoczna."
    },
    {
        id: 42,
        category: "Android Lifecycle",
        code: `override fun onPause() {
    _____.onPause()
    // Aktywność traci fokus
}`,
        blanks: ["super"],
        explanation: "Zawsze wywołujemy super.onPause() w metodach lifecycle."
    },
    {
        id: 43,
        category: "SharedPreferences",
        code: `val sharedPref = getSharedPreferences("MyPref", Context.MODE_PRIVATE)
val editor = sharedPref._____()
editor.putString("key", "value")
editor.apply()`,
        blanks: ["edit"],
        explanation: "edit() zwraca SharedPreferences.Editor do modyfikacji."
    },
    {
        id: 44,
        category: "Reading SharedPreferences",
        code: `val sharedPref = getSharedPreferences("MyPref", Context.MODE_PRIVATE)
val value = sharedPref.getString("key", "_____")`,
        blanks: ["default"],
        explanation: "Drugi parametr getString() to wartość domyślna."
    },
    {
        id: 45,
        category: "Fragment",
        code: `class MyFragment : _____() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_my, container, false)
    }
}`,
        blanks: ["Fragment"],
        explanation: "Fragment dziedziczy po klasie Fragment."
    },
    {
        id: 46,
        category: "Fragment Transaction",
        code: `supportFragmentManager.beginTransaction()
    .replace(R.id.container, MyFragment())
    ._____()`,
        blanks: ["commit"],
        explanation: "commit() wykonuje transakcję fragmentu."
    },
    {
        id: 47,
        category: "AlertDialog",
        code: `AlertDialog.Builder(this)
    .setTitle("Tytuł")
    .setMessage("Wiadomość")
    .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
    ._____()`,
        blanks: ["show"],
        explanation: "show() wyświetla AlertDialog."
    },
    {
        id: 48,
        category: "Menu",
        code: `override fun onCreateOptionsMenu(menu: Menu?): Boolean {
    menuInflater._____(R.menu.main_menu, menu)
    return true
}`,
        blanks: ["inflate"],
        explanation: "inflate() ładuje menu z zasobów XML."
    },
    {
        id: 49,
        category: "Menu Item Click",
        code: `override fun onOptionsItemSelected(item: MenuItem): Boolean {
    return when (item._____) {
        R.id.action_settings -> {
            // Obsługa kliknięcia
            true
        }
        else -> super.onOptionsItemSelected(item)
    }
}`,
        blanks: ["itemId"],
        explanation: "itemId identyfikuje kliknięty element menu."
    },
    {
        id: 50,
        category: "Coroutines",
        code: `_____ fun fetchData() {
    val data = withContext(Dispatchers.IO) {
        // Operacja w tle
        "Dane"
    }
    textView.text = data
}`,
        blanks: ["suspend"],
        explanation: "suspend oznacza funkcję, która może być zawieszona."
    },
    {
        id: 51,
        category: "Launch Coroutine",
        code: `lifecycleScope._____ {
    val result = fetchDataFromNetwork()
    updateUI(result)
}`,
        blanks: ["launch"],
        explanation: "launch uruchamia nową coroutine."
    },
    {
        id: 52,
        category: "Async Coroutine",
        code: `val deferred = _____ {
    fetchDataFromNetwork()
}
val result = deferred.await()`,
        blanks: ["async"],
        explanation: "async uruchamia coroutine i zwraca Deferred."
    },
    {
        id: 53,
        category: "Dispatchers",
        code: `withContext(Dispatchers._____) {
    // Operacje na głównym wątku UI
    textView.text = "Zaktualizowano"
}`,
        blanks: ["Main"],
        explanation: "Dispatchers.Main to dispatcher dla głównego wątku UI."
    },
    {
        id: 54,
        category: "ViewModel",
        code: `class MyViewModel : _____() {
    private val _data = MutableLiveData<String>()
    val data: LiveData<String> = _data
}`,
        blanks: ["ViewModel"],
        explanation: "ViewModel dziedziczy po klasie ViewModel."
    },
    {
        id: 55,
        category: "LiveData Observer",
        code: `viewModel.data._____(this) { data ->
    textView.text = data
}`,
        blanks: ["observe"],
        explanation: "observe() rejestruje obserwatora LiveData."
    },
    {
        id: 56,
        category: "Room Database",
        code: `@_____
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}`,
        blanks: ["Database"],
        explanation: "@Database oznacza klasę bazy danych Room."
    },
    {
        id: 57,
        category: "Room Entity",
        code: `@_____
data class User(
    @PrimaryKey val id: Int,
    val name: String
)`,
        blanks: ["Entity"],
        explanation: "@Entity oznacza tabelę w bazie danych Room."
    },
    {
        id: 58,
        category: "Room DAO",
        code: `@_____
interface UserDao {
    @Query("SELECT * FROM user")
    fun getAllUsers(): List<User>
}`,
        blanks: ["Dao"],
        explanation: "@Dao oznacza interfejs dostępu do danych."
    },
    {
        id: 59,
        category: "Retrofit Interface",
        code: `interface ApiService {
    @_____("users")
    suspend fun getUsers(): Response<List<User>>
}`,
        blanks: ["GET"],
        explanation: "@GET oznacza żądanie HTTP GET."
    },
    {
        id: 60,
        category: "Retrofit POST",
        code: `@POST("users")
suspend fun createUser(@_____ user: User): Response<User>`,
        blanks: ["Body"],
        explanation: "@Body wysyła obiekt jako treść żądania POST."
    },
    {
        id: 61,
        category: "Glide Image Loading",
        code: `_____.with(this)
    .load(imageUrl)
    .into(imageView)`,
        blanks: ["Glide"],
        explanation: "Glide to biblioteka do ładowania obrazów."
    },
    {
        id: 62,
        category: "Picasso Image Loading",
        code: `_____.get()
    .load(imageUrl)
    .into(imageView)`,
        blanks: ["Picasso"],
        explanation: "Picasso to alternatywna biblioteka do ładowania obrazów."
    },
    {
        id: 63,
        category: "Permission Check",
        code: `if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) 
    != PackageManager._____) {
    // Brak uprawnień
}`,
        blanks: ["PERMISSION_GRANTED"],
        explanation: "PERMISSION_GRANTED oznacza, że uprawnienie zostało przyznane."
    },
    {
        id: 64,
        category: "Request Permission",
        code: `ActivityCompat._____Permission(
    this,
    arrayOf(Manifest.permission.CAMERA),
    REQUEST_CODE
)`,
        blanks: ["request"],
        explanation: "requestPermission() prosi o uprawnienia."
    },
    {
        id: 65,
        category: "Notification",
        code: `val notification = NotificationCompat._____(this, CHANNEL_ID)
    .setContentTitle("Tytuł")
    .setContentText("Treść")
    .build()`,
        blanks: ["Builder"],
        explanation: "Builder tworzy powiadomienie."
    },
    {
        id: 66,
        category: "Broadcast Receiver",
        code: `class MyReceiver : _____() {
    override fun onReceive(context: Context?, intent: Intent?) {
        // Obsługa broadcast
    }
}`,
        blanks: ["BroadcastReceiver"],
        explanation: "BroadcastReceiver odbiera broadcast intents."
    },
    {
        id: 67,
        category: "Service",
        code: `class MyService : _____() {
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}`,
        blanks: ["Service"],
        explanation: "Service dziedziczy po klasie Service."
    },
    {
        id: 68,
        category: "Content Provider",
        code: `class MyContentProvider : _____() {
    override fun query(uri: Uri, projection: Array<String>?, selection: String?, 
                      selectionArgs: Array<String>?, sortOrder: String?): Cursor? {
        return null
    }
}`,
        blanks: ["ContentProvider"],
        explanation: "ContentProvider dziedziczy po klasie ContentProvider."
    },
    {
        id: 69,
        category: "Animation",
        code: `val animator = ObjectAnimator.ofFloat(view, "_____", 0f, 1f)
animator.duration = 1000
animator.start()`,
        blanks: ["alpha"],
        explanation: "alpha kontroluje przezroczystość widoku."
    },
    {
        id: 70,
        category: "View Animation",
        code: `view.animate()
    .translationX(100f)
    .setDuration(500)
    ._____()`,
        blanks: ["start"],
        explanation: "start() rozpoczyna animację."
    },
    {
        id: 71,
        category: "Handler",
        code: `val handler = _____()
handler.postDelayed({
    // Kod do wykonania po opóźnieniu
}, 1000)`,
        blanks: ["Handler"],
        explanation: "Handler pozwala na opóźnione wykonanie kodu."
    },
    {
        id: 72,
        category: "Thread",
        code: `_____(Runnable {
    // Kod w tle
    runOnUiThread {
        // Aktualizacja UI
    }
}).start()`,
        blanks: ["Thread"],
        explanation: "Thread tworzy nowy wątek."
    },
    {
        id: 73,
        category: "AsyncTask",
        code: `class MyTask : AsyncTask<Void, Void, String>() {
    override fun _____InBackground(vararg params: Void?): String {
        return "Wynik"
    }
}`,
        blanks: ["doInBackground"],
        explanation: "doInBackground() wykonuje operacje w tle."
    },
    {
        id: 74,
        category: "Gson Parsing",
        code: `val gson = _____()
val user = gson.fromJson(jsonString, User::class.java)`,
        blanks: ["Gson"],
        explanation: "Gson parsuje JSON do obiektów Kotlin."
    },
    {
        id: 75,
        category: "JSON Object",
        code: `val jsonObject = _____Object(jsonString)
val name = jsonObject.getString("name")`,
        blanks: ["JSON"],
        explanation: "JSONObject parsuje JSON string."
    },
    {
        id: 76,
        category: "WebView",
        code: `val webView = findViewById<_____>(R.id.webView)
webView.loadUrl("https://www.google.com")`,
        blanks: ["WebView"],
        explanation: "WebView wyświetla strony internetowe."
    },
    {
        id: 77,
        category: "Camera Intent",
        code: `val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
startActivityForResult(intent, _____REQUEST)`,
        blanks: ["CAMERA"],
        explanation: "CAMERA_REQUEST to kod żądania dla aparatu."
    },
    {
        id: 78,
        category: "File Provider",
        code: `val photoURI = FileProvider.getUriForFile(
    this,
    "com.example.fileprovider",
    _____
)`,
        blanks: ["photoFile"],
        explanation: "photoFile to plik, dla którego generujemy URI."
    },
    {
        id: 79,
        category: "SQLite Database",
        code: `class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    override fun _____Database(db: SQLiteDatabase) {
        db.execSQL(CREATE_TABLE_QUERY)
    }
}`,
        blanks: ["onCreate"],
        explanation: "onCreate() tworzy tabele w bazie danych."
    },
    {
        id: 80,
        category: "Cursor",
        code: `val cursor = db.query(TABLE_NAME, null, null, null, null, null, null)
while (cursor._____()) {
    val name = cursor.getString(cursor.getColumnIndex("name"))
}`,
        blanks: ["moveToNext"],
        explanation: "moveToNext() przesuwa kursor do następnego rekordu."
    },
    {
        id: 81,
        category: "Spinner",
        code: `val spinner = findViewById<_____>(R.id.spinner)
val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, items)
spinner.adapter = adapter`,
        blanks: ["Spinner"],
        explanation: "Spinner to rozwijana lista wyboru."
    },
    {
        id: 82,
        category: "CheckBox",
        code: `val checkBox = findViewById<_____>(R.id.checkBox)
if (checkBox.isChecked) {
    // CheckBox jest zaznaczony
}`,
        blanks: ["CheckBox"],
        explanation: "CheckBox to pole wyboru."
    },
    {
        id: 83,
        category: "RadioButton",
        code: `val radioButton = findViewById<_____>(R.id.radioButton)
radioButton.setOnCheckedChangeListener { _, isChecked ->
    if (isChecked) {
        // RadioButton został wybrany
    }
}`,
        blanks: ["RadioButton"],
        explanation: "RadioButton to przycisk opcji."
    },
    {
        id: 84,
        category: "ProgressBar",
        code: `val progressBar = findViewById<_____>(R.id.progressBar)
progressBar.visibility = View.VISIBLE`,
        blanks: ["ProgressBar"],
        explanation: "ProgressBar pokazuje postęp operacji."
    },
    {
        id: 85,
        category: "SeekBar",
        code: `val seekBar = findViewById<_____>(R.id.seekBar)
seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
    override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
        // Obsługa zmiany
    }
})`,
        blanks: ["SeekBar"],
        explanation: "SeekBar to suwak do wyboru wartości."
    },
    {
        id: 86,
        category: "Switch",
        code: `val switch = findViewById<_____>(R.id.switch)
switch.setOnCheckedChangeListener { _, isChecked ->
    if (isChecked) {
        // Switch włączony
    }
}`,
        blanks: ["Switch"],
        explanation: "Switch to przełącznik włącz/wyłącz."
    },
    {
        id: 87,
        category: "ImageView",
        code: `val imageView = findViewById<_____>(R.id.imageView)
imageView.setImageResource(R.drawable.my_image)`,
        blanks: ["ImageView"],
        explanation: "ImageView wyświetla obrazy."
    },
    {
        id: 88,
        category: "VideoView",
        code: `val videoView = findViewById<_____>(R.id.videoView)
videoView.setVideoURI(uri)
videoView.start()`,
        blanks: ["VideoView"],
        explanation: "VideoView odtwarza filmy."
    },
    {
        id: 89,
        category: "MediaPlayer",
        code: `val mediaPlayer = _____.create(this, R.raw.audio_file)
mediaPlayer.start()`,
        blanks: ["MediaPlayer"],
        explanation: "MediaPlayer odtwarza pliki audio."
    },
    {
        id: 90,
        category: "Vibrator",
        code: `val vibrator = getSystemService(Context._____SERVICE) as Vibrator
vibrator.vibrate(1000)`,
        blanks: ["VIBRATOR"],
        explanation: "VIBRATOR_SERVICE dostarcza usługę wibracji."
    },
    {
        id: 91,
        category: "Sensor Manager",
        code: `val sensorManager = getSystemService(Context._____SERVICE) as SensorManager
val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)`,
        blanks: ["SENSOR"],
        explanation: "SENSOR_SERVICE zarządza czujnikami urządzenia."
    },
    {
        id: 92,
        category: "Location Manager",
        code: `val locationManager = getSystemService(Context._____SERVICE) as LocationManager
val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)`,
        blanks: ["LOCATION"],
        explanation: "LOCATION_SERVICE dostarcza usługi lokalizacji."
    },
    {
        id: 93,
        category: "Bluetooth",
        code: `val bluetoothAdapter = BluetoothAdapter._____()
if (bluetoothAdapter?.isEnabled == true) {
    // Bluetooth włączony
}`,
        blanks: ["getDefaultAdapter"],
        explanation: "getDefaultAdapter() zwraca domyślny adapter Bluetooth."
    },
    {
        id: 94,
        category: "WiFi Manager",
        code: `val wifiManager = applicationContext.getSystemService(Context._____SERVICE) as WifiManager
val wifiInfo = wifiManager.connectionInfo`,
        blanks: ["WIFI"],
        explanation: "WIFI_SERVICE zarządza połączeniami WiFi."
    },
    {
        id: 95,
        category: "Alarm Manager",
        code: `val alarmManager = getSystemService(Context._____SERVICE) as AlarmManager
alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)`,
        blanks: ["ALARM"],
        explanation: "ALARM_SERVICE zarządza alarmami systemowymi."
    },
    {
        id: 96,
        category: "Notification Manager",
        code: `val notificationManager = getSystemService(Context._____SERVICE) as NotificationManager
notificationManager.notify(1, notification)`,
        blanks: ["NOTIFICATION"],
        explanation: "NOTIFICATION_SERVICE zarządza powiadomieniami."
    },
    {
        id: 97,
        category: "Package Manager",
        code: `val packageManager = _____
val appInfo = packageManager.getApplicationInfo(packageName, 0)`,
        blanks: ["getPackageManager()"],
        explanation: "getPackageManager() zwraca menedżera pakietów."
    },
    {
        id: 98,
        category: "Activity Manager",
        code: `val activityManager = getSystemService(Context._____SERVICE) as ActivityManager
val runningApps = activityManager.runningAppProcesses`,
        blanks: ["ACTIVITY"],
        explanation: "ACTIVITY_SERVICE zarządza aktywnościami."
    },
    {
        id: 99,
        category: "Telephony Manager",
        code: `val telephonyManager = getSystemService(Context._____SERVICE) as TelephonyManager
val phoneNumber = telephonyManager.line1Number`,
        blanks: ["TELEPHONY"],
        explanation: "TELEPHONY_SERVICE dostarcza informacje o telefonie."
    },
    {
        id: 100,
        category: "Download Manager",
        code: `val downloadManager = getSystemService(Context._____SERVICE) as DownloadManager
val request = DownloadManager.Request(uri)
downloadManager.enqueue(request)`,
        blanks: ["DOWNLOAD"],
        explanation: "DOWNLOAD_SERVICE zarządza pobieraniem plików."
    }
];

// Stan quizu
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// Elementy DOM
const startScreen = document.getElementById('startScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const questionNumber = document.getElementById('questionNumber');
const totalQuestions = document.getElementById('totalQuestions');
const progress = document.getElementById('progress');
const nextBtn = document.getElementById('nextBtn');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const shareBtn = document.getElementById('shareBtn');
const finalScore = document.getElementById('finalScore');
const totalScore = document.getElementById('totalScore');
const scoreMessage = document.getElementById('scoreMessage');

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing quiz...');
    
    // Sprawdź czy wszystkie elementy istnieją
    if (!startBtn || !nextBtn || !restartBtn || !shareBtn) {
        console.error('Missing DOM elements!');
        return;
    }
    
    // Dodaj event listenery
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    shareBtn.addEventListener('click', shareResult);
    
    // Upewnij się że start screen jest widoczny
    startScreen.style.display = 'block';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    console.log('Quiz initialized successfully!');
});

function startQuiz() {
    console.log('Starting quiz...');
    
    try {
        // Losuj 5 pytań z bazy
        currentQuestions = getRandomQuestions(5);
        console.log('Selected questions:', currentQuestions.length);
        
        if (currentQuestions.length === 0) {
            console.error('No questions selected!');
            alert('Błąd: Nie udało się załadować pytań. Spróbuj odświeżyć stronę.');
            return;
        }
        
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        
        // Ukryj ekran startowy i pokaż quiz
        startScreen.style.display = 'none';
        quizContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        // Ustaw licznik pytań
        totalQuestions.textContent = currentQuestions.length;
        
        // Pokaż pierwsze pytanie
        showQuestion();
        
        console.log('Quiz started successfully!');
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Błąd podczas uruchamiania quizu. Spróbuj odświeżyć stronę.');
    }
}

function getRandomQuestions(count) {
    console.log('Getting random questions, database size:', questionsDatabase.length);
    
    if (!questionsDatabase || questionsDatabase.length === 0) {
        console.error('Questions database is empty!');
        return [];
    }
    
    const shuffled = [...questionsDatabase].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    console.log('Selected questions:', selected.map(q => q.id));
    return selected;
}

function showQuestion() {
    console.log('Showing question:', currentQuestionIndex + 1);
    
    try {
        const question = currentQuestions[currentQuestionIndex];
        
        if (!question) {
            console.error('Question not found at index:', currentQuestionIndex);
            return;
        }
        
        // Aktualizuj liczniki i pasek postępu
        questionNumber.textContent = currentQuestionIndex + 1;
        progress.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
        
        // Pokaż kategorię i kod
        questionText.innerHTML = `
            <div class="question-category">${question.category}</div>
            <div class="code-block">
                <pre><code>${question.code}</code></pre>
            </div>
            <p>Uzupełnij brakujące fragmenty kodu:</p>
        `;
        
        // Generuj pola input dla każdej luki
        answersContainer.innerHTML = '';
        
        if (!question.blanks || question.blanks.length === 0) {
            console.error('Question has no blanks:', question);
            return;
        }
        
        question.blanks.forEach((blank, index) => {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            
            const label = document.createElement('label');
            label.textContent = `Luka ${index + 1}:`;
            label.className = 'input-label';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'code-input';
            input.placeholder = 'Wpisz brakujący kod...';
            input.dataset.index = index;
            
            // Dodaj event listener dla sprawdzania odpowiedzi
            input.addEventListener('input', checkAnswers);
            
            inputContainer.appendChild(label);
            inputContainer.appendChild(input);
            answersContainer.appendChild(inputContainer);
        });
        
        // Wyłącz przycisk "Następne"
        nextBtn.disabled = true;
        nextBtn.textContent = 'Sprawdź odpowiedzi';
        
        console.log('Question displayed successfully');
    } catch (error) {
        console.error('Error showing question:', error);
        alert('Błąd podczas wyświetlania pytania.');
    }
}

function checkAnswers() {
    const question = currentQuestions[currentQuestionIndex];
    const inputs = answersContainer.querySelectorAll('.code-input');
    let allFilled = true;
    let allCorrect = true;
    
    inputs.forEach((input, index) => {
        const userAnswer = input.value.trim();
        const correctAnswer = question.blanks[index];
        
        if (userAnswer === '') {
            allFilled = false;
            input.classList.remove('correct', 'incorrect');
        } else {
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
                allCorrect = false;
            }
        }
    });
    
    if (allFilled) {
        nextBtn.disabled = false;
        if (allCorrect) {
            nextBtn.textContent = 'Następne pytanie';
        } else {
            nextBtn.textContent = 'Pokaż poprawne odpowiedzi';
        }
    } else {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Sprawdź odpowiedzi';
    }
}

function nextQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const inputs = answersContainer.querySelectorAll('.code-input');
    let questionScore = 0;
    let totalBlanks = question.blanks.length;
    
    // Sprawdź odpowiedzi i policz punkty
    inputs.forEach((input, index) => {
        const userAnswer = input.value.trim();
        const correctAnswer = question.blanks[index];
        
        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            questionScore++;
        }
    });
    
    // Dodaj punkty (proporcjonalnie)
    score += (questionScore / totalBlanks);
    
    // Zapisz odpowiedzi użytkownika
    userAnswers.push({
        question: question,
        userInputs: Array.from(inputs).map(input => input.value.trim()),
        score: questionScore,
        maxScore: totalBlanks
    });
    
    // Pokaż poprawne odpowiedzi jeśli nie wszystkie są correct
    const allCorrect = Array.from(inputs).every(input => input.classList.contains('correct'));
    
    if (!allCorrect) {
        showCorrectAnswers();
        nextBtn.textContent = 'Następne pytanie';
        nextBtn.onclick = proceedToNext;
        return;
    }
    
    proceedToNext();
}

function showCorrectAnswers() {
    const question = currentQuestions[currentQuestionIndex];
    const inputs = answersContainer.querySelectorAll('.code-input');
    
    inputs.forEach((input, index) => {
        input.value = question.blanks[index];
        input.classList.add('correct');
        input.classList.remove('incorrect');
        input.disabled = true;
    });
    
    // Pokaż wyjaśnienie
    const explanation = document.createElement('div');
    explanation.className = 'explanation';
    explanation.innerHTML = `<strong>Wyjaśnienie:</strong> ${question.explanation}`;
    answersContainer.appendChild(explanation);
}

function proceedToNext() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
        nextBtn.onclick = nextQuestion;
    } else {
        showResults();
    }
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    const finalScoreRounded = Math.round(score);
    const maxScore = currentQuestions.length;
    
    finalScore.textContent = finalScoreRounded;
    totalScore.textContent = maxScore;
    
    // Ustaw wiadomość na podstawie wyniku
    const percentage = (score / maxScore) * 100;
    let message = '';
    
    if (percentage >= 90) {
        message = '🏆 Doskonały wynik! Jesteś ekspertem Kotlin!';
    } else if (percentage >= 70) {
        message = '🎉 Świetny wynik! Masz solidną wiedzę o Kotlin!';
    } else if (percentage >= 50) {
        message = '👍 Dobry wynik! Warto jeszcze poćwiczyć!';
    } else {
        message = '📚 Nie martw się! Praktyka czyni mistrza!';
    }
    
    scoreMessage.textContent = message;
}

function restartQuiz() {
    resultsContainer.style.display = 'none';
    startScreen.style.display = 'block';
}

function shareResult() {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    const text = `Właśnie ukończyłem Quiz Kotlin z wynikiem ${Math.round(score)}/${currentQuestions.length} (${percentage}%)! 🚀 Sprawdź swoją wiedzę: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quiz Kotlin - Mój wynik',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback - kopiuj do schowka
        navigator.clipboard.writeText(text).then(() => {
            alert('Wynik skopiowany do schowka!');
        });
    }
} 