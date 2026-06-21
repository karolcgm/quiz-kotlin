import { sendTeacherNotificationAction } from "@/lib/actions/notifications";

type ClassOption = {
  id: string;
  label: string;
};

type StudentOption = {
  id: string;
  label: string;
};

interface SendNotificationFormProps {
  classes: ClassOption[];
  students: StudentOption[];
}

export function SendNotificationForm({ classes, students }: SendNotificationFormProps) {
  return (
    <form action={sendTeacherNotificationAction} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Tytuł</span>
        <input
          name="title"
          required
          placeholder="Np. Przypomnienie o teście"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Treść</span>
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Treść powiadomienia dla uczniów..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Link (opcjonalnie)</span>
        <input
          name="linkHref"
          placeholder="/uczen/testy"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-700">Odbiorcy</legend>
        <label className="flex items-center gap-3">
          <input type="radio" name="scope" value="class" defaultChecked />
          <span>Cała grupa</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="radio" name="scope" value="selected" />
          <span>Wybrani uczniowie</span>
        </label>
        <select name="classId" className="w-full rounded-xl border border-slate-200 px-4 py-3">
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-3">
          {students.map((student) => (
            <label key={student.id} className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="studentIds" value={student.id} />
              <span>{student.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
        Wyślij powiadomienie
      </button>
    </form>
  );
}
