import { useState } from "react";
import { motion } from "framer-motion";

export default function GrantAccessModal({ cid, onClose }) {
  const [viewerDid, setViewerDid] = useState("");
  const [msg, setMsg] = useState("");

  const grantAccess = async () => {
    try {
      const res = await fetch("/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid, granterDid: "ownerDidExample", viewerDid }),
      });
      const data = await res.json();
      setMsg(data.message || data.error);
    } catch (error) {
      setMsg("Something went wrong!");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="text-xl font-bold text-orange-500 mb-4">Grant Access</h3>

        <div className="form-row">
          <label>Viewer DID</label>
          <input
            type="text"
            placeholder="Enter viewer DID"
            value={viewerDid}
            onChange={(e) => setViewerDid(e.target.value)}
            className="input"
          />
        </div>

        <button
          onClick={grantAccess}
          className="primary w-full mb-3"
        >
          Grant Access
        </button>

        {msg && (
          <p className="small text-center text-gray-600 mb-3">{msg}</p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}