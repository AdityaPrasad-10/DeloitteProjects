import { useState, useMemo } from "react";

const org= {
  group1: {
    type1:["A","B"],
    type2:["C","D"],
  },
  group2:{
    type3:["E","F"],
  },
};

const rec=[
  {name:"A", group:"group1",type:"type1", status:"active"},
  {name:"B", group:"group1",type:"type1", status:"inactive"},
  {name:"C", group:"group1",type:"type2", status:"active"},
  {name:"D", group:"group1",type:"type2", status:"active"},
  {name:"E", group:"group2",type:"type3", status:"active"},
  {name:"F", group:"group2",type:"type3", status:"inactive"},
];

export default function App(){

  const [group,setGroup]= useState("");
  const [type,setType]= useState("");
  const [name,setName]= useState("");

  const [statusFilter,setStatusFilter]= useState("");
  const typeOptions=group ? Object.keys(org[group]):[];
  const nameOptions = group && type ? org[group]?.[type] || [] : [];

  function handleGroupchange(val){
    setGroup(val);
    setType("");
    setName("");
  }
  function handleTypechange(val){
    setType(val);
    setName("");
  }
  const filtered= useMemo(()=>
    rec.filter(e =>{
      if(group && e.group!=group) return false;
      if(type && e.type!=type) return false;
      if(name && e.name!=name) return false;
      if(statusFilter && e.status!=statusFilter) return false;
      return true;
    }),
    [group,type,name,statusFilter]
  );

  return(
    
<div style={{ padding: "32px", fontFamily: "sans-serif", maxWidth: "700px" }}>

      <h2 style={{ marginBottom: "24px" }}>Filter Demo</h2>

      <fieldset style={{ marginBottom: "24px", padding: "16px 20px", border: "1px solid #ccc" }}>
        <legend style={{ fontWeight: "bold", padding: "0 6px" }}>Cascading Filters</legend>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>

          <div>
            <label style={labelStyle}>Group</label>
            <select value={group} onChange={e => handleGroupchange(e.target.value)} style={selectStyle}>
              <option value="">All</option>
              {Object.keys(org).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <span style={{ fontSize: "18px", color: "#999", paddingBottom: "4px" }}>→</span>

          <div>
            <label style={labelStyle}>Type</label>
            <select value={type} onChange={e => handleTypechange(e.target.value)} disabled={!group} style={selectStyle}>
              <option value="">-- All --</option>
              {typeOptions.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <span style={{ fontSize: "18px", color: "#999", paddingBottom: "4px" }}>→</span>

          <div>
            <label style={labelStyle}>Name</label>
            <select value={name} onChange={e => setName(e.target.value)} disabled={!type} style={selectStyle}>
              <option value="">All</option>
              {nameOptions.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>

        </div>
      </fieldset>

      <fieldset style={{ marginBottom: "24px", padding: "16px 20px", border: "1px solid #ccc" }}>
        <legend style={{ fontWeight: "bold", padding: "0 6px" }}>Column Filters</legend>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

          <div>
            <label style={labelStyle}>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="">All </option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

        </div>
      </fieldset>

      <p style={{ marginBottom: "8px", color: "#555", fontSize: "13px" }}>
        Showing {filtered.length} of {rec.length} records
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Group</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                No results match the current filters.
              </td>
            </tr>
          ) : (
            filtered.map(e => (
              <tr key={e.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{e.name}</td>
                <td style={tdStyle}>{e.group}</td>
                <td style={tdStyle}>{e.type}</td>
                <td style={tdStyle}>{e.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "4px",
  color: "#444",
};

const selectStyle = {
  padding: "6px 10px",
  fontSize: "13px",
  border: "1px solid #ccc",
  minWidth: "150px",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: "bold",
  fontSize: "13px",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "10px 12px",
  color: "#333",
};