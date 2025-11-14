import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function DIDCreation() {
  const [did, setDid] = useState("");
  const navigate = useNavigate();

  const createDID = async () => {
    // Call backend API to generate DID
    const response = await fetch("/create-did", { method: "POST" });
    const data = await response.json();
    setDid(data.did);

    // After a short delay, navigate to Verification page
    setTimeout(() => navigate("/verification", { state: { did: data.did } }), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="card w-full max-w-md p-8"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Create Your DID</h2>
        <button
          className="primary w-full mb-4"
          onClick={createDID}
        >
          Generate DID
        </button>

        {did && (
          <motion.div
            className="p-4 bg-gray-100 rounded-lg text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="small">Your DID:</p>
            <p className="font-semibold break-all text-orange-600">{did}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}