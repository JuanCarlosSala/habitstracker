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
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, Star, Moon, Sun, MessageSquare, X, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './App.css';

const diasSemanaMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('routine'); // 'routine', 'diet', 'gym'
  
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
    const saved = localStorage.getItem('routine-habits-grid-v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    
    // ESTADO INICIAL
    const timestamp = Date.now();
    return [
      // RUTINA
      { id: timestamp + 1, name: '🏋🏻‍♂️ Entrenamiento: Pecho, Hombro, Tríceps', type: 'boolean', category: 'routine', daysOfWeek: [1], records: {} },
      { id: timestamp + 2, name: '🏋🏻‍♂️ Entrenamiento: Espalda, Bíceps', type: 'boolean', category: 'routine', daysOfWeek: [2], records: {} },
      { id: timestamp + 3, name: '🏋🏻‍♂️ Entrenamiento: Pierna (Cuádriceps)', type: 'boolean', category: 'routine', daysOfWeek: [3], records: {} },
      { id: timestamp + 4, name: '🏋🏻‍♂️ Entrenamiento: Tren Superior', type: 'boolean', category: 'routine', daysOfWeek: [5], records: {} },
      { id: timestamp + 5, name: '🏋🏻‍♂️ Entrenamiento: Pierna (Femoral/Glúteo)', type: 'boolean', category: 'routine', daysOfWeek: [6], records: {} },
      { id: timestamp + 6, name: '🏃🏻‍♂️ Cardio: 20-30 min (Zona 2)', type: 'boolean', category: 'routine', daysOfWeek: [1, 2, 5], records: {} },
      { id: timestamp + 7, name: '💧 Agua (Días Gym+Cardio)', type: 'measurable', target: 5, unit: 'L', category: 'routine', daysOfWeek: [1, 2, 5], records: {} },
      { id: timestamp + 8, name: '💧 Agua (Días Gym)', type: 'measurable', target: 4.5, unit: 'L', category: 'routine', daysOfWeek: [3, 6], records: {} },
      
      // DIETA 
      // Lunes
      { id: timestamp + 10, name: '🍳 Desayuno: Hotcakes de avena', description: '170g avena, 250ml leche Lala, 2 huevos, 1 plátano, 30g Cremino', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: timestamp + 11, name: '🍗 Comida: Pollo con arroz y papa', description: '200g pechuga, 90g arroz crudo, 120g papa, 150g frijol, 150g verduras, 70g aguacate, 15ml aceite', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: timestamp + 12, name: '🥤 Cena: Batido de avena y plátano', description: '500ml leche Lala, 40g avena, 30g crema cacahuate, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [1, 3, 5], records: {} },
      // Martes
      { id: timestamp + 13, name: '🍳 Desayuno: Huevo revuelto con avena', description: '4 huevos, 100g avena cruda, 250ml leche Lala, 1 plátano, 15g crema cacahuate, 10g miel', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: timestamp + 14, name: '🥩 Comida: Carne molida con frijol', description: '180g carne molida, 150g frijol cocido, 90g arroz crudo, 150g zanahoria/pimiento', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: timestamp + 15, name: '🥪 Cena: Jamón de pavo con huevo y salmas', description: '150g jamón pavo, 3 huevos, 2 salmas, 70g aguacate', type: 'boolean', category: 'diet', daysOfWeek: [2, 4], records: {} },
      // Miercoles
      { id: timestamp + 16, name: '🍳 Desayuno: Omelette con jamón de pavo', description: '3 huevos, 100g jamón pavo, 100g avena, 250ml leche Lala, 1 plátano', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      { id: timestamp + 17, name: '🍗 Comida: Nuggets de pollo al horno con papa', description: '250g nuggets, 150g papa cocida, 150g ensalada tomate/cebolla, 70g aguacate', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      // Jueves
      { id: timestamp + 18, name: '🍳 Desayuno: Hotcakes crema de cacahuate', description: '170g avena, 250ml leche Lala, 2 huevos, 1 plátano, 20g crema cacahuate, 15g miel', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      { id: timestamp + 19, name: '🥩 Comida: Carne molida con papa', description: '180g carne molida, 150g papa cocida, 150g frijol, 150g pimiento/cebolla', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      // Viernes
      { id: timestamp + 20, name: '🍳 Desayuno: Huevo con salmas y aguacate', description: '4 huevos, 3 salmas, 70g aguacate, 100g avena + 250ml leche Lala aparte', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      { id: timestamp + 21, name: '🍗 Comida: Pollo con arroz y aguacate', description: '200g pechuga, 90g arroz crudo, 70g aguacate, 150g zanahoria', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      // Sabado
      { id: timestamp + 22, name: '🍳 Desayuno: Avena con leche proteica', description: '100g avena, 250ml leche Lala, 2 huevos cocidos, 1 plátano, 15g crema cacahuate, 10g miel', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      { id: timestamp + 23, name: '🍗 Comida: Nuggets con arroz y frijol', description: '250g nuggets, 90g arroz crudo, 150g frijol, 150g verduras mixtas', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      { id: timestamp + 24, name: '🥤 Cena: Batido con Cremino', description: '500ml leche Lala, 1 plátano, 30g Cremino', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      // Domingo
      { id: timestamp + 25, name: '🥞 Día Libre', description: 'Descanso total. Comer hasta satisfacción sin contar macros.', type: 'boolean', category: 'diet', daysOfWeek: [0], records: {} },
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
  
  // Forms states
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitType, setNewHabitType] = useState('boolean');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');
  const [newHabitDays, setNewHabitDays] = useState([]); 

  const [newGymExercise, setNewGymExercise] = useState('');

  useEffect(() => {
    localStorage.setItem('routine-habits-grid-v3', JSON.stringify(habits));
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
      
      days.push({
        num: i,
        dayStr: diasSemanaMap[dayOfWeek],
        dayOfWeekIndex: dayOfWeek,
        dateString,
        weekOfMonth
      });
      
      if (!weeksMap.has(weekOfMonth)) {
        weeksMap.set(weekOfMonth, 0);
      }
      weeksMap.set(weekOfMonth, weeksMap.get(weekOfMonth) + 1);
    }
    return { days, weeksMap };
  }, [currentDate]);

  const isHabitActiveOnDay = (habit, dayOfWeekIndex) => {
    if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return true;
    return habit.daysOfWeek.includes(dayOfWeekIndex);
  };

  // Compute Progress ONLY for the active tab (Routine or Diet)
  const activeTabHabits = useMemo(() => {
    return habits.filter(h => h.category === activeTab);
  }, [habits, activeTab]);

  const { chartData, bestDaysCount, calendarHeatmap } = useMemo(() => {
    let bestCount = 0;
    const heatmap = [];
    
    const chart = monthData.days.map(day => {
      let completedCount = 0;
      let totalActiveHabits = 0;
      
      activeTabHabits.forEach(habit => {
        if (isHabitActiveOnDay(habit, day.dayOfWeekIndex)) {
          totalActiveHabits++;
          const record = habit.records[day.dateString];
          if (habit.type === 'boolean') {
            if (record === true) completedCount++;
          } else if (habit.type === 'measurable') {
            if (record >= habit.target) completedCount++;
          }
        }
      });
      
      const percentage = totalActiveHabits === 0 ? 0 : (completedCount / totalActiveHabits) * 100;
      
      if (percentage >= 100 && totalActiveHabits > 0) {
        bestCount++;
      }
      
      let heatClass = 'heat-0';
      if (percentage > 0 && percentage <= 30) heatClass = 'heat-1';
      else if (percentage > 30 && percentage <= 60) heatClass = 'heat-2';
      else if (percentage > 60 && percentage < 100) heatClass = 'heat-3';
      else if (percentage === 100) heatClass = 'heat-4';
      
      heatmap.push({
        date: day.dateString,
        num: day.num,
        heatClass,
        percentage
      });

      return {
        day: day.num,
        progreso: percentage
      };
    });
    
    return { chartData: chart, bestDaysCount: bestCount, calendarHeatmap: heatmap };
  }, [monthData, activeTabHabits]);

  // Actions
  const toggleBooleanHabit = (habitId, dateString) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newRecords = { ...habit.records };
        if (newRecords[dateString]) delete newRecords[dateString];
        else newRecords[dateString] = true;
        return { ...habit, records: newRecords };
      }
      return habit;
    }));
  };

  const updateMeasurableHabit = (habitId, dateString, value) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newRecords = { ...habit.records };
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '') {
          delete newRecords[dateString];
        } else {
          newRecords[dateString] = numValue;
        }
        return { ...habit, records: newRecords };
      }
      return habit;
    }));
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const newHabit = { 
      id: Date.now(), 
      name: newHabitName.trim(), 
      description: newHabitDescription.trim() || undefined,
      type: newHabitType,
      category: activeTab, // Always adds to the currently active tab
      daysOfWeek: newHabitDays.length > 0 ? newHabitDays : null,
      records: {} 
    };
    
    if (newHabitType === 'measurable') {
      newHabit.target = parseFloat(newHabitTarget) || 1;
      newHabit.unit = newHabitUnit.trim() || 'unidades';
    }
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitDescription('');
    setNewHabitTarget('');
    setNewHabitUnit('');
    setNewHabitDays([]);
  };

  // GYM ACTIONS
  const addGymExercise = (e) => {
    e.preventDefault();
    if (!newGymExercise.trim()) return;
    setGymRecords([...gymRecords, { id: Date.now(), name: newGymExercise.trim(), records: [] }]);
    setNewGymExercise('');
  };

  const deleteGymExercise = (id) => {
    setGymRecords(gymRecords.filter(g => g.id !== id));
  };

  const addGymRecord = (exerciseId, e) => {
    e.preventDefault();
    const weight = parseFloat(e.target.weight.value);
    const reps = parseInt(e.target.reps.value);
    const date = format(new Date(), 'yyyy-MM-dd HH:mm');
    if (!weight || !reps) return;

    setGymRecords(gymRecords.map(ex => {
      if (ex.id === exerciseId) {
        // Limit to last 30 records to prevent extreme array growth visually
        const newRecords = [...ex.records, { date, weight, reps }].slice(-30);
        return { ...ex, records: newRecords };
      }
      return ex;
    }));
    e.target.reset();
  };


  // Render Functions
  const renderHabitRow = (habit) => (
    <tr key={habit.id}>
      <td className="habit-cell">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="habit-name-wrapper">
            <span>{habit.name}</span>
            {habit.description && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.2', marginTop: '2px', fontStyle: 'italic' }}>
                {habit.description}
              </span>
            )}
            <span className="habit-type-badge" style={{ marginTop: '4px' }}>
              {habit.type === 'measurable' ? `Meta: ${habit.target} ${habit.unit}` : 'Check'}
            </span>
          </div>
          <button className="btn-delete" onClick={() => setHabits(habits.filter(h => h.id !== habit.id))}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
      
      {monthData.days.map(day => {
        const isActive = isHabitActiveOnDay(habit, day.dayOfWeekIndex);
        const weekClass = `week-color-${(day.weekOfMonth % 6) + 1}`;
        
        if (!isActive) {
          return (
            <td key={`${habit.id}-${day.num}`} className="inactive-cell"></td>
          );
        }

        const val = habit.records[day.dateString];
        if (habit.type === 'boolean') {
          const isCompleted = val === true;
          return (
            <td key={`${habit.id}-${day.num}`} className={`check-cell ${weekClass}`} style={{ padding: '0.15rem' }}>
              <div className={`custom-checkbox ${isCompleted ? 'completed' : ''}`} onClick={() => toggleBooleanHabit(habit.id, day.dateString)}>
                {isCompleted && <Check size={18} strokeWidth={4} />}
              </div>
            </td>
          );
        } else {
          const isCompleted = val >= habit.target;
          return (
            <td key={`${habit.id}-${day.num}`} className={`check-cell ${weekClass}`} style={{ padding: 0 }}>
              <input type="number" className="measurable-input" style={{ color: isCompleted ? 'inherit' : 'rgba(0,0,0,0.5)' }} value={val !== undefined ? val : ''} onChange={(e) => updateMeasurableHabit(habit.id, day.dateString, e.target.value)} placeholder="-" />
            </td>
          );
        }
      })}
    </tr>
  );

  return (
    <div className="app-container">
      {/* HEADER & TABS */}
      <header className="header-section">
        <div className="title-container">
          <h1>Tracker Maestro</h1>
          
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>
              🏋🏻 Rutina
            </button>
            <button className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`} onClick={() => setActiveTab('diet')}>
              🍎 Alimentación
            </button>
            <button className={`tab-btn ${activeTab === 'gym' ? 'active' : ''}`} onClick={() => setActiveTab('gym')}>
              📈 Progreso Gym
            </button>
          </div>
        </div>
        
        <div className="controls-container">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            {activeTab !== 'gym' && (
              <div className="best-days-badge" title="Días con 100% completado este mes">
                <Star size={16} fill="currentColor" />
                {bestDaysCount} Perfectos
              </div>
            )}
            <button 
              className="nav-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              style={{ marginLeft: '1rem' }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {activeTab !== 'gym' && (
            <div className="month-selector">
              <button className="nav-btn" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ minWidth: '130px', textAlign: 'center', textTransform: 'capitalize', fontSize: '1.1rem' }}>
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </span>
              <button className="nav-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* VIEWS */}
      {activeTab !== 'gym' ? (
        <>
          {/* DASHBOARD TOP (Charts only for diet/routine) */}
          <div className="dashboard-top">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgreso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTab === 'diet' ? '#10b981' : '#2563eb'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={activeTab === 'diet' ? '#10b981' : '#2563eb'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
                    formatter={(value) => [`${Math.round(value)}%`, 'Completado']}
                    labelFormatter={(label) => `Día ${label}`}
                  />
                  <Area type="monotone" dataKey="progreso" stroke={activeTab === 'diet' ? '#10b981' : '#2563eb'} strokeWidth={3} fillOpacity={1} fill="url(#colorProgreso)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="smart-calendar-container">
              <div className="smart-calendar-title">Calendario Inteligente ({activeTab === 'routine' ? 'Rutina' : 'Dieta'})</div>
              <div className="heatmap-grid">
                {calendarHeatmap.map(day => (
                  <div key={day.date} className={`heatmap-day ${activeTab === 'diet' ? day.heatClass + '-diet' : day.heatClass}`} title={`Día ${day.num}: ${Math.round(day.percentage)}% Completado`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* SPREADSHEET GRID */}
          <div className="spreadsheet-container">
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th className="habit-col-header" style={{ borderBottom: 'none' }}>{activeTab === 'routine' ? 'Rutina Diaria' : 'Plan Alimenticio'}</th>
                  {Array.from(monthData.weeksMap.entries()).map(([weekNum, colSpan]) => (
                    <th key={`week-${weekNum}`} colSpan={colSpan} className={`week-color-${(weekNum % 6) + 1}`} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                      SEMANA {weekNum}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="habit-col-header" style={{ borderTop: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>META / TIPO</th>
                  {monthData.days.map((day) => (
                    <th key={`daystr-${day.num}`} className={`week-color-${(day.weekOfMonth % 6) + 1}`}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{day.dayStr}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '400', opacity: 0.8 }}>{day.num}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {activeTabHabits.map(renderHabitRow)}
                
                {/* Formulario Agregar Hábito */}
                <tr className="add-habit-row">
                  <td colSpan={monthData.days.length + 1} style={{ background: 'var(--bg-color)' }}>
                    <form className="add-habit-form" onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="text" className="habit-input" placeholder={`Nombre de ${activeTab === 'diet' ? 'comida' : 'ejercicio'}...`} value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} required />
                        
                        {activeTab === 'diet' && (
                          <input type="text" className="habit-input" placeholder="Ingredientes (opcional)" value={newHabitDescription} onChange={(e) => setNewHabitDescription(e.target.value)} />
                        )}

                        <select className="habit-select" value={newHabitType} onChange={(e) => setNewHabitType(e.target.value)}>
                          <option value="boolean">Check (Sí/No)</option>
                          <option value="measurable">Medible (Número)</option>
                        </select>
                        
                        {newHabitType === 'measurable' && (
                          <>
                            <input type="number" className="habit-target-input" placeholder="Meta" value={newHabitTarget} onChange={(e) => setNewHabitTarget(e.target.value)} required />
                            <input type="text" className="habit-target-input" placeholder="Unidad" value={newHabitUnit} onChange={(e) => setNewHabitUnit(e.target.value)} required />
                          </>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>Días que aplica (vacío = diario):</span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {diasSemanaMap.map((d, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                              <input type="checkbox" checked={newHabitDays.includes(i)} onChange={() => {
                                if (newHabitDays.includes(i)) setNewHabitDays(newHabitDays.filter(day => day !== i));
                                else setNewHabitDays([...newHabitDays, i].sort());
                              }} /> {d}
                            </label>
                          ))}
                        </div>
                        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                          <Plus size={18} /> Agregar
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* VISTA PROGRESO GYM */
        <div className="gym-tracker-container">
          <form className="gym-add-form" onSubmit={addGymExercise}>
            <input type="text" className="habit-input" placeholder="Nuevo ejercicio (Ej. Sentadilla)" value={newGymExercise} onChange={e => setNewGymExercise(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Añadir Ejercicio
            </button>
          </form>

          <div className="gym-exercises-grid">
            {gymRecords.map(exercise => (
              <div key={exercise.id} className="gym-card">
                <div className="gym-card-header">
                  <h3>{exercise.name}</h3>
                  <button className="btn-delete" onClick={() => deleteGymExercise(exercise.id)}><Trash2 size={16} /></button>
                </div>

                <div className="gym-chart">
                  {exercise.records.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={exercise.records}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={['auto', 'auto']} width={40} tick={{fontSize: 10, fill: 'var(--text-secondary)'}} />
                        <RechartsTooltip 
                          contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                          labelFormatter={() => ''}
                          formatter={(value, name, props) => [`${value}kg (${props.payload.reps} reps)`, 'Levantado']}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      Sin registros aún
                    </div>
                  )}
                </div>

                <form className="gym-record-form" onSubmit={(e) => addGymRecord(exercise.id, e)}>
                  <input type="number" step="0.5" name="weight" placeholder="Peso (kg)" required className="habit-input" style={{ width: '80px' }} />
                  <input type="number" name="reps" placeholder="Reps" required className="habit-input" style={{ width: '70px' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Log</button>
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
              <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={16}/> Notas</span>
              <button onClick={() => setIsNotesOpen(false)} style={{ color: 'white' }}><X size={18} /></button>
            </div>
            <textarea 
              className="floating-notes-textarea" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus ideas, recordatorios o cómo te sentiste hoy..."
            ></textarea>
          </div>
        )}
        <button className="floating-notes-btn" onClick={() => setIsNotesOpen(!isNotesOpen)}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>N</span>
        </button>
      </div>

    </div>
  );
}

export default App;
