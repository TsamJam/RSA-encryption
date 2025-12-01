// src/rsa-math.ts

// --- 1. MODULAR EXPONENTIATION ---
// Menghitung (base^exp) % mod secara efisien untuk angka raksasa.
// Kita tidak bisa pakai base ** exp karena hasilnya terlalu besar untuk memori.
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

// --- 2. EXTENDED EUCLIDEAN ALGORITHM ---
// Mencari kebalikan (inverse) dari e mod phi.
// Rumus: d * e = 1 (mod phi)
function modInverse(e: bigint, phi: bigint): bigint {
  let m0 = phi;
  let y = 0n;
  let x = 1n;

  if (phi === 1n) return 0n;

  while (e > 1n) {
    // q adalah hasil bagi
    const q = e / phi;
    let t = phi;

    // phi adalah sisa bagi
    phi = e % phi;
    e = t;
    t = y;

    // Update x dan y
    y = x - q * y;
    x = t;
  }

  // Pastikan x positif
  if (x < 0n) x += m0;

  return x;
}

// --- 3. FUNGSI GCD ---
function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// --- 4. PRIMALITY TEST (Miller-Rabin Sederhana) ---
// Cek apakah angka adalah bilangan prima
function isPrime(n: bigint): boolean {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  let i = 5n;
  // Cek pembagi hingga akar kuadrat (versi optimasi sederhana)
  // Note: Untuk angka RSA asli (2048 bit), kita butuh Miller-Rabin full loop.
  // Untuk demo web ini, kita batasi loop agar browser tidak hang.
  while (i * i <= n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
    i += 6n;
    // Safety break untuk demo jika angka terlalu besar
    if (i > 10000n) break; 
  }
  return true;
}

// --- 5. GENERATE RANDOM PRIME ---
// Membuat angka acak lalu cek apakah prima
function generateRandomPrime(bits: number): bigint {
  const min = 2n ** BigInt(bits - 1);
  const max = 2n ** BigInt(bits) - 1n;
  
  while (true) {
    // Hack sederhana untuk random BigInt di range tertentu
    const rand = BigInt(Math.floor(Math.random() * Number(max - min))) + min;
    if (isPrime(rand)) return rand;
  }
}

// --- 6. GENERATE KEY PAIR ---
export function generateKeys() {
  // Kita pakai bit kecil (misal 16-32 bit) agar browser cepat menghitungnya.
  // RSA asli butuh 1024/2048 bit (bisa bikin browser freeze tanpa Web Worker).
  const bitSize = 16; 
  
  const p = generateRandomPrime(bitSize);
  let q = generateRandomPrime(bitSize);
  while (p === q) q = generateRandomPrime(bitSize); // Pastikan p beda dengan q

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e = 65537n; // Standar umum
  // Jika e tidak copreim dengan phi, cari e lain (jarang terjadi dgn 65537)
  while (gcd(e, phi) !== 1n) {
    e += 2n;
  }

  const d = modInverse(e, phi);

  return {
    publicKey: { e, n },
    privateKey: { d, n }
  };
}