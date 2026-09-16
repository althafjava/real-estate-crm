import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { api } from "../lib/api";
import { LEAD_STAGE_LABELS, LEAD_STAGES, type Task } from "../types";

interface DashboardData {
  leadCountsByStage: Partial<Record<string, number>>;
  upcomingTasks: (Task & { lead: { contact: { name: string } } })[];
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/dashboard").then(setData);
  }, []);

  return (
    <>
      <TopBar title="Dashboard" meta="Pipeline overview and upcoming follow-ups" />
      <div className="content">
        <div className="stat-grid">
          {LEAD_STAGES.map((stage) => (
            <div key={stage} className="stat-card">
              <div className="stat-value">{data?.leadCountsByStage[stage] ?? 0}</div>
              <div className="stat-label">{LEAD_STAGE_LABELS[stage]}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Upcoming follow-ups</h2>
          {data?.upcomingTasks.length === 0 && <p>No pending tasks. Nice and clear.</p>}
          <table className="table">
            <tbody>
              {data?.upcomingTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.lead?.contact?.name}</td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
