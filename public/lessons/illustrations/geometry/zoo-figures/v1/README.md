# WP-S4-A0 — `Zoo figur` — manifest assetów v1

Pakiet zawiera wyłącznie lokalne bitmapy przygotowane dla planszy `Zoo figur`.
Nie zawiera siatki, figur, pomiarów, etykiet ani logiki odpowiedzi — te warstwy
mają pozostać ostrym, skalowalnym HTML/SVG aplikacji.

Źródła zostały wygenerowane narzędziem built-in `imagegen`. Nie użyto
zewnętrznych zdjęć, stocków, logotypów ani znaków towarowych. Zwierzęta
wygenerowano na jednolitym tle chroma-key i wycięto lokalnie skryptem
`remove_chroma_key.py` dostarczonym ze skillem `imagegen`.

## Pliki

| Plik | Wymiary | Tryb | Rozmiar | SHA-256 | Tekst alternatywny |
|---|---:|---|---:|---|---|
| `zoo-figures-background-v1.webp` | 1672×941 | RGB | 187 658 B | `a780c8e974526b003e170eec080581e16ec1c8de5337647e383d4539f6aa984b` | Plan niewielkiego zoo widziany z góry: cztery puste strefy wokół jasnego centralnego placu, alejki, staw po prawej, roślinność na obrzeżach i wejście od dołu. |
| `zoo-figures-lion-cutout-v1.webp` | 1024×819 | RGBA | 83 094 B | `6bbab87716e50c644e64cad84d054a71fe43e4286c5a0c8fa162e535a6edbdbe` | Ilustracja lwa stojącego w lekkim obrocie. |
| `zoo-figures-giraffe-cutout-v1.webp` | 683×1024 | RGBA | 76 470 B | `98598aa2320b16d64eeed0ba50babe7ad32ffa87af6726127b78a312fb09949a` | Ilustracja żyrafy stojącej w lekkim obrocie. |
| `zoo-figures-elephant-cutout-v1.webp` | 1024×768 | RGBA | 95 920 B | `f3cb6d2c0d8b5cfc4ada9febe4b4d342fb0a573923cc977e1c9abb94e8bae8cc` | Ilustracja słonia stojącego w lekkim obrocie. |
| `zoo-figures-penguin-cutout-v1.webp` | 819×1024 | RGBA | 54 860 B | `ca38af0d285cc059f5537e8e0aaab77756946fd96a0d0921021af2b821dbd391` | Ilustracja pingwina stojącego w lekkim obrocie. |

Teksty alternatywne identyfikują układ lub zwierzę, ale nie opisują figur,
własności ani oczekiwanego rozmieszczenia wybiegów.

## Zasady użycia

### Widok standardowy

- Tło jest wyłącznie dekoracyjną mapą pod warstwą roboczą. Nie wolno na jego
  podstawie wyznaczać wierzchołków, kolizji, klasyfikacji ani poprawności.
- Skalować tło proporcjonalnie w trybie `contain`, wyśrodkowane na neutralnym
  kolorze bazowym. Nie używać `cover` w widoku 4:3 ani pionowym, ponieważ
  przycięcie usunęłoby część stref lub staw.
- Na tle należy umieścić osobną, półprzezroczystą warstwę kontrastową, a dopiero
  nad nią siatkę i figury SVG. Centralny obszar bitmapy celowo jest jasny,
  spokojny i ma mało detali.
- Cztery barwne strefy są neutralnymi obszarami krajobrazu, nie gotowymi
  wybiegami. Ich organiczny obrys nie może być traktowany jako odpowiedź.
- Zwierzęta są niezależnymi nakładkami. Każde musi mieć dostępny odpowiednik
  tekstowy w karcie potrzeb lub w nazwie kontrolki; obraz nie może być jedynym
  nośnikiem informacji.
- Tło nie zawiera siatki, tekstu matematycznego, pomiarów ani ogrodzeń
  wyznaczających odpowiedź. Krótkie elementy przy dolnej krawędzi oznaczają
  wyłącznie wejście i nie zamykają żadnej strefy.

### High contrast

- Nie renderować `zoo-figures-background-v1.webp`. Użyć jednolitego koloru
  systemowego oraz wysokokontrastowej siatki, stref i etykiet generowanych
  przez aplikację.
- Zwierzęta mogą pozostać pomocniczymi ikonami tylko wtedy, gdy towarzyszy im
  widoczna nazwa i wyraźny obrys warstwy aplikacji. Nie polegać wyłącznie na
  barwie lub sylwetce.
- Prosty widok bez tła jest celowym wariantem dostępności, a nie brakującym
  assetem rastrowym.

### Druk

- Domyślnie pominąć tło i wydrukować białą mapę z siatką, strefami, kartami
  warunków i figurami tworzonymi przez warstwę SVG/druk aplikacji. Oszczędza to
  tusz i utrzymuje ostrość geometrii.
- Jeżeli zwierzęta są potrzebne jako identyfikatory kart, można użyć ich w
  małej skali lub skali szarości, zawsze razem z nazwą tekstową. Nie mogą
  wpływać na wynik zadania.
- Wydruk i high contrast badają te same `skillIds`; ilustracja pozostaje
  elementem fabularnym, nie dowodem matematycznym.

## Prompty źródłowe

### Tło

```text
Use case: stylized-concept
Asset type: educational game environment background for a Polish grade-5 geometry lesson, "Zoo figur"
Primary request: create an original, polished zoo-plan background that can sit behind a crisp interactive SVG grid and draggable geometry. It must feel welcoming but remain visually quiet.
Scene/backdrop: a small zoo campus seen from directly above or an extremely slight orthographic isometric angle. Four clearly readable habitat zones are suggested only by gentle changes in ground material and sparse landscaping near the outer edges. Include empty pedestrian paths, one small calm pond, restrained clusters of shrubs and trees at the perimeter, and a modest open entrance at the bottom edge. Keep a very large uncluttered pale central working area for an overlay grid and figures.
Style/medium: smooth storybook 3D illustration with subtle hand-painted texture, clean rounded forms, classroom-friendly, consistent with a premium children's learning app
Composition/framing: wide 16:9 landscape; orthographic/top-down; no horizon; no vanishing point; no lens distortion; straight map-like alignment; generous safe margins; center at least 50% of canvas visually empty and low-detail
Lighting/mood: soft even daylight, calm and friendly, no dramatic shadows
Color palette: quiet desaturated sage, pale aqua, warm sand, muted teal, small warm amber accents; center very pale and neutral for strong overlay contrast
Constraints: four zones must remain neutral canvases rather than pre-shaped mathematical answers; paths may be gently organic; entrance must not contain lettering; no animals or people
Avoid: fences, railings, walls, enclosure outlines, ready-made polygons, geometric answer shapes, visible grid, graph paper, measurements, numbers, letters, labels, mathematical text, equations, arrows, icons, sign text, perspective distortion, crowded center, photorealism, logos, trademarks, watermark
```

### Zwierzęta — wspólny szablon

Każdy wiersz tabeli poniżej został podstawiony do pól `Primary request` i
`Subject`, a następnie wysłany jako osobne wywołanie built-in `imagegen`.

```text
Use case: stylized-concept
Asset type: draggable animal game sprite for the same educational "Zoo figur" lesson
Primary request: <PRIMARY REQUEST>
Subject: <SUBJECT>
Style/medium: premium smooth storybook 3D / soft clay illustration; clean rounded forms; very subtle painted texture; identical visual language to a polished children's learning app animal set
Composition/framing: one centered animal only; full body entirely visible; generous empty padding on all sides; strong silhouette; slight three-quarter view; no cropping
Lighting/mood: soft even studio-like light on the animal, friendly and calm
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal
Constraints: background must be one uniform exact green color with no shadows, gradients, texture, reflections, floor plane, or lighting variation; subject must use no green or teal; crisp antialiased edges; smooth sculpted fur/feather details without loose strands; no cast shadow, no contact shadow, no reflection; no accessories
Avoid: realistic fur or feather strands, wispy hair, fuzzy edges, transparency, motion blur, extra animals, scenery, plants, ground, text, labels, logos, trademarks, watermark
```

| Zwierzę | `PRIMARY REQUEST` | `SUBJECT` |
|---|---|---|
| lew | an original friendly lion, full body, standing in a simple three-quarter pose, designed as a clean isolated cutout asset | one child-friendly lion with a warm ochre body, rounded dark caramel mane rendered as a smooth sculpted shape, expressive but not babyish, four legs and tail fully visible, anatomically readable silhouette |
| żyrafa | an original friendly giraffe, full body, standing in a simple three-quarter pose, designed as a clean isolated cutout asset | one child-friendly giraffe with warm golden coat and rounded chestnut patches, long neck fully visible, small ossicones, four legs and tail fully visible, anatomically readable but softly stylized proportions, calm expression |
| słoń | an original friendly elephant, full body, standing in a simple three-quarter pose, designed as a clean isolated cutout asset | one child-friendly African elephant with soft warm gray skin, broad ears, gently curved trunk, small ivory tusks, four legs and tail fully visible, anatomically readable but softly stylized proportions, calm intelligent expression |
| pingwin | an original friendly penguin, full body, standing in a simple three-quarter pose, designed as a clean isolated cutout asset | one child-friendly penguin with smooth charcoal-black back and head, bright white belly, warm amber beak and feet, both flippers fully visible, anatomically readable but softly stylized proportions, calm cheerful expression |

## Obróbka i weryfikacja

- Tło zachowano w źródłowej rozdzielczości 1672×941 i zapisano jako WebP
  `quality=86`, `method=6`.
- Dla zwierząt użyto `--auto-key border --soft-matte
  --transparent-threshold 12 --opaque-threshold 220 --despill`, następnie
  przeskalowano dłuższy bok do maksymalnie 1024 px i zapisano jako WebP
  `quality=90`, `method=6`.
- Wszystkie cztery wycięcia dekodują się jako RGBA, mają przezroczyste cztery
  narożniki, niepusty obrys alfa i margines dookoła sylwetki.
- Kontrola półprzezroczystych krawędzi po chroma-key nie wykryła zielonej
  dominanty; nie było potrzeby używania `--edge-contract`.
- Kontrola wizualna potwierdziła: rzut mapowy bez perspektywy deformującej
  siatkę, spokojny pusty środek, cztery strefy, alejki, staw, roślinność,
  wejście oraz brak tekstu i gotowych ogrodzeń wybiegów.

## Ograniczenia v1

- Pakiet zawiera cztery wymagane gatunki. Kolejne gatunki powinny powstać jako
  nowe, wersjonowane pliki w tym samym stylu, bez nadpisywania v1.
- Ta paczka celowo nie podłącza assetów do lekcji i nie zmienia kodu. Integracja
  należy do osobnego kontekstu tematycznego po ukończeniu fundamentów.
- Wariant high contrast/print jest regułą renderowania bez tła rastrowego,
  opisaną powyżej; nie jest osobną bitmapą.
