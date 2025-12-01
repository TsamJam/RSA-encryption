import React, { useState } from 'react';
import { generateKeys, modPow } from './rsa-math';
import './App.css'; 

const App: React.FC = () => {
  // --- STATE 1: GENERATOR (Hanya untuk display hasil generate) ---
  const [genResult, setGenResult] = useState<{ e: string, d: string, n: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- STATE 2: ENKRIPSI (User wajib input manual) ---
  const [inputEncE, setInputEncE] = useState<string>(''); // Input E
  const [inputEncN, setInputEncN] = useState<string>(''); // Input N
  const [textToEncrypt, setTextToEncrypt] = useState<string>('');
  const [encryptedResult, setEncryptedResult] = useState<string>(''); 

  // --- STATE 3: DEKRIPSI (User wajib input manual) ---
  const [inputDecD, setInputDecD] = useState<string>(''); // Input D
  const [inputDecN, setInputDecN] = useState<string>(''); // Input N
  const [textToDecrypt, setTextToDecrypt] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<string>('');
  
  const [logs, setLogs] = useState<string[]>([]); 
  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  // --- FUNGSI 1: GENERATE KEYS (Hanya tampilkan, jangan auto-fill ke bawah) ---
  const handleGenerateKeys = () => {
    setIsGenerating(true);
    addLog("Sedang menghitung kunci baru...");
    
    setTimeout(() => {
      const keys = generateKeys();
      
      const newE = keys.publicKey.e.toString();
      const newN = keys.publicKey.n.toString();
      const newD = keys.privateKey.d.toString();

      // Simpan di state khusus generator
      setGenResult({ e: newE, d: newD, n: newN });
      
      addLog(`Kunci selesai dibuat! Silakan copy parameter e, d, dan n.`);
      setIsGenerating(false);
    }, 100);
  };

  // --- FUNGSI 2: ENCRYPT (Baca dari input manual E & N) ---
  const handleEncrypt = () => {
    if (!inputEncE || !inputEncN || !textToEncrypt) {
      alert("Mohon isi Public Key (e, n) dan Pesan secara manual!");
      return;
    }

    try {
      const e = BigInt(inputEncE);
      const n = BigInt(inputEncN);
      
      const encryptedCodes = textToEncrypt.split('').map(char => {
        const charCode = BigInt(char.charCodeAt(0));
        const encryptedBigInt = modPow(charCode, e, n);
        return encryptedBigInt.toString();
      });

      const resultStr = encryptedCodes.join(',');
      setEncryptedResult(resultStr);
      addLog(`Enkripsi Sukses! (e=${inputEncE}, n=${inputEncN})`);
    } catch (error) {
      alert("Input Key harus berupa angka valid!");
    }
  };

  // --- FUNGSI 3: DECRYPT (Baca dari input manual D & N) ---
  const handleDecrypt = () => {
    if (!inputDecD || !inputDecN || !textToDecrypt) {
      alert("Mohon isi Private Key (d, n) dan Ciphertext secara manual!");
      return;
    }

    try {
      const d = BigInt(inputDecD);
      const n = BigInt(inputDecN);

      const encryptedArray = textToDecrypt.split(',').map(str => BigInt(str.trim()));

      const decryptedChars = encryptedArray.map(cipherBigInt => {
        const decryptedBigInt = modPow(cipherBigInt, d, n);
        return String.fromCharCode(Number(decryptedBigInt));
      });

      setDecryptedResult(decryptedChars.join(''));
      addLog(`Dekripsi Sukses! (d=${inputDecD}, n=${inputDecN})`);
    } catch (error) {
      setDecryptedResult("Gagal: Kunci salah atau format pesan rusak.");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🧮 Manual RSA Tool</h1>
        <p>Fitur Terpisah: Generate, Encrypt, dan Decrypt.</p>
      </header>

      <div className="grid-layout">
        
        {/* KOLOM 1: GENERATOR SAJA */}
        <div className="card">
          <h2>1. Key Generator</h2>
          <p style={{fontSize: '0.9rem', color: '#aaa'}}>Klik tombol, lalu copy hasilnya ke kolom Enkripsi/Dekripsi.</p>
          
          <button onClick={handleGenerateKeys} className="btn-primary" disabled={isGenerating}>
            {isGenerating ? 'Menghitung...' : '🎲 Generate New Keys'}
          </button>
          
          {genResult && (
            <div className="result-display" style={{marginTop: '15px', fontSize: '0.9rem'}}>
              <div style={{marginBottom: '10px'}}>
                <strong style={{color: '#81a1c1'}}>Public Key (e):</strong><br/>
                {genResult.e}
              </div>
              <div style={{marginBottom: '10px'}}>
                <strong style={{color: '#d08770'}}>Private Key (d):</strong><br/>
                {genResult.d}
              </div>
              <div>
                <strong style={{color: '#a3be8c'}}>Modulus (n):</strong><br/>
                {genResult.n}
              </div>
            </div>
          )}
        </div>

        {/* KOLOM 2: ENKRIPSI MANUAL */}
        <div className="card">
          <h2>2. Menu Enkripsi</h2>
          
          <div className="input-group">
            <label>Masukkan Public Key (e):</label>
            <input 
              type="text" 
              value={inputEncE} 
              onChange={(e) => setInputEncE(e.target.value)}
              placeholder="Paste 'e' disini..."
            />
            
            <label>Masukkan Modulus (n):</label>
            <input 
              type="text" 
              value={inputEncN} 
              onChange={(e) => setInputEncN(e.target.value)}
              placeholder="Paste 'n' disini..."
            />
            
            <label style={{marginTop: '10px'}}>Pesan Rahasia:</label>
            <input 
              type="text" 
              value={textToEncrypt}
              onChange={(e) => setTextToEncrypt(e.target.value)}
              placeholder="Ketik pesan..."
            />
          </div>

          <button onClick={handleEncrypt} className="btn-action">🔒 Encrypt Pesan</button>
          
          {encryptedResult && (
            <div className="input-group">
              <label>Hasil Enkripsi:</label>
              <textarea value={encryptedResult} readOnly className="result-box" />
            </div>
          )}
        </div>

        {/* KOLOM 3: DEKRIPSI MANUAL */}
        <div className="card">
          <h2>3. Menu Dekripsi</h2>
          
          <div className="input-group">
            <label>Masukkan Private Key (d):</label>
            <input 
              type="text" 
              value={inputDecD} 
              onChange={(e) => setInputDecD(e.target.value)}
              placeholder="Paste 'd' disini..."
              className="secret-input"
            />
            
            <label>Masukkan Modulus (n):</label>
            <input 
              type="text" 
              value={inputDecN} 
              onChange={(e) => setInputDecN(e.target.value)}
              placeholder="Paste 'n' disini..."
            />
            
            <label style={{marginTop: '10px'}}>Ciphertext:</label>
            <textarea 
              value={textToDecrypt}
              onChange={(e) => setTextToDecrypt(e.target.value)}
              placeholder="Paste kode angka hasil enkripsi..."
              style={{height: '60px'}}
            />
          </div>

          <button onClick={handleDecrypt} className="btn-action">🔓 Decrypt Pesan</button>
          
          <div className="input-group">
            <label>Hasil Dekripsi:</label>
            <div className="result-display success">
              {decryptedResult || "..."}
            </div>
          </div>
        </div>

      </div>

      <div className="logs-area">
        <h3>Log Aktivitas:</h3>
        <ul>
          {logs.map((log, i) => <li key={i}>{log}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default App;