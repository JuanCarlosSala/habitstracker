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
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, Star, Moon, Sun } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './App.css';

const diasSemanaMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('routine-theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('routine-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('routine-theme', 'light');
    }
  }, [isDarkMode]);

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('routine-habits-grid-v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Solo cargar si no está vacío, sino inicializar el plan
      if (parsed.length > 0) return parsed.map(h => ({ ...h, category: h.category || 'routine' }));
    }
    
    // ESTADO INICIAL: Plan Nutricional y Entrenamiento
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
      
      // DIETA (Agrupada por similitud de días si es posible, o individual)
      // Desayunos
      { id: timestamp + 10, name: '🍳 Desayuno: Hotcakes de avena', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: timestamp + 11, name: '🍳 Desayuno: Huevo revuelto con avena', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: timestamp + 12, name: '🍳 Desayuno: Omelette con jamón de pavo', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      { id: timestamp + 13, name: '🍳 Desayuno: Hotcakes con crema de cacahuate y miel', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      { id: timestamp + 14, name: '🍳 Desayuno: Huevo con salmas y aguacate', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      { id: timestamp + 15, name: '🍳 Desayuno: Avena con leche proteica y huevo cocido', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },
      
      // Comidas
      { id: timestamp + 16, name: '🍗 Comida: Pollo con arroz y papa', type: 'boolean', category: 'diet', daysOfWeek: [1], records: {} },
      { id: timestamp + 17, name: '🥩 Comida: Carne molida con frijol', type: 'boolean', category: 'diet', daysOfWeek: [2], records: {} },
      { id: timestamp + 18, name: '🍗 Comida: Nuggets de pollo al horno con papa', type: 'boolean', category: 'diet', daysOfWeek: [3], records: {} },
      { id: timestamp + 19, name: '🥩 Comida: Carne molida con papa', type: 'boolean', category: 'diet', daysOfWeek: [4], records: {} },
      { id: timestamp + 20, name: '🍗 Comida: Pollo con arroz y aguacate', type: 'boolean', category: 'diet', daysOfWeek: [5], records: {} },
      { id: timestamp + 21, name: '🍗 Comida: Nuggets de pollo con arroz y frijol', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },

      // Cenas
      { id: timestamp + 22, name: '🥤 Cena: Batido de avena y plátano', type: 'boolean', category: 'diet', daysOfWeek: [1, 3, 5], records: {} },
      { id: timestamp + 23, name: '🥪 Cena: Jamón de pavo con huevo y salmas', type: 'boolean', category: 'diet', daysOfWeek: [2, 4], records: {} },
      { id: timestamp + 24, name: '🥤 Cena: Batido con Cremino', type: 'boolean', category: 'diet', daysOfWeek: [6], records: {} },

      // Domingo
      { id: timestamp + 25, name: '🥞 Día Libre: Descanso total y comida libre', type: 'boolean', category: 'diet', daysOfWeek: [0], records: {} },
    ];
  });
  
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState('boolean');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('routine');
  const [newHabitDays, setNewHabitDays] = useState([]); // [] means ALL days

  useEffect(() => {
    localStorage.setItem('routine-habits-grid-v2', JSON.stringify(habits));
  }, [habits]);

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const days = [];
    const weeksMap = new Map();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = getDay(date); // 0 = Domingo
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

  const { chartData, bestDaysCount, calendarHeatmap } = useMemo(() => {
    let bestCount = 0;
    const heatmap = [];
    
    const chart = monthData.days.map(day => {
      let completedCount = 0;
      let totalActiveHabits = 0;
      
      habits.forEach(habit => {
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
  }, [monthData, habits]);

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

  const toggleNewHabitDay = (dayIndex) => {
    if (newHabitDays.includes(dayIndex)) {
      setNewHabitDays(newHabitDays.filter(d => d !== dayIndex));
    } else {
      setNewHabitDays([...newHabitDays, dayIndex].sort());
    }
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const newHabit = { 
      id: Date.now(), 
      name: newHabitName.trim(), 
      type: newHabitType,
      category: newHabitCategory,
      daysOfWeek: newHabitDays.length > 0 ? newHabitDays : null,
      records: {} 
    };
    
    if (newHabitType === 'measurable') {
      newHabit.target = parseFloat(newHabitTarget) || 1;
      newHabit.unit = newHabitUnit.trim() || 'unidades';
    }
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitTarget('');
    setNewHabitUnit('');
    setNewHabitDays([]);
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const routineHabits = habits.filter(h => h.category === 'routine');
  const dietHabits = habits.filter(h => h.category === 'diet');

  const renderHabitRow = (habit) => (
    <tr key={habit.id}>
      <td className="habit-cell">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="habit-name-wrapper">
            <span>{habit.name}</span>
            <span className="habit-type-badge">
              {habit.type === 'measurable' ? `Meta: ${habit.target} ${habit.unit}` : 'Check'}
            </span>
          </div>
          <button className="btn-delete" onClick={() => deleteHabit(habit.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
      
      {monthData.days.map(day => {
        const isActive = isHabitActiveOnDay(habit, day.dayOfWeekIndex);
        const weekClass = `week-color-${(day.weekOfMonth % 6) + 1}`;
        
        if (!isActive) {
          return (
            <td key={`${habit.id}-${day.num}`} className="inactive-cell">
              {/* Celda inactiva visualmente */}
            </td>
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
      <header className="header-section">
        <div className="title-container">
          <h1>Tracker Nutricional y Rutina</h1>
          <div className="best-days-badge" title="Días con 100% completado este mes">
            <Star size={16} fill="currentColor" />
            {bestDaysCount} Días Perfectos
          </div>
        </div>
        
        <div className="controls-container" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <button 
            className="nav-btn" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            style={{ marginRight: '1rem' }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
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
        </div>
      </header>

      <div className="dashboard-top">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--surface-border)" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
                formatter={(value) => [`${Math.round(value)}%`, 'Completado']}
                labelFormatter={(label) => `Día ${label}`}
              />
              <Area type="monotone" dataKey="progreso" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorProgreso)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="smart-calendar-container">
          <div className="smart-calendar-title">Calendario Inteligente</div>
          <div className="heatmap-grid">
            {calendarHeatmap.map(day => (
              <div 
                key={day.date} 
                className={`heatmap-day ${day.heatClass}`}
                title={`Día ${day.num}: ${Math.round(day.percentage)}% Completado`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="spreadsheet-container">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th className="habit-col-header" style={{ borderBottom: 'none' }}>Categoría / Hábito</th>
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
            {routineHabits.length > 0 && (
              <tr><td colSpan={monthData.days.length + 1} style={{ background: 'var(--surface-color)', padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '2px solid var(--surface-border)' }}>RUTINA DE ENTRENAMIENTO</td></tr>
            )}
            {routineHabits.map(renderHabitRow)}

            {dietHabits.length > 0 && (
              <tr><td colSpan={monthData.days.length + 1} style={{ background: 'var(--surface-color)', padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '2px solid var(--surface-border)' }}>PLAN ALIMENTICIO RUTA A</td></tr>
            )}
            {dietHabits.map(renderHabitRow)}
            
            {/* Formulario Agregar Hábito */}
            <tr className="add-habit-row">
              <td colSpan={monthData.days.length + 1} style={{ background: 'var(--bg-color)' }}>
                <form className="add-habit-form" onSubmit={addHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select className="habit-select" value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)} style={{ flex: '0.8' }}>
                      <option value="routine">Rutina</option>
                      <option value="diet">Alimentación</option>
                    </select>

                    <input type="text" className="habit-input" placeholder="Nombre del registro..." value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} required />
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
                  
                  {/* Selector de Días Específicos */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600' }}>Días que aplica (déjalo vacío si es diario):</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {diasSemanaMap.map((d, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={newHabitDays.includes(i)} onChange={() => toggleNewHabitDay(i)} /> {d}
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
    </div>
  );
}

export default App;
