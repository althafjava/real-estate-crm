import { useEffect, useState, type FormEvent } from "react";
import { TopBar } from "../components/TopBar";
import { api } from "../lib/api";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
  type Contact,
  type Lead,
  type LeadSource,
  type LeadStage,
  type Property,
} from "../types";

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);

  function reload() {
    api.get<Lead[]>("/leads").then(setLeads);
  }

  useEffect(() => {
    reload();
    api.get<Contact[]>("/contacts").then(setContacts);
    api.get<Property[]>("/properties").then(setProperties);
  }, []);

  async function changeStage(leadId: string, stage: LeadStage) {
    await api.post(`/leads/${leadId}/stage`, { stage });
    reload();
  }

  return (
    <>
      <TopBar
        title="Leads"
        meta={`${leads.length} active leads`}
        action={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Lead"}
          </button>
        }
      />
      <div className="content">
        {showForm && (
          <NewLeadForm
            contacts={contacts}
            properties={properties}
            onCreated={() => {
              setShowForm(false);
              reload();
            }}
          />
        )}

        <div className="kanban-board">
          {LEAD_STAGES.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage);
            return (
              <div key={stage} className="kanban-column">
                <div className="kanban-column-header">
                  <span>{LEAD_STAGE_LABELS[stage]}</span>
                  <span>{stageLeads.length}</span>
                </div>
                <div className="kanban-column-body">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onStageChange={changeStage} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function LeadCard({
  lead,
  onStageChange,
}: {
  lead: Lead;
  onStageChange: (leadId: string, stage: LeadStage) => void;
}) {
  return (
    <div className={`lead-card${lead.needsFollowUp ? " needs-follow-up" : ""}`}>
      <div className="lead-card-name">{lead.contact.name}</div>
      <div className="lead-card-meta">
        {lead.budget ? `₹${lead.budget.toLocaleString("en-IN")}` : "No budget set"}
        {lead.interestedProperty ? ` · ${lead.interestedProperty.location}` : ""}
      </div>
      <div className="lead-card-footer">
        <span className={`badge badge-${lead.source}`}>{LEAD_SOURCE_LABELS[lead.source]}</span>
        <select
          className="stage-select"
          value={lead.stage}
          onChange={(e) => onStageChange(lead.id, e.target.value as LeadStage)}
        >
          {LEAD_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {LEAD_STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function NewLeadForm({
  contacts,
  properties,
  onCreated,
}: {
  contacts: Contact[];
  properties: Property[];
  onCreated: () => void;
}) {
  const [contactId, setContactId] = useState("");
  const [source, setSource] = useState<LeadSource>("WALK_IN");
  const [propertyId, setPropertyId] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/leads", {
        contactId,
        source,
        interestedPropertyId: propertyId || null,
        budget: budget ? Number(budget) : null,
      });
      onCreated();
    } catch {
      setError("Could not create lead. Check the fields and try again.");
    }
  }

  return (
    <form className="card inline-form" onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <div className="form-row">
        <label>Contact</label>
        <select value={contactId} onChange={(e) => setContactId(e.target.value)} required>
          <option value="" disabled>
            Select contact
          </option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.phone}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Source</label>
        <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)}>
          {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Interested property</label>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">None</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Budget (₹)</label>
        <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} min={0} />
      </div>
      <button className="btn-primary" type="submit">
        Create lead
      </button>
      {error && <div className="error-text">{error}</div>}
    </form>
  );
}
