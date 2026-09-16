import { useEffect, useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { api } from "../lib/api";
import type { Property, PropertyStatus, PropertyType } from "../types";

const TYPES: PropertyType[] = ["APARTMENT", "VILLA", "PLOT", "COMMERCIAL"];
const STATUSES: PropertyStatus[] = ["AVAILABLE", "HOLD", "SOLD", "RENTED"];

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  function reload() {
    const query = statusFilter ? `?status=${statusFilter}` : "";
    api.get<Property[]>(`/properties${query}`).then(setProperties);
  }

  useEffect(reload, [statusFilter]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await api.post("/properties", {
      title: form.get("title"),
      type: form.get("type"),
      location: form.get("location"),
      price: Number(form.get("price")),
      bedrooms: form.get("bedrooms") ? Number(form.get("bedrooms")) : null,
      bathrooms: form.get("bathrooms") ? Number(form.get("bathrooms")) : null,
      status: form.get("status"),
    });
    setShowForm(false);
    reload();
  }

  return (
    <>
      <TopBar
        title="Properties"
        meta={`${properties.length} listings`}
        action={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Property"}
          </button>
        }
      />
      <div className="content">
        {showForm && (
          <form className="card inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Title</label>
              <input name="title" required />
            </div>
            <div className="form-row">
              <label>Type</label>
              <select name="type" defaultValue="APARTMENT">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Location</label>
              <input name="location" required />
            </div>
            <div className="form-row">
              <label>Price (₹)</label>
              <input name="price" type="number" min={0} required />
            </div>
            <div className="form-row">
              <label>Bedrooms</label>
              <input name="bedrooms" type="number" min={0} />
            </div>
            <div className="form-row">
              <label>Bathrooms</label>
              <input name="bathrooms" type="number" min={0} />
            </div>
            <div className="form-row">
              <label>Status</label>
              <select name="status" defaultValue="AVAILABLE">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary" type="submit">
              Save property
            </button>
          </form>
        )}

        <div className="form-row" style={{ maxWidth: 200, marginBottom: 16 }}>
          <label>Filter by status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.type}</td>
                <td>{p.location}</td>
                <td>₹{p.price.toLocaleString("en-IN")}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
