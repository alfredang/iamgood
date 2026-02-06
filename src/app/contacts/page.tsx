"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { addContact, updateContact, removeContact, generateId } from "@/lib/store";
import { EmergencyContact } from "@/lib/types";
import Navigation from "@/components/Navigation";

function ContactForm({
  contact,
  onSave,
  onCancel,
}: {
  contact?: EmergencyContact;
  onSave: (c: EmergencyContact) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(contact?.name || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [relationship, setRelationship] = useState(contact?.relationship || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({
      id: contact?.id || generateId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    });
  }

  const inputClass =
    "w-full px-4 py-3.5 text-base border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/30 focus:border-[#5B8A72] transition-all text-stone-800 placeholder:text-stone-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" className={inputClass} required autoFocus />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Email *</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@email.com" className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Relationship</label>
        <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g., Daughter, Neighbor, Friend" className={inputClass} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!name.trim() || !email.trim()} className="flex-1 bg-[#5B8A72] hover:bg-[#4A7561] disabled:bg-stone-300 text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer">
          {contact ? "Update" : "Add Contact"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all font-medium cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Contacts() {
  const router = useRouter();
  const { user, contacts } = useStore();
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.setupComplete) router.replace("/");
  }, [user, router]);

  if (!user?.setupComplete) return null;

  function handleSaveNew(c: EmergencyContact) {
    addContact(c);
    setAdding(false);
  }

  function handleSaveEdit(c: EmergencyContact) {
    updateContact(c);
    setEditing(null);
  }

  function handleDelete(id: string) {
    removeContact(id);
    setConfirmDelete(null);
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <header className="bg-white border-b border-stone-100 px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">Emergency Contacts</h1>
          {!adding && !editing && contacts.length < 5 && (
            <button onClick={() => setAdding(true)} className="bg-[#5B8A72] hover:bg-[#4A7561] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
              + Add
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {adding && (
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">New Contact</h2>
            <ContactForm onSave={handleSaveNew} onCancel={() => setAdding(false)} />
          </div>
        )}

        {editing && (
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Edit Contact</h2>
            <ContactForm contact={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
          </div>
        )}

        {!adding && !editing && contacts.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-stone-500 text-lg">No emergency contacts yet</p>
            <p className="text-stone-400 text-sm">Add people who should be notified if you miss a check-in.</p>
            <button onClick={() => setAdding(true)} className="bg-[#5B8A72] hover:bg-[#4A7561] text-white font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer">
              Add First Contact
            </button>
          </div>
        )}

        {!adding && !editing && contacts.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-stone-800">{c.name}</p>
                {c.relationship && <p className="text-sm text-[#5B8A72] font-medium">{c.relationship}</p>}
                <p className="text-sm text-stone-500">{c.email}</p>
                {c.phone && <p className="text-sm text-stone-500">{c.phone}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(c)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all cursor-pointer" aria-label={`Edit ${c.name}`}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {confirmDelete === c.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg font-medium cursor-pointer">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs rounded-lg font-medium cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(c.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" aria-label={`Delete ${c.name}`}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {contacts.length > 0 && contacts.length < 5 && !adding && !editing && (
          <p className="text-center text-stone-400 text-sm pt-2">
            {5 - contacts.length} more contact{5 - contacts.length > 1 ? "s" : ""} can be added
          </p>
        )}
      </main>

      <Navigation />
    </div>
  );
}
