import { useState, useEffect } from "react";
const initial_user= {
    dpn: "", psc: "", sourceContainer: "rms landed",
    scp: "", countryCode: "", countryName: "",
    categoryCoverage: "", datasetCode: ""
   };
 const initial_sme = {
   uniqueId: "Yes", derive: "Yes", direct: "Direct",
   writemode: "append", merge: "", transform: "",
   dimension: "", overlap: ""
  };
const styles = {
  body: {
     fontFamily: "'Segoe UI', sans-serif",
     maxWidth: 580, margin: "40px auto",
     padding: "0 16px", background: "#f6f7fb", minHeight: "100vh"
},
   shell: {
     background: "#fff", border: "1px solid #e8e8ef",
     borderRadius: 12, padding: "24px 24px 28px",
     boxShadow: "0 8px 24px rgba(20,20,40,0.07)"
    },
    topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    stepText: { fontSize: 14, fontWeight: 600, color: "#333" },
    progressWrap: {
      width: "100%", height: 8, background: "#e9eef7",
      borderRadius: 999, overflow: "hidden",
      border: "1px solid #e0e6f2", marginBottom: 18
    },
    h2: { margin: "0 0 14px", fontSize: 18, color: "#111" },
    label: { display: "block", marginTop: 12, fontSize: 14, color: "#333", fontWeight: 500 },
    req: { color: "red", marginLeft: 3 },
    input: {
      display: "block", width: "100%", marginTop: 6,
      padding: "9px 11px", fontSize: 14, boxSizing: "border-box",
      border: "1px solid #cfd6e4", borderRadius: 6, outline: "none",
      background: "#fff", fontFamily: "inherit"
    },
    inputErr: { borderColor: "#d32f2f", boxShadow: "0 0 0 3px rgba(211,47,47,0.1)" },
    errMsg: { fontSize: 12, color: "#c62828", marginTop: 4 },
    select: {
      display: "block", width: "100%", marginTop: 6,
      padding: "9px 11px", fontSize: 14, boxSizing: "border-box",
      border: "1px solid #cfd6e4", borderRadius: 6, outline: "none",
      background: "#fff", fontFamily: "inherit"
    },
    btnrow: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" },
    btn: {
      flex: "1 1 0", minWidth: 120, padding: "10px 16px",
      fontSize: 14, cursor: "pointer", color: "#fff",
      border: "none", borderRadius: 6, fontFamily: "inherit"
    },
    hint: { marginTop: 12, fontSize: 12, color: "#777" },
    success: {
      color: "#1b5e20", fontSize: 15, padding: 18,
      border: "1px solid #1b5e20", borderRadius: 8,
      background: "#f0fff0", marginTop: 8
    }
  };
function Field({ id, label, required, error, children }) {
    return (
      <div>
      <label style={styles.label}>
        {label}{required && <span style={styles.req}>*</span>}
      </label>
        {children}
        {error && <div style={styles.errMsg}>{error}</div>}
    </div>
  );
  }
function TextInput({ id, value, onChange, placeholder, maxLength, list, hasErr }) { 
      return (   
        <input      id={id} list={list} value={value} onChange={onChange}      
        placeholder={placeholder} maxLength={maxLength}     
        style={{display: "block", width: "100%", marginTop: 6,padding: "9px 11px", fontSize: 14, boxSizing: "border-box",border: hasErr ? "1px solid #d32f2f" : "1px solid #cfd6e4",boxShadow: hasErr ? "0 0 0 3px rgba(211,47,47,0.1)" : "none",borderRadius: 6, outline: "none",background: "#fff", fontFamily: "inherit" }} />   
        );
         }
  function Select({ id, value, onChange, options }) {
    return (
    <select id={id} value={value} onChange={onChange} style={styles.select}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  }
  
export default function App(){
    const [step,setStep] = useState(1);
    const [UserData,setUserData] = useState(initial_user);
    const [smeData,setSmeData] = useState(initial_sme);
    const [errors,setErrors] = useState({});
    const [saving,setSaving] = useState(false);

  useEffect(()=>{
     const raw=localStorage.getItem("formDraft");
     if(!raw) return;
     try{
      const d=JSON.parse(raw);
      if(d.user) setUserData(d.user);
      if(d.sme) setSmeData(d.sme);
     }catch{} 
}, []);
useEffect(()=>{
    localStorage.setItem("formDraft",JSON.stringify({user:UserData,sme:smeData}));
},[UserData,smeData]);
function validate(){
  const e={};
  if(!UserData.dpn) e.dpn="Required";
  if (!UserData.psc)             e.psc = "Required";
    if (!UserData.sourceContainer) e.sourceContainer = "Required";
    if (!UserData.scp)             e.scp = "Required";
    setErrors(e);
    return Object.keys(e).length ===0;
}
function submitUser(){
    if(!validate()) return;
    setStep(2);
}
async function submitSme() {
    setSaving(true);
    try{
        const res=await fetch("http://localhost:4000/submit",{
           method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({user:UserData,sme:smeData})
        });
        if(!res.ok) throw new Error("Server error");
        localStorage.removeItem("formDraft");
        setStep(3);
    }catch{
        alert("Could not save.");
    }finally{
        setSaving(false);
    }
}
function resetAll(){
    setUserData(initial_user);
    setSmeData(initial_sme);
    setErrors({});
    localStorage.removeItem("formDraft");
    setStep(1);
}
const progress = step===1?50:100;
  const u = UserData;
  const s = smeData;
 
  return (
    <div style={styles.body}>
      <div style={styles.shell}>
 
        <div style={styles.topbar}>
          <div style={styles.stepText}>{step === 3 ? "Done" : `Step ${step} of 2`}</div>
        </div>
 
        <div style={styles.progressWrap}>
          <div style={{height: "100%", width: `${progress}%`,background: "linear-gradient(90deg,#4CAF50,#2e7d32)",borderRadius: 999, transition: "width 220ms ease"}} />
        </div>
 
        {step === 1 && (
          <div>
            <h2 style={styles.h2}>Section 1: User Details</h2>
 
            <Field id="dpn" label="Data Provider Name" required error={errors.dpn}>
              <TextInput id="dpn" value={u.dpn} placeholder="E.g: acme data co."
                onChange={e => { setUserData(p => ({...p, dpn: e.target.value})); setErrors(p => ({...p, dpn: ""})); }} />
            </Field>
 
        <Field id="psc" label="Provider Short Code" required error={errors.psc}>
              <TextInput id="psc" value={u.psc} placeholder="E.g: acme" maxLength={50}
                onChange={e => { setUserData(p => ({...p, psc: e.target.value})); setErrors(p => ({...p, psc: ""})); }} />
            </Field>
 
        <Field id="sourceContainer" label="Source Container" required error={errors.sourceContainer}>
              <Select id="sourceContainer" value={u.sourceContainer}
                onChange={e => setUserData(p => ({...p, sourceContainer: e.target.value}))}
                options={[{value:"rms landed",label:"rms-landed"},{value:"media landed",label:"media-landed"}]} />
            </Field>
 
<Field id="scp" label="Source Container Path" required error={errors.scp}>
              <TextInput id="scp" value={u.scp} placeholder="Path"
                onChange={e => { setUserData(p => ({...p, scp: e.target.value})); setErrors(p => ({...p, scp: ""})); }} />
            </Field>
 
            <Field id="countryCode" label="Country Code">
              <TextInput id="countryCode" value={u.countryCode} placeholder="ISO 2 Letter Country Code" maxLength={2}
                onChange={e => setUserData(p => ({...p, countryCode: e.target.value}))} />
            </Field>
 
            <Field id="countryName" label="Country">
              <TextInput id="countryName" value={u.countryName} placeholder="Full country name"
                onChange={e => setUserData(p => ({...p, countryName: e.target.value}))} />
            </Field>
 
            <Field id="categoryCoverage" label="Category Coverage">
              <TextInput id="categoryCoverage" value={u.categoryCoverage} placeholder="Data category/scope"
                onChange={e => setUserData(p => ({...p, categoryCoverage: e.target.value}))} />
            </Field>
 
            <Field id="datasetCode" label="Dataset Code">
              <TextInput id="datasetCode" value={u.datasetCode} placeholder="Type to search..." list="dataset-list"
                onChange={e => setUserData(p => ({...p, datasetCode: e.target.value}))} />
              <datalist id="dataset-list">
                <option value="RMS" /><option value="POS" />
              </datalist>
            </Field>
 
        <div style={styles.btnrow}>
              <button style={{...styles.btn, background:"#4CAF50"}} onClick={submitUser}>Submit →</button>
              <button style={{...styles.btn, background:"#6b7280"}} onClick={resetAll}>Reset</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 style={styles.h2}>Section 2: SME Details</h2>
 
            <Field id="uniqueId" label="Is there Unique ID's?">
              <Select id="uniqueId" value={s.uniqueId}
                onChange={e => setSmeData(p => ({...p, uniqueId: e.target.value}))}
                options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            </Field>
        <Field id="derive" label="Derive Country from filename?">
              <Select id="derive" value={s.derive}
                onChange={e => setSmeData(p => ({...p, derive: e.target.value}))}
                options={[{value:"Yes",label:"Yes"},{value:"No",label:"No"}]} />
            </Field>
 
        <Field id="direct" label="Is this a direct feed or indirect (via intermediary)?">
              <Select id="direct" value={s.direct}
                onChange={e => setSmeData(p => ({...p, direct: e.target.value}))}
                options={[{value:"Direct",label:"Direct"},{value:"Indirect",label:"Indirect"}]} />
            </Field>
 
            <Field id="writemode" label="Write Mode">
              <Select id="writemode" value={s.writemode}
                onChange={e => setSmeData(p => ({...p, writemode: e.target.value}))}
                options={[{value:"append",label:"Append"},{value:"Overwrite",label:"Overwrite"},{value:"Merge",label:"Merge"}]} />
            </Field>
 
        <Field id="merge" label="Key Columns to Merge">
              <TextInput id="merge" value={s.merge} placeholder="Column1,column2...."
                onChange={e => setSmeData(p => ({...p, merge: e.target.value}))} />
            </Field>
            <Field id="transform" label="Transform Set">
              <TextInput id="transform" value={s.transform} placeholder="Name of transformation"
                onChange={e => setSmeData(p => ({...p, transform: e.target.value}))} />
            </Field>
 
<Field id="dimension" label="Dimension Routing Set">
              <TextInput id="dimension" value={s.dimension} placeholder="Routing set name"
                onChange={e => setSmeData(p => ({...p, dimension: e.target.value}))} />
            </Field>
 
            <Field id="overlap" label="Overlap Delete Column">
              <TextInput id="overlap" value={s.overlap} placeholder="Column to delete"
                onChange={e => setSmeData(p => ({...p, overlap: e.target.value}))} />
            </Field>
        <div style={styles.btnrow}>
          <button style={{...styles.btn, background:"#6b7280"}} onClick={() => setStep(1)}>← Back</button>
            <button style={{...styles.btn, background: saving ? "#aaa" : "#4CAF50"}}
              onClick={submitSme} disabled={saving}>
                {saving ? "Saving..." : "Submit ✓"}
            </button>
            <button style={{...styles.btn, background:"#ef4444"}} onClick={resetAll}>Reset</button>
          </div>
          </div>
        )}
      {step === 3 && (
        <div style={styles.success}>
          ✅ Form submitted successfully!
          <div style={styles.btnrow}>
            <button style={{...styles.btn, background:"#6b7280"}} onClick={resetAll}>Start New</button>
          </div>
        </div>
    )}
 
  </div>
</div>
);
 
}
