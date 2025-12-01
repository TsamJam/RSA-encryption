import React, { useState } from 'react';
import { generateKeys, modPow } from './rsa-math';
import './App.css'; // Gunakan CSS yang sama seperti sebelumnya

const App: React.FC = () => {
  // State untuk menyimpan kunci (disimpan sebagai String agar mudah dibaca)
  const [pubKey, setPubKey] = useState<{ e: string, n: string } | null>(null);
  const [privKey, setPrivKey] = useState<{ d: string, n: string } | null>(null);
  
  const [textToEncrypt, setTextToEncrypt] = useState<string>('');
  const [encryptedResult, setEncryptedResult] = useState<string>(''); // Hasil berupa deret angka dipisah koma
  
  const [textToDecrypt, setTextToDecrypt] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<string>('');
  
  const [logs, setLogs] = useState<string[]>([]); // Untuk melihat proses matematika

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  // --- 1. GENERATE KEYS ---
  const handleGenerateKeys = () => {
    addLog("Sedang mencari bilangan prima p dan q...");
    // Timeout agar UI render dulu sebelum hitungan berat
    setTimeout(() => {
      const keys = generateKeys();
      
      setPubKey({ 
        e: keys.publicKey.e.toString(), 
        n: keys.publicKey.n.toString() 
      });
      setPrivKey({ 
        d: keys.privateKey.d.toString(), 
        n: keys.privateKey.n.toString() 
      });
      
      addLog(`Kunci dibuat! n = ${keys.publicKey.n}`);
      addLog(`Public Exponent (e) = ${keys.publicKey.e}`);
      addLog(`Private Exponent (d) = ${keys.privateKey.d}`);
    }, 100);
  };

  // --- 2. ENCRYPT MANUAL ---
  // Rumus: C = M^e mod n
  const handleEncrypt = () => {
    if (!pubKey || !textToEncrypt) return alert("Generate kunci & isi pesan dulu!");

    const e = BigInt(pubKey.e);
    const n = BigInt(pubKey.n);
    
    // Proses enkripsi per karakter (Textbook RSA)
    const encryptedCodes = textToEncrypt.split('').map(char => {
      const charCode = BigInt(char.charCodeAt(0)); // Ubah huruf ke angka (M)
      const encryptedBigInt = modPow(charCode, e, n); // Hitung M^e mod n
      return encryptedBigInt.toString();
    });

    const resultStr = encryptedCodes.join(','); // Gabung dengan koma
    setEncryptedResult(resultStr);
    setTextToDecrypt(resultStr); // Auto-copy ke kolom decrypt
    addLog(`Enkripsi Selesai: Mengubah "${textToEncrypt}" menjadi deret angka.`);
  };

  // --- 3. DECRYPT MANUAL ---
  // Rumus: M = C^d mod n
  const handleDecrypt = () => {
    if (!privKey || !textToDecrypt) return alert("Isi private key & pesan terenkripsi!");

    const d = BigInt(privKey.d);
    const n = BigInt(privKey.n);

    try {
      // Pecah string "123,456,789" menjadi array BigInt
      const encryptedArray = textToDecrypt.split(',').map(str => BigInt(str.trim()));

      const decryptedChars = encryptedArray.map(cipherBigInt => {
        const decryptedBigInt = modPow(cipherBigInt, d, n); // Hitung C^d mod n
        return String.fromCharCode(Number(decryptedBigInt)); // Kembalikan ke huruf
      });

      setDecryptedResult(decryptedChars.join(''));
      addLog("Dekripsi Sukses!");
    } catch (error) {
      setDecryptedResult("Error: Format pesan salah atau kunci tidak cocok.");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🧮 Manual Math RSA</h1>
        <p>RSA Tanpa Library (Pure BigInt Logic)</p>
      </header>

      <div className="grid-layout">
        
        {/* KOLOM KUNCI */}
        <div className="card">
          <h2>1. Matematika Kunci</h2>
          <button onClick={handleGenerateKeys} className="btn-primary">
            Hitung Rumus (Generate Keys)
          </button>
          
          <div className="input-group">
            <label>Public Key (e, n):</label>
            <div className="math-box">
              e: {pubKey?.e || '...'} <br/>
              n: {pubKey?.n || '...'}
            </div>
          </div>
          
          <div className="input-group">
            <label>Private Key (d, n):</label>
            <div className="math-box secret">
              d: {privKey?.d || '...'} <br/>
              n: {privKey?.n || '...'}
            </div>
          </div>
        </div>

        {/* KOLOM ENKRIPSI */}
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
            <label>Ciphertext (Array Angka):</label>
            <textarea value={encryptedResult} readOnly className="result-box" />
          </div>
        </div>

        {/* KOLOM DEKRIPSI */}
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

      {/* LOG AREA UNTUK MELIHAT PROSES */}
      <div className="logs-area">
        <h3>Log Proses Matematika:</h3>
        <ul>
          {logs.map((log, i) => <li key={i}>{log}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default App;