import { create } from 'ipfs-http-client';

const projectId = import.meta.env.VITE_IPFS_PROJECT_ID || '';
const projectSecret = import.meta.env.VITE_IPFS_PROJECT_SECRET || '';

const auth = projectId && projectSecret
  ? 'Basic ' + btoa(projectId + ':' + projectSecret)
  : undefined;

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: auth ? {
    authorization: auth
  } : {}
});

export const uploadToIPFS = async (data) => {
  try {
    const result = await client.add(JSON.stringify(data));
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    
    // Fallback to local storage simulation for development
    // Generate a unique hash using SHA-256
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = `Qm${hashHex.substring(0, 44)}`;
    localStorage.setItem(`ipfs_${hash}`, dataString);
    return hash;
  }
};

export const getFromIPFS = async (hash) => {
  try {
    const stream = client.cat(hash);
    const decoder = new TextDecoder();
    let data = '';

    for await (const chunk of stream) {
      data += decoder.decode(chunk, { stream: true });
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    
    // Fallback to local storage for development
    const localData = localStorage.getItem(`ipfs_${hash}`);
    if (localData) {
      return JSON.parse(localData);
    }
    throw error;
  }
};

export const uploadEncryptedToIPFS = async (data, encryptionKey) => {
  const encryptedData = await encryptData(JSON.stringify(data), encryptionKey);
  return await uploadToIPFS(encryptedData);
};

export const getDecryptedFromIPFS = async (hash, encryptionKey) => {
  const encryptedData = await getFromIPFS(hash);
  const decryptedString = await decryptData(encryptedData, encryptionKey);
  return JSON.parse(decryptedString);
};

const encryptData = async (data, key) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const cryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 250000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBuffer
  );

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedBuffer))
  };
};

const decryptData = async (encryptedData, key) => {
  const encoder = new TextEncoder();
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const cryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(encryptedData.salt),
      iterations: 250000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
    cryptoKey,
    new Uint8Array(encryptedData.data)
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
