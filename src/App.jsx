import React, { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import AuthPanel from "./components/AuthPanel.jsx";
import CommunityFeed from "./components/CommunityFeed.jsx";

const steps = ["Welcome", "Assessment", "Goals", "Plan", "Community"]; 

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; }
};

function useLocalState(key, defaultValue) {
  const [value, setValue] = useState(() => load(key, defaultValue));
  useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue];
}

const Divider = () => <div className="h-px w-full bg-gray-200 my-6" />;

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
    {children}
  </span>
);

const Card = ({ title, children, footer }) => (
  <div className="rounded-2xl shadow-sm border p-6 bg-white">
    {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
    <div className="text-sm text-gray-800">{children}</div>
    {footer && <div className="mt-4">{footer}</div>}
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm border bg-white hover:bg-gray-50 active:translate-y-[1px] ${className}`}
    {...props}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm bg-black text-white hover:opacity-90 active:translate-y-[1px] ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function App() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const [step, setStep] = useLocalState("50plus.step", 0);
  const [profile, setProfile] = useLocalState("50plus.profile", {
    name: "",
    sex: "female",
    age: 50,
    height_cm: 165,
    weight_kg: 75,
    menopause: "post",
    conditions: [],
    meds: "",
  });
  const [goals, setGoals] = useLocalState("50plus.goals", {
    priorities: ["energy", "weight", "mobility"],
    activityLevel: "light",
    stress: 3,
    sleepHours: 6,
  });

  const bmi = useMemo(() => {
    const h = (profile.height_cm || 1) / 100;
    return +(profile.weight_kg / (h * h)).toFixed(1);
  }, [profile.height_cm, profile.weight_kg]);

  const macros = useMemo(() => {
    const base = goals.activityLevel === "high" ? 1.5 : goals.activityLevel === "moderate" ? 1.3 : 1.15;
    const estBMR = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - (profile.sex === "female" ? 161 : -5);
    const tdee = Math.round(estBMR * base);
    const protein_g = Math.round((profile.sex === "female" ? 1.2 : 1.1) * profile.weight_kg);
    const fat_g = Math.round((0.3 * tdee) / 9);
    const carbs_g = Math.round((tdee - (protein_g * 4 + fat_g * 9)) / 4);
    return { tdee, protein_g, fat_g, carbs_g };
  }, [goals.activityLevel, profile]);

  const recs = useMemo(() => generateRecommendations(profile, goals, bmi, macros), [profile, goals, bmi, macros]);

  const resetAll = () => {
    localStorage.removeItem("50plus.step");
    localStorage.removeItem("50plus.profile");
    localStorage.removeItem("50plus.goals");
    setStep(0);
    setProfile({ name: "", sex: "female", age: 50, height_cm: 165, weight_kg: 75, menopause: "post", conditions: [], meds: "" });
    setGoals({ priorities: ["energy", "weight", "mobility"], activityLevel: "light", stress: 3, sleepHours: 6 });
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <header className="max-w-5xl mx-auto px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/90 text-white grid place-items-center text-xs font-bold">50+</div>
          <div>
            <h1 className="text-xl font-bold">50plus Health & Wellness</h1>
            <p className="text-xs text-gray-600">Personalized guidance for thriving after 50</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={resetAll} title="Clear saved data">Reset</Button>
          <Chip>Draft MVP</Chip>
        </div>
      </header>

      <nav className="max-w-5xl mx-auto px-4 mt-6">
        <ol className="flex flex-wrap gap-2 text-xs">
          {steps.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={`px-3 py-1 rounded-full border ${i === step ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
              >
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="max-w-5xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-6">
          {step === 0 && <Welcome onStart={() => setStep(1)} />}
          {step === 1 && <Assessment profile={profile} setProfile={setProfile} bmi={bmi} />}
          {step === 2 && <Goals goals={goals} setGoals={setGoals} />}
          {step === 3 && <Plan profile={profile} goals={goals} bmi={bmi} macros={macros} recs={recs} />}
          {step === 4 && <div className="grid gap-4"><AuthPanel onSession={setSession} /><CommunityFeed session={session} /></div>}
        </div>

        <aside className="grid gap-6">
          <Card title="Quick Stats">
            <ul className="space-y-2">
              <li><span className="font-medium">BMI:</span> {bmi || "—"}</li>
              <li><span className="font-medium">TDEE:</span> {macros.tdee} kcal/day</li>
              <li><span className="font-medium">Protein:</span> {macros.protein_g} g/day</li>
              <li><span className="font-medium">Fat:</span> {macros.fat_g} g/day</li>
              <li><span className="font-medium">Carbs:</span> {macros.carbs_g} g/day</li>
            </ul>
          </Card>

          <Card title="Medical Disclaimer">
            <p>
              Educational use only. Not medical advice. Always consult a healthcare professional or a registered dietitian before changing diet, exercise, or medications.
            </p>
          </Card>

          <Card title="Next Steps" footer={<div className="flex gap-2 flex-wrap"><PrimaryButton onClick={() => setStep(Math.min(step + 1, steps.length - 1))}>Continue</PrimaryButton>{isSupabaseConfigured && session && <Button onClick={async () => { await saveToCloud(profile, goals); alert("Saved to cloud"); }}>Save to Cloud</Button>}{isSupabaseConfigured && !session && <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Sign in above to save</Button>}</div>}>
            <ul className="list-disc pl-5 space-y-2">
              <li>Finish assessment and goals</li>
              <li>Review your personalized plan</li>
              <li>Say hello in the community</li>
            </ul>
          </Card>
        </aside>
      </section>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-xs text-gray-500">
        © {new Date().getFullYear()} 50plus Health & Wellness. For education only.
      </footer>
    </main>
  );
}

function Welcome({ onStart }) {
  return (
    <Card>
      <div className="prose prose-sm max-w-none">
        <h2 className="text-2xl font-bold">Welcome</h2>
        <p>
          50plus helps you build sustainable habits with age-aware nutrition, joint-friendly fitness, stress tools, and a supportive community. Start with a quick assessment to tailor your plan.
        </p>
        <div className="mt-4 flex gap-3">
          <PrimaryButton onClick={onStart}>Start Assessment</PrimaryButton>
          <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Learn more</Button>
        </div>
        <Divider />
        <h3 className="font-semibold">What makes 50plus different?</h3>
        <ul className="list-disc pl-5">
          <li>Designed specifically for ages 50+</li>
          <li>Focus on bone health, muscle preservation, balance, and sleep</li>
          <li>Plain-language guidance with safety in mind</li>
        </ul>
      </div>
    </Card>
  );
}

function Assessment({ profile, setProfile, bmi }) {
  return (
    <Card title="Personalized Health Assessment">
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name">
            <input className="w-full border rounded-xl px-3 py-2" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Optional" />
          </Field>

          <Field label="Sex">
            <select className="w-full border rounded-xl px-3 py-2" value={profile.sex} onChange={e => setProfile({ ...profile, sex: e.target.value })}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Age">
            <input type="number" className="w-full border rounded-xl px-3 py-2" value={profile.age} onChange={e => setProfile({ ...profile, age: +e.target.value })} min={45} max={100} />
          </Field>
          <Field label="Height (cm)">
            <input type="number" className="w-full border rounded-xl px-3 py-2" value={profile.height_cm} onChange={e => setProfile({ ...profile, height_cm: +e.target.value })} min={130} max={220} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" className="w-full border rounded-xl px-3 py-2" value={profile.weight_kg} onChange={e => setProfile({ ...profile, weight_kg: +e.target.value })} min={35} max={200} />
          </Field>
        </div>

        {profile.sex === "female" && (
          <Field label="Menopause status">
            <select className="w-full border rounded-xl px-3 py-2" value={profile.menopause} onChange={e => setProfile({ ...profile, menopause: e.target.value })}>
              <option value="pre">Pre</option>
              <option value="peri">Peri</option>
              <option value="post">Post</option>
            </select>
          </Field>
        )}

        <Field label="Health conditions (optional)">
          <MultiTagInput
            placeholder="Type and press Enter (e.g., hypertension, prediabetes)"
            values={profile.conditions}
            onChange={(vals) => setProfile({ ...profile, conditions: vals })}
          />
        </Field>

        <Field label="Current medications/supplements (optional)">
          <textarea className="w-full border rounded-xl px-3 py-2" rows={3} value={profile.meds} onChange={e => setProfile({ ...profile, meds: e.target.value })} />
        </Field>

        <Divider />
        <div className="text-sm">
          <p className="font-medium">Your BMI: {bmi || "—"}</p>
          <p className="text-gray-600">BMI is a rough screening tool and not a diagnosis.</p>
        </div>

        <div className="flex gap-3">
          <PrimaryButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Save</PrimaryButton>
        </div>
      </form>
    </Card>
  );
}

function Goals({ goals, setGoals }) {
  const toggle = (k) => {
    const set = new Set(goals.priorities);
    set.has(k) ? set.delete(k) : set.add(k);
    setGoals({ ...goals, priorities: Array.from(set) });
  };
  return (
    <Card title="Goals & Lifestyle">
      <div className="grid gap-4">
        <Field label="Top priorities">
          <div className="flex flex-wrap gap-2">
            {[
              ["weight", "Weight management"],
              ["energy", "Energy"],
              ["mobility", "Mobility & balance"],
              ["strength", "Strength"],
              ["sleep", "Sleep"],
              ["stress", "Stress reduction"],
              ["bloodpressure", "Blood pressure"],
              ["cholesterol", "Cholesterol"],
              ["bone", "Bone density"],
            ].map(([k, label]) => (
              <button key={k} type="button" onClick={() => toggle(k)} className={`px-3 py-1 rounded-full border ${goals.priorities.includes(k) ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Activity level">
            <select className="w-full border rounded-xl px-3 py-2" value={goals.activityLevel} onChange={e => setGoals({ ...goals, activityLevel: e.target.value })}>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Stress (1–5)">
            <input type="range" min={1} max={5} value={goals.stress} onChange={e => setGoals({ ...goals, stress: +e.target.value })} />
          </Field>
          <Field label="Sleep (hrs/night)">
            <input type="number" className="w-full border rounded-xl px-3 py-2" min={3} max={12} value={goals.sleepHours} onChange={e => setGoals({ ...goals, sleepHours: +e.target.value })} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function Plan({ profile, goals, bmi, macros, recs }) {
  return (
    <Card title="Your Personalized Plan">
      <div className="grid gap-6">
        <section>
          <h4 className="font-semibold mb-2">Daily Nutrition Targets</h4>
          <ul className="list-disc pl-5">
            <li>Calories (est.): {macros.tdee} kcal/day</li>
            <li>Protein: {macros.protein_g} g/day (spread over meals to support muscle)</li>
            <li>Fat: {macros.fat_g} g/day</li>
            <li>Carbohydrates: {macros.carbs_g} g/day</li>
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-2">Nutrition Guidance</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recs.nutrition.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-2">Sample Day (Women 50+)</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Breakfast: Greek yogurt + berries + chia; or eggs + sautéed greens</li>
            <li>Lunch: Salmon salad, mixed greens, olive oil vinaigrette; whole grain</li>
            <li>Snack: Cottage cheese or edamame; fruit</li>
            <li>Dinner: Chicken or tofu, quinoa, roasted veg; add leafy greens</li>
            <li>Hydration: Aim for ~2 liters water; limit added sugars</li>
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-2">Movement Plan</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recs.fitness.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-2">Sleep & Stress</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recs.recovery.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-2">Safety Notes</h4>
          <p className="text-gray-700">If you have conditions like hypertension, diabetes, osteoporosis, or are on medications, seek personalized guidance from your clinician before starting new programs.</p>
        </section>
      </div>
    </Card>
  );
}

function Community() {
  return (
    <Card title="Community (Coming Soon)">
      <p>
        This is a safe, moderated space for people 50+ to share wins, ask questions, and stay accountable. In the MVP, we'll pilot weekly prompts and small-group check-ins.
      </p>
      <ul className="list-disc pl-5 mt-3">
        <li>Prompt of the week: What habit moved the needle for you?</li>
        <li>Try a 7-day balance challenge.</li>
        <li>Report back on your protein-at-breakfast experiment.</li>
      </ul>
      <div className="mt-4">
        <Button onClick={() => alert("Community features will be enabled in the next build.")}>Request early access</Button>
      </div>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function MultiTagInput({ values = [], onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = (v) => {
    const val = v.trim();
    if (!val) return;
    const set = new Set(values.map((x) => x.toLowerCase()));
    if (!set.has(val.toLowerCase())) onChange([...values, val]);
  };
  return (
    <div className="flex flex-wrap gap-2 border rounded-xl p-2">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs">
          {v}
          <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="ml-1 text-gray-500 hover:text-black">×</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[140px] outline-none text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); add(input); setInput(""); }
          if (e.key === ",") { e.preventDefault(); add(input); setInput(""); }
          if (e.key === "Backspace" && !input && values.length) onChange(values.slice(0, -1));
        }}
      />
      <Button type="button" onClick={() => { add(input); setInput(""); }}>Add</Button>
    </div>
  );
}

function generateRecommendations(profile, goals, bmi, macros) {
  const nutrition = [];
  const fitness = [];
  const recovery = [];

  nutrition.push(
    "Prioritize protein at each meal (aim ~25–35 g/meal) to support muscle maintenance.",
    profile.sex === "female" ? "Ensure adequate calcium (~1200 mg/day) and vitamin D (~800–1000 IU/day) through food/supplements per clinician guidance." : "Favor cardiometabolic support: high-fiber, lean proteins, unsaturated fats.",
    "Eat plenty of non-starchy vegetables and 25–35 g fiber/day.",
    "Choose minimally processed foods; limit added sugars and alcohol.",
  );
  if (profile.sex === "female" && profile.menopause !== "pre") nutrition.push("Include omega-3 sources (fatty fish, walnuts) and resistance training to counter sarcopenia.");
  if (goals.priorities.includes("bloodpressure")) nutrition.push("Limit sodium to ~1500–2000 mg/day and emphasize potassium-rich foods (leafy greens, beans).");
  if (goals.priorities.includes("cholesterol")) nutrition.push("Add viscous fibers (oats, barley) and plant sterols/stanols as advised.");

  fitness.push(
    "Strength training 2–3x/week (full-body, 6–10 movements, 2–3 sets).",
    "Daily walking or low-impact cardio 20–40 minutes as tolerated.",
    "Balance work 3–5x/week (single-leg stands, heel-to-toe, tai chi).",
    "Mobility routine most days focusing on hips, shoulders, thoracic spine.",
  );
  if (goals.activityLevel === "high") fitness.push("Incorporate intervals 1–2x/week if cleared by your clinician.");

  recovery.push(
    "Target 7–9 hours of sleep; keep a consistent schedule.",
    "Use wind-down routines: low light, devices off, brief journaling.",
    "Practice 5-minute breathing or mindfulness once or twice daily.",
  );

  return { nutrition, fitness, recovery };
}


async function saveToCloud(profile, goals) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not signed in');

  const profilePayload = {
    id: user.id,
    name: profile.name || null,
    sex: profile.sex,
    age: profile.age,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    menopause: profile.menopause || null,
    conditions: profile.conditions || [],
    meds: profile.meds || null,
  };
  const { error: pErr } = await supabase.from('profiles').upsert(profilePayload).eq('id', user.id);
  if (pErr) throw pErr;

  const assessPayload = {
    user_id: user.id,
    goals,
    updated_at: new Date().toISOString(),
  };
  const { error: aErr } = await supabase.from('assessments').upsert(assessPayload, { onConflict: 'user_id' });
  if (aErr) throw aErr;
}
