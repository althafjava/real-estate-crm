import { useEffect, useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { api } from "../lib/api";
import type { Contact, ContactType } from "../types";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  function reload() {
    api.get<Contact[]>("/contacts").then(setContacts);
  }

  useEffect(reload, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await api.post<{ contact: Contact; duplicateWarning: { name: string } | null }>(
      "/contacts",
      {
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email") || null,
        type: form.get("type"),
      }
    );
    setWarning(
      result.duplicateWarning
        ? `Heads up: "${result.duplicateWarning.name}" already uses this phone number.`
        : null
    );
    setShowForm(false);
    reload();
  }

  return (
    <>
      <TopBar
        title="Contacts"
        meta={`${contacts.length} contacts`}
        action={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Contact"}
          </button>
        }
      />
      <div className="content">
        {warning && <div className="error-text">{warning}</div>}
        {showForm && (
          <form className="card inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Name</label>
              <input name="name" required />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input name="phone" required />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input name="email" type="email" />
            </div>
            <div className="form-row">
              <label>Type</label>
              <select name="type" defaultValue="BUYER">
                {(["BUYER", "SELLER", "TENANT", "OWNER"] as ContactType[]).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary" type="submit">
              Save contact
            </button>
          </form>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email ?? "—"}</td>
                <td>{c.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
