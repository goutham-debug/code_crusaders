import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './index.css';

const BACKEND = process.env.REACT_APP_BACKEND || "http://localhost:4000";
const CONTRACT_ABI = [
  "function registerDID(string did, string ipfsCid, string controller) external",
  "function updateDID(string did, string ipfsCid, string controller) external",
  "function getDID(string did) view returns (address owner, string ipfsCid, string controller, bool exists)"
];
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

function App(){
  const [walletAddr, setWalletAddr] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [did, setDid] = useState("");
  const [controller, setController] = useState("");
  const [file, setFile] = useState(null);
  const [subjectData, setSubjectData] = useState("");
  const [creds, setCreds] = useState([]);

  useEffect(()=>{
    if(window.ethereum){
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
    }
  },[]);

  async function connectWallet(){
    if(!window.ethereum) return alert('Install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddr(accounts[0]);
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
  }

  async function registerDID(){
    if(!signer) return alert('connect wallet');
    const didString = did || `did:ethr:${walletAddr}`;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const ipfsCid = "";
    const tx = await contract.registerDID(didString, ipfsCid, controller || "");
    await tx.wait();
    alert('DID registered on-chain: ' + didString);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result.split(',')[1]; // remove data:*/*;base64,
        resolve(result);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async function issueVC(){
    if(!walletAddr) return alert('connect wallet');
    let fileBase64 = '';
    let fileName = '';
    if(file){
      fileName = file.name;
      fileBase64 = await fileToBase64(file);
    }
    let dataObj;
    try {
      dataObj = JSON.parse(subjectData);
    } catch(e) {
      dataObj = { raw: subjectData || "No data" };
    }
    const payload = {
      subjectDid: did || `did:ethr:${walletAddr}`,
      subjectData: dataObj,
      fileBase64,
      fileName
    };
    const res = await axios.post(`${BACKEND}/issue-vc`, payload);
    const { signedVC, credentialId, fileCid } = res.data;
    const item = { id: credentialId, signedVC, fileCid, createdAt: new Date().toISOString() };
    setCreds(prev => [item, ...prev]);
    alert('VC issued by backend; signed and returned.');
  }

  async function verifyVC(signedVC){
    const res = await axios.post(`${BACKEND}/verify-vc`, { signedVC });
    alert('Signed by: ' + res.data.signer);
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">CX</div>
        <div>
          <div className="title">CredenX — Digital Identity & Certificates</div>
          <div className="small">A Trusted Gateway for Verifiable Digital Credentials</div>
        </div>
        <div style={{marginLeft:'auto'}}>
          {!walletAddr ? (
            <button className="connect-btn" onClick={connectWallet}>Connect MetaMask</button>
          ) : <div className="small">Connected: {walletAddr.slice(0,6)}...{walletAddr.slice(-4)}</div>}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Create Your Digital ID</h3>
          <div className="form-row">
            <label>Your Digital ID</label>
            <input type="text" value={did} onChange={(e)=>setDid(e.target.value)} placeholder={`did:ethr:${walletAddr || '0x...'}`} />
          </div>
          <div className="form-row">
            <label>Account ID</label>
            <input type="text" value={controller} onChange={(e)=>setController(e.target.value)} placeholder="controller DID or metadata" />
          </div>
          <button className="primary" onClick={registerDID}>Create My Digital ID</button>

          <hr style={{margin:'18px 0', borderColor:'rgba(255,255,255,0.03)'}}/>

          <h3>Trusted Digital Proof</h3>
          <div className="form-row">
            <label>Person/Document Details</label>
            <textarea rows={4} value={subjectData} onChange={(e)=>setSubjectData(e.target.value)} placeholder='{"name":"Aishwarya S","document":"Aadhaar 1234..."}'></textarea>
          </div>
          <div className="form-row">
            <label>Attach Document</label>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
          </div>
          <button className="primary" onClick={issueVC}>Store Certificates</button>
        </div>

        <div className="card">
          <h3>Credentials</h3>
          <div className="list">
            {creds.length===0 && <div className="small">You haven't created any certificates yet.</div>}
            {creds.map(c => (
              <div key={c.id} className="cred">
                <div>
                  <div style={{fontWeight:700}}>{c.id}</div>
                  <div className="small">Created On {new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="primary" onClick={()=>verifyVC(c.signedVC)}>View Certificate</button>
                  <a className="small" href={c.fileCid ? `https://ipfs.io/ipfs/${c.fileCid}` : '#'} target="_blank" rel="noreferrer">{c.fileCid ? 'View Attachment' : ''}</a>
                </div>
              </div>
            ))}
          </div>

          <footer>
            <div> Ready </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
