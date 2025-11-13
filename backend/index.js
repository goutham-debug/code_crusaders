import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Setup IPFS client via Infura (or local)
let ipfs;
if (process.env.INFURA_PROJECT_ID) {
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

// Ethers + contract ABI (minimal)
const DIDRegistryAbi = [
  "function registerDID(string did, string ipfsCid, string controller) external",
  "function updateDID(string did, string ipfsCid, string controller) external",
  "function getDID(string did) view returns (address owner, string ipfsCid, string controller, bool exists)",
  "function revokeCredential(string credentialId) external",
  "function isRevoked(string credentialId) view returns (bool)"
];

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC || "http://127.0.0.1:7545");
const issuerWallet = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY || "0x5b6fdefee469a122abb623240352b1dd3f7918e949b426512bede34049f29a63", provider);
let contract;
if (process.env.CONTRACT_ADDRESS) {
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, DIDRegistryAbi, issuerWallet);
}
async function testGanache() {
  try {
    const network = await provider.getNetwork();
    const accounts = await provider.listAccounts();
    console.log("Connected to Ganache blockchain");
    console.log(`   Network chainId: ${network.chainId}`);
    if (accounts.length > 0) {
      console.log(`   First account: ${accounts[0].address}`);
    } else {
      console.log("   No accounts found.");
    }
  } catch (err) {
    console.error("Failed to connect to Ganache:", err.message);
  }
}

testGanache();

app.get('/', (req, res) => res.send({ status: 'CredenX backend running' }));

// Issue a VC: accept ownerDid, subject data, fileBase64 optional
app.post('/issue-vc', async (req, res) => {
  try {
    const { subjectDid, subjectData, fileBase64, fileName, issuer } = req.body;
    if (!subjectDid || !subjectData) return res.status(400).send({ error: 'subjectDid and subjectData required' });

    let fileCid = '';
    if (fileBase64 && fileName) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const result = await ipfs.add({ path: fileName, content: buffer });
      fileCid = result.cid.toString();
    }

    const credentialId = "urn:uuid:" + uuidv4();
    const issuanceDate = new Date().toISOString();
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      id: credentialId,
      type: ["VerifiableCredential", "IdentityCredential"],
      issuer: issuer || (issuerWallet.address),
      issuanceDate,
      credentialSubject: {
        id: subjectDid,
        data: subjectData,
        attachmentCid: fileCid
      }
    };

    const vcString = JSON.stringify(vc);
    const signature = await issuerWallet.signMessage(ethers.toUtf8Bytes(vcString));
    const signedVC = { vc, signature };

    res.send({ signedVC, fileCid, credentialId });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

app.post('/verify-vc', async (req, res) => {
  try {
    const { signedVC } = req.body;
    if (!signedVC) return res.status(400).send({ error: 'signedVC required' });
    const vcString = JSON.stringify(signedVC.vc);
    const signerAddress = ethers.verifyMessage(ethers.toUtf8Bytes(vcString), signedVC.signature);
    res.send({ valid: true, signer: signerAddress });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`CredenX backend running on ${PORT}`));
