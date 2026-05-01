import type { Task } from '../types';

interface ReportsProps {
  tasks: Task[];
}

export default function Reports({ tasks }: ReportsProps) {
  // Simple calculated stats
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const highPrioCount = tasks.filter(t => t.priority === 'high').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const STATS = [
    { label: 'Completion Rate', value: `${completionRate}%`, color: '#00f2ff' },
    { label: 'Combat Readiness', value: 'OPTIMAL', color: '#00ff88' },
    { label: 'High Prio Tasks', value: highPrioCount, color: '#ff3b30' },
    { label: 'Total Missions', value: tasks.length, color: '#7000ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1px' }}>INTEL REPORT</h2>
        <span className="label-caps" style={{ color: '#00f2ff', fontSize: '10px' }}>LATEST UPDATE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {STATS.map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ borderLeft: `4px solid ${stat.color}`, padding: '28px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="label-caps" style={{ color: stat.color, opacity: 0.6, marginBottom: '4px' }}>{stat.label}</p>
                <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff' }}>{stat.value}</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color, boxShadow: `0 0 15px ${stat.color}` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '32px', marginTop: '10px' }}>
        <h3 className="label-caps" style={{ color: '#fff', marginBottom: '24px' }}>Focus Zones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {['Work', 'Personal', 'Health', 'Learning'].map(cat => {
            const count = tasks.filter(t => t.category === cat).length;
            const percent = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>{cat}</span>
                  <span style={{ color: '#fff' }}>{count} Units</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#111', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#00f2ff', width: `${percent || 5}%`, opacity: percent > 0 ? 1 : 0.2 }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
