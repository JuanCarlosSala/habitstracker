import { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  getDaysInMonth, 
  getDay, 
  getWeekOfMonth,
  addMonths, 
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, Star, Moon, Sun, MessageSquare, X } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './App.css';

const diasSemanaMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Semana → color sólido vibrante [fondo-oscuro, texto-vibrante, fondo-claro, texto-claro]
const WEEK_COLORS = [
  null,
  { dark: { bg: '#1a0a00', text: '#ff6b00' }, light: { bg: '#fff3e0', text: '#e65100' } }, // Semana 1 Naranja
  { dark: { bg: '#000d1a', text: '#2196f3' }, light: { bg: '#e3f2fd', text: '#1565c0' } }, // Semana 2 Azul
  { dark: { bg: '#0d1a00', text: '#76c442' }, light: { bg: '#f1f8e9', text: '#33691e' } }, // Semana 3 Verde
  { dark: { bg: '#1a001a', text: '#e040fb' }, light: { bg: '#fce4ec', text: '#880e4f' } }, // Semana 4 Magenta
  { dark: { bg: '#1a0000', text: '#f44336' }, light: { bg: '#ffebee', text: '#b71c1c' } }, // Semana 5 Rojo
  { dark: { bg: '#001a1a', text: '#00bcd4' }, light: { bg: '#e0f7fa', text: '#006064' } }, // Semana 6 Cyan
];

function weekStyle(weekNum, isDark) {
  const colors = WEEK_COLORS[weekNum % 6 + 1] || WEEK_COLORS[1];
  const variant = isDark ? colors.dark : colors.light;
  return { backgroundColor: variant.bg, color: variant.text };
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('routine');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('routine-theme');
    return savedTheme === 'dark';
  });

  const [notes, setNotes] = useState(() => localStorage.getItem('routine-notes') || '');
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('routine-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('routine-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('routine-notes', notes);
  }, [notes]);

  // --- HABIT STATE ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('routine-habits-grid-v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    
    const ts = Date.now();
    return [
      // RUTINA — hábitos generales diarios sin días específicos
      { id: ts + 1,  name: 'Gimnasio',          type: 'boolean',    category: 'routine', daysOfWeek: null, records: {} },
      { id: ts + 2,  name: 'Cardio',             type: 'boolean',    category: 'routine', daysOfWeek: null, records: {} },
      { id: ts + 3,  name: 'Agua (litros)',       type: 'measurable', target: 4, unit: 'L', category: 'routine', daysOfWeek: null, records: {} },
      { id: ts + 4,  name: 'Lectura',             type: 'boolean',    category: 'routine', daysOfWeek: null, records: {} },
      { id: ts + 5,  name: 'Dormir 8 h',          type: 'boolean',    category: 'routine', daysOfWeek: null, records: {} },
      { id: ts + 6,  name: 'Suplementos',         type: 'boolean',    category: 'routine', daysOfWeek: null, records: {} },

      // DIETA — sin emojis, con porciones
      // Lunes
      { id: ts + 10, name: 'Lunes · Desayuno: Hotcakes de avena',        description: '170g avena, 250ml leche, 2 huevos, 1 plátano, 30g Cremino', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: ts + 11, name: 'Lunes · Comida: Pollo con arroz y papa',     description: '200g pechuga, 90g arroz crudo, 120g papa, 150g frijol, 70g aguacate, 15ml aceite', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: ts + 12, name: 'Lunes · Cena: Batido avena y plátano',       description: '500ml leche, 40g avena, 30g crema cacahuate, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      // Martes
      { id: ts + 13, name: 'Martes · Desayuno: Huevo con avena',         description: '4 huevos, 100g avena, 250ml leche, 1 plátano, 15g crema cacahuate, 10g miel', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: ts + 14, name: 'Martes · Comida: Carne molida con frijol',   description: '180g carne molida, 150g frijol, 90g arroz, 150g zanahoria/pimiento', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: ts + 15, name: 'Martes · Cena: Jamón pavo con huevo',        description: '150g jamón pavo, 3 huevos, 2 salmas, 70g aguacate', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      // Miércoles
      { id: ts + 16, name: 'Miércoles · Desayuno: Omelette jamón pavo',  description: '3 huevos, 100g jamón pavo, 100g avena, 250ml leche, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      { id: ts + 17, name: 'Miércoles · Comida: Nuggets con papa',       description: '250g nuggets al horno, 150g papa, 150g ensalada, 70g aguacate', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      { id: ts + 18, name: 'Miércoles · Cena: Batido avena y plátano',   description: '500ml leche, 40g avena, 30g crema cacahuate, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      // Jueves
      { id: ts + 19, name: 'Jueves · Desayuno: Hotcakes crema cacahuate',description: '170g avena, 250ml leche, 2 huevos, 1 plátano, 20g crema cacahuate, 15g miel', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      { id: ts + 20, name: 'Jueves · Comida: Carne molida con papa',     description: '180g carne molida, 150g papa, 150g frijol, 150g pimiento/cebolla', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      { id: ts + 21, name: 'Jueves · Cena: Jamón pavo con huevo',        description: '150g jamón pavo, 3 huevos, 2 salmas, 70g aguacate', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      // Viernes
      { id: ts + 22, name: 'Viernes · Desayuno: Huevo con salmas',       description: '4 huevos, 3 salmas, 70g aguacate, 100g avena + 250ml leche aparte', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      { id: ts + 23, name: 'Viernes · Comida: Pollo con arroz y aguacate', description: '200g pechuga, 90g arroz, 70g aguacate, 150g zanahoria', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      { id: ts + 24, name: 'Viernes · Cena: Batido avena y plátano',     description: '500ml leche, 40g avena, 30g crema cacahuate, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      // Sábado
      { id: ts + 25, name: 'Sábado · Desayuno: Avena con leche y huevo', description: '100g avena, 250ml leche, 2 huevos cocidos, 1 plátano, 15g crema cacahuate', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      { id: ts + 26, name: 'Sábado · Comida: Nuggets con arroz y frijol',description: '250g nuggets, 90g arroz, 150g frijol, 150g verduras', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      { id: ts + 27, name: 'Sábado · Cena: Batido con Cremino',          description: '500ml leche, 1 plátano, 30g Cremino', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      // Domingo
      { id: ts + 28, name: 'Domingo · Dia Libre',                        description: 'Descanso total. Sin conteo de macros.', type: 'boolean', category: 'diet', daysOfWeek: [0], records: {} },
    ];
  });

  // --- GYM STATE ---
  const [gymRecords, setGymRecords] = useState(() => {
    const saved = localStorage.getItem('routine-gym');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Press de Banca', records: [] },
      { id: 2, name: 'Sentadilla Libre', records: [] }
    ];
  });
  
  // Form state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitType, setNewHabitType] = useState('boolean');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');
  const [newHabitDays, setNewHabitDays] = useState([]);
  const [newGymExercise, setNewGymExercise] = useState('');

  useEffect(() => {
    localStorage.setItem('routine-habits-grid-v4', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('routine-gym', JSON.stringify(gymRecords));
  }, [gymRecords]);

  // Calculate Month Days
  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const days = [];
    const weeksMap = new Map();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = getDay(date);
      const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
      const dateString = format(date, 'yyyy-MM-dd');
      
      days.push({ num: i, dayStr: diasSemanaMap[dayOfWeek], dayOfWeekIndex: dayOfWeek, dateString, weekOfMonth });
      
      if (!weeksMap.has(weekOfMonth)) weeksMap.set(weekOfMonth, 0);
      weeksMap.set(weekOfMonth, weeksMap.get(weekOfMonth) + 1);
    }
    return { days, weeksMap };
  }, [currentDate]);

  const isHabitActiveOnDay = (habit, dayOfWeekIndex) => {
    if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return true;
    return habit.daysOfWeek.includes(dayOfWeekIndex);
  };

  const activeTabHabits = useMemo(() => habits.filter(h => h.category === activeTab), [habits, activeTab]);

  const { chartData, bestDaysCount, calendarHeatmap } = useMemo(() => {
    let bestCount = 0;
    const heatmap = [];
    
    const chart = monthData.days.map(day => {
      let completed = 0, total = 0;
      
      activeTabHabits.forEach(habit => {
        if (isHabitActiveOnDay(habit, day.dayOfWeekIndex)) {
          total++;
          const record = habit.records[day.dateString];
          if (habit.type === 'boolean' && record === true) completed++;
          else if (habit.type === 'measurable' && record >= habit.target) completed++;
        }
      });
      
      const pct = total === 0 ? 0 : (completed / total) * 100;
      if (pct >= 100 && total > 0) bestCount++;
      
      let heatClass = 'heat-0';
      if (pct > 0 && pct <= 30)    heatClass = 'heat-1';
      else if (pct > 30 && pct <= 60) heatClass = 'heat-2';
      else if (pct > 60 && pct < 100) heatClass = 'heat-3';
      else if (pct === 100)          heatClass = 'heat-4';

      if (activeTab === 'diet') heatClass += '-diet';
      
      heatmap.push({ date: day.dateString, num: day.num, heatClass, percentage: pct });
      return { day: day.num, progreso: pct };
    });
    
    return { chartData: chart, bestDaysCount: bestCount, calendarHeatmap: heatmap };
  }, [monthData, activeTabHabits, activeTab]);

  // Actions
  const toggleBooleanHabit = (habitId, dateString) => {
    setHabits(habits.map(h => {
      if (h.id !== habitId) return h;
      const nr = { ...h.records };
      if (nr[dateString]) delete nr[dateString]; else nr[dateString] = true;
      return { ...h, records: nr };
    }));
  };

  const updateMeasurableHabit = (habitId, dateString, value) => {
    setHabits(habits.map(h => {
      if (h.id !== habitId) return h;
      const nr = { ...h.records };
      const n = parseFloat(value);
      if (isNaN(n) || value === '') delete nr[dateString]; else nr[dateString] = n;
      return { ...h, records: nr };
    }));
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(), name: newHabitName.trim(),
      description: newHabitDescription.trim() || undefined,
      type: newHabitType, category: activeTab,
      daysOfWeek: newHabitDays.length > 0 ? newHabitDays : null,
      records: {}
    };
    if (newHabitType === 'measurable') {
      newHabit.target = parseFloat(newHabitTarget) || 1;
      newHabit.unit = newHabitUnit.trim() || 'unidades';
    }
    setHabits([...habits, newHabit]);
    setNewHabitName(''); setNewHabitDescription(''); setNewHabitTarget(''); setNewHabitUnit(''); setNewHabitDays([]);
  };

  const addGymExercise = (e) => {
    e.preventDefault();
    if (!newGymExercise.trim()) return;
    setGymRecords([...gymRecords, { id: Date.now(), name: newGymExercise.trim(), records: [] }]);
    setNewGymExercise('');
  };

  const addGymRecord = (exerciseId, e) => {
    e.preventDefault();
    const weight = parseFloat(e.target.weight.value);
    const reps = parseInt(e.target.reps.value);
    if (!weight || !reps) return;
    const date = format(new Date(), 'dd/MM HH:mm');
    setGymRecords(gymRecords.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const newRecs = [...ex.records, { date, weight, reps }].slice(-30);
      return { ...ex, records: newRecs };
    }));
    e.target.reset();
  };

  const renderHabitRow = (habit) => (
    <tr key={habit.id}>
      <td className="habit-cell">
        <div className="habit-cell-inner">
          <div className="habit-name-wrapper">
            <span className="habit-name">{habit.name}</span>
            {habit.description && <span className="habit-description">{habit.description}</span>}
            <span className="habit-type-badge">
              {habit.type === 'measurable' ? `Meta: ${habit.target} ${habit.unit}` : 'Check'}
            </span>
          </div>
          <button className="btn-delete" onClick={() => setHabits(habits.filter(h => h.id !== habit.id))}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
      
      {monthData.days.map(day => {
        const isActive = isHabitActiveOnDay(habit, day.dayOfWeekIndex);
        const style = weekStyle(day.weekOfMonth, isDarkMode);

        if (!isActive) return <td key={`${habit.id}-${day.num}`} className="inactive-cell" />;

        const val = habit.records[day.dateString];
        if (habit.type === 'boolean') {
          const done = val === true;
          return (
            <td key={`${habit.id}-${day.num}`} className="check-cell" style={style}>
              <div className={`custom-checkbox ${done ? 'completed' : ''}`} onClick={() => toggleBooleanHabit(habit.id, day.dateString)}>
                {done && <Check size={16} strokeWidth={3} />}
              </div>
            </td>
          );
        } else {
          const done = val >= habit.target;
          return (
            <td key={`${habit.id}-${day.num}`} className="check-cell" style={{ ...style, padding: 0 }}>
              <input
                type="number" className="measurable-input"
                value={val !== undefined ? val : ''}
                onChange={(e) => updateMeasurableHabit(habit.id, day.dateString, e.target.value)}
                placeholder="-"
                style={{ color: done ? 'inherit' : 'var(--text-secondary)' }}
              />
            </td>
          );
        }
      })}
    </tr>
  );

  const chartColor = activeTab === 'diet' ? '#10b981' : '#3b82f6';

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header-section">
        <div className="header-left">
          <h1 className="app-title">Tracker Maestro</h1>
          <nav className="tabs-container">
            <button className={`tab-btn ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>Rutina</button>
            <button className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`} onClick={() => setActiveTab('diet')}>Alimentacion</button>
            <button className={`tab-btn ${activeTab === 'gym' ? 'active' : ''}`} onClick={() => setActiveTab('gym')}>Progreso Gym</button>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="header-controls-row">
            {activeTab !== 'gym' && (
              <div className="best-days-badge">
                <Star size={14} fill="currentColor" />
                {bestDaysCount} Perfectos
              </div>
            )}
            <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Cambiar tema">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {activeTab !== 'gym' && (
            <div className="month-selector">
              <button className="icon-btn" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={18} /></button>
              <span className="month-label">{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
              <button className="icon-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </header>

      {/* VIEWS */}
      {activeTab !== 'gym' ? (
        <>
          <div className="dashboard-top">
            <div className="chart-container">
              <p className="section-label">Progreso del mes — {activeTab === 'routine' ? 'Rutina' : 'Alimentacion'}</p>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} domain={[0,100]} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
                    formatter={(v) => [`${Math.round(v)}%`, 'Completado']}
                    labelFormatter={(l) => `Dia ${l}`}
                  />
                  <Area type="monotone" dataKey="progreso" stroke={chartColor} strokeWidth={2.5} fillOpacity={1} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="smart-calendar-container">
              <p className="section-label">Calendario inteligente</p>
              <div className="heatmap-grid">
                {calendarHeatmap.map(day => (
                  <div key={day.date} className={`heatmap-day ${day.heatClass}`} title={`Dia ${day.num}: ${Math.round(day.percentage)}%`} />
                ))}
              </div>
            </div>
          </div>

          <div className="spreadsheet-wrapper">
            <div className="spreadsheet-container">
              <table className="spreadsheet-table">
                <thead>
                  <tr>
                    <th className="habit-col-header sticky-col" style={{ borderBottom: 'none' }}>
                      {activeTab === 'routine' ? 'Rutina Diaria' : 'Plan Alimenticio'}
                    </th>
                    {Array.from(monthData.weeksMap.entries()).map(([wk, span]) => (
                      <th key={`wk-${wk}`} colSpan={span} style={weekStyle(wk, isDarkMode)}>
                        SEM {wk}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="habit-col-header sticky-col" style={{ borderTop: 'none', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      META / TIPO
                    </th>
                    {monthData.days.map(day => (
                      <th key={`d-${day.num}`} style={weekStyle(day.weekOfMonth, isDarkMode)}>
                        <div className="day-letter">{day.dayStr}</div>
                        <div className="day-num">{day.num}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTabHabits.map(renderHabitRow)}
                  <tr className="add-habit-row">
                    <td colSpan={monthData.days.length + 1}>
                      <form className="add-habit-form" onSubmit={addHabit}>
                        <div className="add-habit-top">
                          <input type="text" className="field-input" placeholder="Nombre del registro..." value={newHabitName} onChange={e => setNewHabitName(e.target.value)} required />
                          {activeTab === 'diet' && (
                            <input type="text" className="field-input" placeholder="Ingredientes (opcional)" value={newHabitDescription} onChange={e => setNewHabitDescription(e.target.value)} />
                          )}
                          <select className="field-select" value={newHabitType} onChange={e => setNewHabitType(e.target.value)}>
                            <option value="boolean">Check (Si/No)</option>
                            <option value="measurable">Medible (Numero)</option>
                          </select>
                          {newHabitType === 'measurable' && (
                            <>
                              <input type="number" className="field-input field-short" placeholder="Meta" value={newHabitTarget} onChange={e => setNewHabitTarget(e.target.value)} required />
                              <input type="text" className="field-input field-short" placeholder="Unidad" value={newHabitUnit} onChange={e => setNewHabitUnit(e.target.value)} required />
                            </>
                          )}
                        </div>
                        <div className="add-habit-bottom">
                          <span className="add-habit-label">Dias que aplica (vacio = todos):</span>
                          <div className="day-checkboxes">
                            {diasSemanaMap.map((d, i) => (
                              <label key={i} className="day-checkbox-label">
                                <input type="checkbox" checked={newHabitDays.includes(i)} onChange={() => {
                                  if (newHabitDays.includes(i)) setNewHabitDays(newHabitDays.filter(x => x !== i));
                                  else setNewHabitDays([...newHabitDays, i].sort());
                                }} /> {d}
                              </label>
                            ))}
                          </div>
                          <button type="submit" className="btn-primary">
                            <Plus size={16} /> Agregar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* GYM TRACKER */
        <div className="gym-tracker-container">
          <form className="gym-add-form" onSubmit={addGymExercise}>
            <input type="text" className="field-input" placeholder="Nuevo ejercicio (ej. Sentadilla Libre)" value={newGymExercise} onChange={e => setNewGymExercise(e.target.value)} required />
            <button type="submit" className="btn-primary"><Plus size={16} /> Añadir Ejercicio</button>
          </form>

          <div className="gym-exercises-grid">
            {gymRecords.map(ex => (
              <div key={ex.id} className="gym-card">
                <div className="gym-card-header">
                  <h3 className="gym-card-title">{ex.name}</h3>
                  <button className="btn-delete" onClick={() => setGymRecords(gymRecords.filter(g => g.id !== ex.id))}><Trash2 size={14} /></button>
                </div>

                <div className="gym-chart">
                  {ex.records.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={ex.records}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} />
                        <YAxis domain={['auto','auto']} width={38} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                        <RechartsTooltip
                          contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '0.85rem' }}
                          formatter={(v, _, p) => [`${v}kg × ${p.payload.reps} reps`, 'Registro']}
                          labelFormatter={() => ''}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#f44336" strokeWidth={2.5} dot={{ r: 3, fill: '#f44336' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="gym-empty">Sin registros aun</div>
                  )}
                </div>

                {ex.records.length > 0 && (
                  <div className="gym-last-record">
                    Ultimo: <strong>{ex.records[ex.records.length - 1].weight} kg</strong> × {ex.records[ex.records.length - 1].reps} reps
                    {ex.records.length >= 2 && (() => {
                      const diff = ex.records[ex.records.length - 1].weight - ex.records[ex.records.length - 2].weight;
                      if (diff > 0) return <span className="trend up"> ↑ +{diff}kg</span>;
                      if (diff < 0) return <span className="trend down"> ↓ {diff}kg</span>;
                      return <span className="trend flat"> → Sin cambio</span>;
                    })()}
                  </div>
                )}

                <form className="gym-record-form" onSubmit={(e) => addGymRecord(ex.id, e)}>
                  <input type="number" step="0.5" name="weight" placeholder="Peso kg" required className="field-input" />
                  <input type="number" name="reps" placeholder="Reps" required className="field-input" />
                  <button type="submit" className="btn-primary">Log</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLOATING NOTES */}
      <div className="floating-notes-wrapper">
        {isNotesOpen && (
          <div className="floating-notes-panel">
            <div className="floating-notes-header">
              <span className="notes-title"><MessageSquare size={15}/> Notas</span>
              <button onClick={() => setIsNotesOpen(false)} className="notes-close"><X size={16} /></button>
            </div>
            <textarea
              className="floating-notes-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escribe ideas, recordatorios, como te sentiste hoy..."
            />
          </div>
        )}
        <button className="floating-notes-btn" onClick={() => setIsNotesOpen(!isNotesOpen)} title="Notas">
          <span className="notes-btn-label">N</span>
        </button>
      </div>
    </div>
  );
}

export default App;
