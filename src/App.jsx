import { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  getDaysInMonth, 
  startOfMonth, 
  addMonths, 
  subMonths, 
  getDay, 
  getWeekOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, Star } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './App.css';

const diasSemanaMap = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estructura records: { '2025-01-01': true } para booleanos
  // o { '2025-01-01': 1.5 } para medibles
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('routine-habits-grid-v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Tomar agua', type: 'measurable', target: 2, unit: 'L', records: {} },
      { id: 2, name: 'Ejercicio 30 mins', type: 'boolean', records: {} },
      { id: 3, name: 'Leer', type: 'measurable', target: 10, unit: 'Págs', records: {} },
    ];
  });
  
  // Formulario nuevo hábito
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState('boolean');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');

  useEffect(() => {
    localStorage.setItem('routine-habits-grid-v2', JSON.stringify(habits));
  }, [habits]);

  // Generar datos del mes (Días y Semanas)
  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const days = [];
    const weeksMap = new Map();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = getDay(date);
      // getWeekOfMonth con weekStartsOn: 1 (Lunes)
      const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
      const dateString = format(date, 'yyyy-MM-dd');
      
      days.push({
        num: i,
        dayStr: diasSemanaMap[dayOfWeek],
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

  // Calcular progreso general y días perfectos
  const { chartData, bestDaysCount, calendarHeatmap } = useMemo(() => {
    let bestCount = 0;
    const heatmap = [];
    
    const chart = monthData.days.map(day => {
      let completedCount = 0;
      
      habits.forEach(habit => {
        const record = habit.records[day.dateString];
        if (habit.type === 'boolean') {
          if (record === true) completedCount++;
        } else if (habit.type === 'measurable') {
          if (record >= habit.target) completedCount++;
        }
      });
      
      const percentage = habits.length === 0 ? 0 : (completedCount / habits.length) * 100;
      
      if (percentage >= 100 && habits.length > 0) {
        bestCount++;
      }
      
      // Determinar clase de calor (0 a 4)
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

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const newHabit = { 
      id: Date.now(), 
      name: newHabitName.trim(), 
      type: newHabitType,
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
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header-section">
        <div className="title-container">
          <h1>Creador de Hábitos</h1>
          <div className="best-days-badge" title="Días con 100% completado este mes">
            <Star size={16} fill="currentColor" />
            {bestDaysCount} Días Perfectos
          </div>
        </div>
        
        <div className="controls-container">
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

      {/* DASHBOARD TOP: Chart & Smart Calendar */}
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
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
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

      {/* SPREADSHEET GRID */}
      <div className="spreadsheet-container">
        <table className="spreadsheet-table">
          <thead>
            {/* Fila de Semanas */}
            <tr>
              <th className="habit-col-header" style={{ borderBottom: 'none' }}>Hábitos Diarios</th>
              {Array.from(monthData.weeksMap.entries()).map(([weekNum, colSpan]) => (
                <th 
                  key={`week-${weekNum}`} 
                  colSpan={colSpan} 
                  className={`week-color-${(weekNum % 6) + 1}`}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  SEMANA {weekNum}
                </th>
              ))}
            </tr>
            {/* Fila de Días */}
            <tr>
              <th className="habit-col-header" style={{ borderTop: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                META / TIPO
              </th>
              {monthData.days.map((day) => (
                <th 
                  key={`daystr-${day.num}`} 
                  className={`week-color-${(day.weekOfMonth % 6) + 1}`}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{day.dayStr}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '400', opacity: 0.8 }}>{day.num}</div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {habits.map(habit => (
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
                  const val = habit.records[day.dateString];
                  const weekClass = `week-color-${(day.weekOfMonth % 6) + 1}`;
                  
                  if (habit.type === 'boolean') {
                    const isCompleted = val === true;
                    return (
                      <td 
                        key={`${habit.id}-${day.num}`}
                        className={`check-cell ${weekClass}`}
                        style={{ padding: '0.15rem' }}
                      >
                        <div 
                          className={`custom-checkbox ${isCompleted ? 'completed' : ''}`}
                          onClick={() => toggleBooleanHabit(habit.id, day.dateString)}
                        >
                          {isCompleted && <Check size={18} strokeWidth={4} />}
                        </div>
                      </td>
                    );
                  } else {
                    // Measurable
                    const isCompleted = val >= habit.target;
                    return (
                      <td 
                        key={`${habit.id}-${day.num}`}
                        className={`check-cell ${weekClass}`}
                        style={{ padding: 0 }}
                      >
                        <input
                          type="number"
                          className="measurable-input"
                          style={{ color: isCompleted ? 'inherit' : 'rgba(0,0,0,0.5)' }}
                          value={val !== undefined ? val : ''}
                          onChange={(e) => updateMeasurableHabit(habit.id, day.dateString, e.target.value)}
                          placeholder="-"
                        />
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
            
            {/* Formulario Agregar Hábito */}
            <tr className="add-habit-row">
              <td colSpan={monthData.days.length + 1}>
                <form className="add-habit-form" onSubmit={addHabit}>
                  <input 
                    type="text" 
                    className="habit-input" 
                    placeholder="Nuevo hábito..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    required
                  />
                  <select 
                    className="habit-select"
                    value={newHabitType}
                    onChange={(e) => setNewHabitType(e.target.value)}
                  >
                    <option value="boolean">Check (Sí/No)</option>
                    <option value="measurable">Medible (Número)</option>
                  </select>
                  
                  {newHabitType === 'measurable' && (
                    <>
                      <input 
                        type="number" 
                        className="habit-target-input" 
                        placeholder="Meta (ej: 2)"
                        value={newHabitTarget}
                        onChange={(e) => setNewHabitTarget(e.target.value)}
                        required
                      />
                      <input 
                        type="text" 
                        className="habit-target-input" 
                        placeholder="Unidad (ej: L)"
                        value={newHabitUnit}
                        onChange={(e) => setNewHabitUnit(e.target.value)}
                        required
                      />
                    </>
                  )}
                  
                  <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Agregar
                  </button>
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
