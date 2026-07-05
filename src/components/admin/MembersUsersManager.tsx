import React, { useState } from "react";
import { Plus, Edit2, Trash2, Users, Check, Search, Shield, Key, Eye, HelpCircle, Heart, DollarSign } from "lucide-react";
import { Member } from "../../types";

interface MembersUsersManagerProps {
  members: Member[];
  onRefresh: () => void;
}

export default function MembersUsersManager({ members, onRefresh }: MembersUsersManagerProps) {
  const [subTab, setSubTab] = useState<"directory" | "credentials">("directory");

  // Search
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Feedback States
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing targets
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedMemberLogs, setSelectedMemberLogs] = useState<Member | null>(null);

  // Form Fields
  const [memName, setMemName] = useState("");
  const [memEmail, setMemEmail] = useState("");
  const [memPhone, setMemPhone] = useState("");
  const [memDistrict, setMemDistrict] = useState("Fonteyn");
  const [memFamilyGroup, setMemFamilyGroup] = useState("");
  const [memRelation, setMemRelation] = useState("Member");
  const [memDepartment, setMemDepartment] = useState("General");
  const [memRole, setMemRole] = useState<Member["role"]>("Member");
  const [memBio, setMemBio] = useState("");
  const [memPhoto, setMemPhoto] = useState("");
  const [memPassword, setMemPassword] = useState("");

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const handleEditMemberInit = (m: Member) => {
    setEditingMemberId(m.id);
    setMemName(m.name);
    setMemEmail(m.email);
    setMemPhone(m.phone || "");
    setMemDistrict(m.district || "Fonteyn");
    setMemFamilyGroup(m.familyGroup || "");
    setMemRelation(m.familyRelation || "Member");
    setMemDepartment(m.servingDepartment || "General");
    setMemRole(m.role || "Member");
    setMemBio(m.bio || "");
    setMemPhoto(m.photo || "");
    setMemPassword((m as any).password || "");
  };

  const handleResetMemberForm = () => {
    setEditingMemberId(null);
    setMemName("");
    setMemEmail("");
    setMemPhone("");
    setMemDistrict("Fonteyn");
    setMemFamilyGroup("");
    setMemRelation("Member");
    setMemDepartment("General");
    setMemRole("Member");
    setMemBio("");
    setMemPhoto("");
    setMemPassword("");
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName || !memEmail) {
      triggerError("Name and Email are required to register a member.");
      return;
    }

    const payload = {
      name: memName,
      email: memEmail,
      phone: memPhone,
      district: memDistrict,
      familyGroup: memFamilyGroup,
      familyRelation: memRelation,
      servingDepartment: memDepartment,
      role: memRole,
      bio: memBio,
      photo: memPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
      password: memPassword || undefined
    };

    try {
      const url = editingMemberId ? `/api/members/${editingMemberId}` : "/api/members";
      const method = editingMemberId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerSuccess(editingMemberId ? "Member record updated." : "New member profile created.");
        handleResetMemberForm();
        onRefresh();
      } else {
        const data = await res.json();
        triggerError(data.error || "Failed to save profile.");
      }
    } catch (err) {
      triggerError("Network error.");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Permanently erase this member registry and authorization profile? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerSuccess("Member record purged from registry.");
        if (selectedMemberLogs?.id === id) {
          setSelectedMemberLogs(null);
        }
        onRefresh();
      } else {
        triggerError("Failed to delete record.");
      }
    } catch (err) {}
  };

  // Directly set roles for credential sub-tab
  const handleUpdateRoleDirect = async (m: Member, newRole: Member["role"]) => {
    try {
      const res = await fetch(`/api/members/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        triggerSuccess(`Role updated to [ ${newRole} ] successfully!`);
        onRefresh();
      }
    } catch (err) {}
  };

  // Filters
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.district || "").toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("directory")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "directory" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Membership Directory ({members.length})</span>
        </button>
        <button
          onClick={() => setSubTab("credentials")}
          className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            subTab === "credentials" ? "border-gold-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Users Security Credentials & Roles</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-1 font-medium animate-fade-in">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- DIRECTORY TAB --- */}
      {subTab === "directory" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Member profile form */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
            <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="h-4 w-4 text-gold-600" />
              <span>{editingMemberId ? "Modify Member Directory File" : "Create Member Profile"}</span>
            </h4>

            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sipho M. Dlamini"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="sipho@gmail.com"
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+268 7605 4321"
                    value={memPhone}
                    onChange={(e) => setMemPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Residential District</label>
                  <input
                    type="text"
                    placeholder="Fonteyn / Mbabane"
                    value={memDistrict}
                    onChange={(e) => setMemDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Family Group / Household</label>
                  <input
                    type="text"
                    placeholder="Dlamini Family"
                    value={memFamilyGroup}
                    onChange={(e) => setMemFamilyGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Household Role</label>
                  <select
                    value={memRelation}
                    onChange={(e) => setMemRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                  >
                    <option value="Father / Head">Father / Household Head</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Member">General Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Serving Department</label>
                  <input
                    type="text"
                    placeholder="Youth Choir / Ushers / None"
                    value={memDepartment}
                    onChange={(e) => setMemDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Staff/Member Role</label>
                  <select
                    value={memRole}
                    onChange={(e) => setMemRole(e.target.value as Member["role"])}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
                  >
                    <option value="Member">Regular Member</option>
                    <option value="Leader">Church Leader</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={memPhoto}
                    onChange={(e) => setMemPhoto(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Account Login Password</label>
                <input
                  type="password"
                  placeholder="Set account login password..."
                  value={memPassword}
                  onChange={(e) => setMemPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-heading text-[10px] font-bold uppercase tracking-wider mb-1">Personal Testimony / Bio</label>
                <textarea
                  rows={2}
                  placeholder="Brief biography..."
                  value={memBio}
                  onChange={(e) => setMemBio(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-sans"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-heading font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                >
                  {editingMemberId ? "Update Profile" : "Register Member"}
                </button>
                {editingMemberId && (
                  <button
                    type="button"
                    onClick={handleResetMemberForm}
                    className="px-3 bg-slate-200 text-slate-600 font-heading font-bold text-[10px] uppercase py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Member lists */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search members by name, email, district..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="Member">Regular Member</option>
                <option value="Leader">Church Leader</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredMembers.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No member files found.</p>
              ) : (
                filteredMembers.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={m.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300"}
                        alt={m.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-heading font-bold text-slate-800">{m.name}</p>
                          <span className={`text-[8px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-full ${
                            m.role === "Admin" ? "bg-red-100 text-red-700" : m.role === "Leader" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"
                          }`}>
                            {m.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{m.email} • {m.phone || "No contact info"}</p>
                        <p className="text-[10px] text-slate-500 font-sans italic line-clamp-1">{m.bio || "No biography provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedMemberLogs(m)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-heading font-bold uppercase transition-all"
                      >
                        Giving Log ({m.givingHistory?.length || 0})
                      </button>
                      <button
                        onClick={() => handleEditMemberInit(m)}
                        className="p-1.5 bg-white text-slate-500 hover:text-slate-900 rounded border border-slate-200 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded border border-slate-200 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Giving History Log Drawer */}
            {selectedMemberLogs && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 animate-fade-in space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gold-400 font-mono font-bold">Confidential Member Ledger</span>
                    <h5 className="font-heading font-bold text-sm text-white">{selectedMemberLogs.name}'s Contribution Register</h5>
                  </div>
                  <button
                    onClick={() => setSelectedMemberLogs(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold font-mono px-2 py-1 bg-slate-800 rounded-md"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {!selectedMemberLogs.givingHistory || selectedMemberLogs.givingHistory.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No contribution transactions recorded for this member.</p>
                  ) : (
                    selectedMemberLogs.givingHistory.map((g, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <p className="font-semibold text-slate-250">{g.purpose}</p>
                          <p className="text-[9px] text-slate-500 font-mono">{g.date} • Ref: {g.txId}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">+ E {g.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CREDENTIALS MANAGEMENT TAB --- */}
      {subTab === "credentials" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="font-heading font-bold text-slate-850">Role-Based Core Authorization Control</p>
              <p className="text-slate-400 mt-0.5">Edit system authorization keys, assign security passwords, or directly delegate staff roles.</p>
            </div>
            <span className="bg-primary-100 text-primary-900 font-bold px-2 py-1 rounded">System Secure Entry Gates Active</span>
          </div>

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-heading font-bold text-slate-850 flex items-center space-x-1.5">
                    <span>{m.name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-[10px] text-slate-500 font-normal">{m.email}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Login Password Hash: <span className="text-slate-700 font-semibold">{(m as any).password ? "•••••••• (Encrypted)" : "Not Configured"}</span>
                  </p>
                </div>

                {/* Role select directly */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-heading font-bold">Assign Role:</span>
                  <select
                    value={m.role}
                    onChange={(e) => handleUpdateRoleDirect(m, e.target.value as Member["role"])}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-heading text-[10px] font-bold uppercase tracking-wider text-slate-650 focus:outline-none"
                  >
                    <option value="Member">Regular Member</option>
                    <option value="Leader">Church Leader</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
