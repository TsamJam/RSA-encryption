import React, { useState } from 'react';
import { generateKeys, modPow } from './rsa-math';
import './App.css'; 

const App: React.FC = () => {
  // --- STATE BARU (String agar bisa diedit manual) ---
  // Public Key
  const [valE, setValE] = useState<string>('');
  const [valNPub, setValNPub] = useState<string>('');
  
  // Private Key
  const [valD, setValD] = useState<string>('');
  const [valNPriv, setValNPriv] = useState<string>('');
  
  // Inputs & Outputs
  const [textToEncrypt, setTextToEncrypt] = useState<string>('');
  const [encryptedResult, setEncryptedResult] = useState<string>('');
  
  const [textToDecrypt, setTextToDecrypt] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<string>('');
  
  const [logs, setLogs] = useState<string[]>([]); 

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  // --- 1. GENERATE KEYS (Otomatis) ---
  const handleGenerateKeys = () => {
    addLog("Sedang menghitung kunci baru...");
    setTimeout(() => {
      const keys = generateKeys();
      
      // Masukkan hasil ke dalam kolom input
      const newE = keys.publicKey.e.toString();
      const newN = keys.publicKey.n.toString();
      const newD = keys.privateKey.d.toString();

      setValE(newE);
      setValNPub(newN); // Public N
      setValD(newD);
      setValNPriv(newN); // Private N (biasanya sama dengan Public N)
      
      addLog(`Kunci berhasil di-generate! n = ${newN}`);
    }, 100);
  };

  // --- 2. ENCRYPT (Bisa pakai kunci manual) ---
  const handleEncrypt = () => {
    if (!valE || !valNPub || !textToEncrypt) {
      alert("Mohon isi Public Key (e, n) dan Pesan!");
      return;
    }

    try {
      const e = BigInt(valE);
      const n = BigInt(valNPub);
      
      const encryptedCodes = textToEncrypt.split('').map(char => {
        const charCode = BigInt(char.charCodeAt(0));
        const encryptedBigInt = modPow(charCode, e, n);
        return encryptedBigInt.toString();
      });

      const resultStr = encryptedCodes.join(',');
      setEncryptedResult(resultStr);
      setTextToDecrypt(resultStr); // Auto-copy ke kolom kanan
      addLog(`Enkripsi Selesai dengan e=${valE}, n=${valNPub}`);
    } catch (error) {
      alert("Error: Input kunci harus berupa angka valid!");
      console.error(error);
    }
  };

  // --- 3. DECRYPT (Bisa pakai kunci manual) ---
  const handleDecrypt = () => {
    if (!valD || !valNPriv || !textToDecrypt) {
      alert("Mohon isi Private Key (d, n) dan Ciphertext!");
      return;
    }

    try {
      const d = BigInt(valD);
      const n = BigInt(valNPriv);

      const encryptedArray = textToDecrypt.split(',').map(str => BigInt(str.trim()));

      const decryptedChars = encryptedArray.map(cipherBigInt => {
        const decryptedBigInt = modPow(cipherBigInt, d, n);
        return String.fromCharCode(Number(decryptedBigInt));
      });

      setDecryptedResult(decryptedChars.join(''));
      addLog(`Dekripsi Selesai dengan d=${valD}, n=${valNPriv}`);
    } catch (error) {
      setDecryptedResult("Error: Kunci salah atau format pesan rusak.");
      addLog("Gagal mendekripsi.");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🧮 Manual & Auto RSA</h1>
        <p>Generate otomatis atau masukkan kunci (e, n, d) sendiri.</p>
      </header>

      <div className="grid-layout">
        
        {/* KOLOM 1: INPUT / GENERATE KUNCI */}
        <div className="card">
          <h2>1. Pengaturan Kunci</h2>
          <button onClick={handleGenerateKeys} className="btn-primary">
            🎲 Generate Random Keys
          </button>
          
          <div className="input-group">
            <h3 style={{marginTop: '15px', fontSize: '1rem', color: '#81a1c1'}}>Public Key (Lock)</h3>
            <label>Exponent (e):</label>
            <input 
              type="text" 
              value={valE} 
              onChange={(e) => setValE(e.target.value)}
              placeholder="Contoh: 65537"
            />
            <label>Modulus (n):</label>
            <input 
              type="text" 
              value={valNPub} 
              onChange={(e) => setValNPub(e.target.value)}
              placeholder="Angka besar hasil p*q"
            />
          </div>
          
          <div className="input-group">
            <h3 style={{marginTop: '15px', fontSize: '1rem', color: '#d08770'}}>Private Key (Key)</h3>
            <label>Exponent (d):</label>
            <input 
              type="text" 
              value={valD} 
              onChange={(e) => setValD(e.target.value)}
              placeholder="Angka rahasia..."
              className="secret-input"
            />
            <label>Modulus (n):</label>
            <input 
              type="text" 
              value={valNPriv} 
              onChange={(e) => setValNPriv(e.target.value)}
              placeholder="Sama dengan Public n"
            />
          </div>
        </div>

        {/* KOLOM 2: ENKRIPSI */}
        <div className="card">
          <h2>2. Enkripsi (M^e mod n)</h2>
          <input 
            type="text" 
            value={textToEncrypt}
            onChange={(e) => setTextToEncrypt(e.target.value)}
            placeholder="Ketik pesan..."
          />
          <button onClick={handleEncrypt} className="btn-action">Hitung Enkripsi</button>
          
          <div className="input-group">
            <label>Ciphertext (Copy ini):</label>
            <textarea value={encryptedResult} readOnly className="result-box" />
          </div>
        </div>

        {/* KOLOM 3: DEKRIPSI */}
        <div className="card">
          <h2>3. Dekripsi (C^d mod n)</h2>
          <textarea 
            value={textToDecrypt}
            onChange={(e) => setTextToDecrypt(e.target.value)}
            placeholder="Masukkan angka dipisah koma..."
          />
          <button onClick={handleDecrypt} className="btn-action">Hitung Dekripsi</button>
          
          <div className="input-group">
            <label>Pesan Kembali:</label>
            <div className="result-display success">
              {decryptedResult || "..."}
            </div>
          </div>
        </div>

      </div>

      <div className="logs-area">
        <h3>Log Sistem:</h3>
        <ul>
          {logs.map((log, i) => <li key={i}>{log}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default App;