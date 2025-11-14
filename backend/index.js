// index.js — top of file (single copy)
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// create app once
const app = express();
app.use(bodyParser.json({ limit: '30mb' }));
app.use(cors());

// --- IPFS client (example: Infura or local fallback) ---
let ipfs;
if (process.env.INFURA_PROJECT_ID && process.env.INFURA_API_SECRET) {
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: 'Basic ' + Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_API_SECRET).toString('base64')
    }
  });
} else {
  ipfs = create(); // local node
}

// --- ethers / provider / issuer wallet (example) ---
const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC || "http://127.0.0.1:7545");
const issuerPrivateKey = process.env.ISSUER_PRIVATE_KEY || '0x5b6fdefee469a122abb623240352b1dd3f7918e949b426512bede34049f29a63';
const issuerWallet = new ethers.Wallet(issuerPrivateKey, provider);

// now your /issue-vc route (paste your route here)
app.post('/issue-vc', async (req, res) => {
  try {
    console.log('>>> /issue-vc called', { time: new Date().toISOString() });
    console.log('Body preview:', {
      subjectDid: req.body.subjectDid?.slice?.(0,80) ?? req.body.subjectDid,
      fileName: req.body.fileName ?? null,
      hasFileBase64: !!req.body.fileBase64
    });

    const { subjectDid, subjectData, fileBase64, fileName, issuer } = req.body;
    if (!subjectDid || !subjectData) {
      console.warn('issue-vc: missing required fields');
      return res.status(400).send({ error: 'subjectDid and subjectData required' });
    }

    let fileCid = '';
    if (fileBase64 && fileName) {
      console.log('Uploading attachment to IPFS...');
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const result = await ipfs.add({ path: fileName, content: buffer });
        fileCid = result.cid.toString();
        console.log('IPFS add result:', fileCid);
      } catch (ipfsErr) {
        console.error('IPFS upload failed:', ipfsErr && ipfsErr.message ? ipfsErr.message : ipfsErr);
        return res.status(500).send({ error: 'IPFS upload failed', details: ipfsErr.message || ipfsErr });
      }
    }

    const credentialId = "urn:uuid:" + uuidv4();
    const issuanceDate = new Date().toISOString();
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      id: credentialId,
      type: ["VerifiableCredential", "IdentityCredential"],
      issuer: issuer || (issuerWallet && issuerWallet.address) || 'unknown',
      issuanceDate,
      credentialSubject: {
        id: subjectDid,
        data: subjectData,
        attachmentCid: fileCid
      }
    };

    const vcString = JSON.stringify(vc);
    console.log('Signing VC string length:', vcString.length);
    if (!issuerWallet) {
      console.error('No issuerWallet available in backend');
      return res.status(500).send({ error: 'issuer wallet not configured on backend' });
    }

    let signature;
    try {
      signature = await issuerWallet.signMessage(ethers.toUtf8Bytes(vcString));
    } catch (signErr) {
      console.error('Signing failed:', signErr && signErr.message ? signErr.message : signErr);
      return res.status(500).send({ error: 'Signing VC failed', details: signErr.message || signErr });
    }

    const signedVC = { vc, signature };
    console.log('VC issued successfully:', credentialId);
    res.send({ signedVC, fileCid, credentialId });
  } catch (e) {
    console.error('issue-vc fatal error:', e && e.stack ? e.stack : e);
    res.status(500).send({ error: 'internal error', message: e.message || String(e) });
  }
});

// start server at bottom of file
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`CredenX backend running on ${PORT}`);
});
