import { useEffect, useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Lead, Task } from "../types";

type TaskWithLead = Task & { lead: { contact: { name: string } } };

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithLead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);

  function reload() {
    api.get<TaskWithLead[]>("/tasks").then(setTasks);
  }

  useEffect(() => {
    reload();
    api.get<Lead[]>("/leads").then(setLeads);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.post("/tasks", {
      leadId: form.get("leadId"),
      title: form.get("title"),
      dueDate: form.get("dueDate"),
      assignedTo: user!.id,
    });
    setShowForm(false);
    reload();
  }

  async function complete(id: string) {
    await api.patch(`/tasks/${id}/complete`);
    reload();
  }

  return (
    <>
      <TopBar
        title="Tasks"
        meta={`${tasks.filter((t) => t.status === "PENDING").length} pending`}
        action={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Task"}
          </button>
        }
      />
      <div className="content">
        {showForm && (
          <form className="card inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Lead</label>
              <select name="leadId" required>
                <option value="" disabled>
                  Select lead
                </option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.contact.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Title</label>
              <input name="title" placeholder="Call back" required />
            </div>
            <div className="form-row">
              <label>Due date</label>
              <input name="dueDate" type="date" required />
            </div>
            <button className="btn-primary" type="submit">
              Save task
            </button>
          </form>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Lead</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.lead?.contact?.name}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td>{t.status}</td>
                <td>
                  {t.status === "PENDING" && (
                    <button className="btn-secondary" onClick={() => complete(t.id)}>
                      Mark done
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
