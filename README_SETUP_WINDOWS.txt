CredenX - Hackathon MVP
=======================

You're running on Windows. Follow these steps exactly to demo locally.

Prerequisites
-------------
1. Install Node.js (LTS 18+): https://nodejs.org/
2. Install Git (optional): https://git-scm.com/
3. Install Ganache GUI: https://trufflesuite.com/ganache/
4. Install MetaMask browser extension in Chrome/Edge/Brave.

Project structure (after unzip)
- credenx/
  - contracts/
  - migrations/
  - truffle-config.js
  - backend/
  - frontend/
  - README_SETUP_WINDOWS.txt

Quickstart (step by step)
------------------------

1) Open Ganache GUI and click "Quickstart Ethereum".
   - Default RPC: http://127.0.0.1:7545
   - Note the accounts and private keys (you'll import one into MetaMask).

2) Install Truffle (global):
   Open Windows PowerShell or cmd as normal user (not admin):
     npm install -g truffle

3) Compile & deploy smart contract:
   In PowerShell:
     cd path\to\credenx
     truffle compile
     truffle migrate --network development

   Copy the deployed contract address printed by Truffle (you will paste it below).

4) Configure backend:
   - Open credenx\backend\.env.example and create a copy named .env
   - Fill INFURA_PROJECT_ID and INFURA_API_SECRET from Infura (create a free Infura account).
   - Set ISSUER_PRIVATE_KEY to one of Ganache account private keys (for demo only).
   - Set CONTRACT_ADDRESS to the address from the Truffle migration.
   Example .env:
     INFURA_PROJECT_ID=abcd1234
     INFURA_API_SECRET=...secret...
     ISSUER_PRIVATE_KEY=0x0123...
     GANACHE_RPC=http://127.0.0.1:7545
     CONTRACT_ADDRESS=0x....

   Then:
     cd backend
     npm install
     npm start
   Backend will run at http://localhost:4000

5) Configure frontend:
   - Open credenx\frontend\.env.example and create a copy named .env with:
     REACT_APP_CONTRACT_ADDRESS=0xPASTE_CONTRACT_ADDRESS_HERE
     REACT_APP_BACKEND=http://localhost:4000

     cd frontend
     npm install
     npm start

   Frontend will open at http://localhost:3000

6) Connect MetaMask to Ganache:
   - In MetaMask, click network dropdown -> Add Network:
     Network Name: Localhost 7545
     RPC URL: http://127.0.0.1:7545
     Chain ID: 1337
   - Import an account: click account icon -> Import account -> paste one of Ganache private keys.
   - On the frontend, click "Connect MetaMask" and accept.

Demo flow (what to show judges)
--------------------------------
1. Connect MetaMask.
2. Register DID: Click "Register DID on Chain" (sign the transaction in MetaMask).
3. Issue a credential: paste a small JSON in Credential Subject Data (e.g., {"name":"Aishwarya","role":"Participant"}), optionally attach a file, and click "Request Issuance".
4. Backend will return a signed VC; click "Verify" to show the issuer address matched the backend's issuer.
5. (Optional) Open IPFS attachment link to show uploaded file via ipfs.io gateway.

Notes / Troubleshooting
-----------------------
- If Truffle migrate fails, ensure Ganache is running and using port 7545.
- If frontend cannot connect to backend, ensure backend is running and check CORS.
- If IPFS uploads fail, confirm INFURA credentials or run a local IPFS node and remove Infura config.

Good luck — demo confidently. CredenX is intentionally minimal, visually polished, and shows judges both UI and blockchain competence.
