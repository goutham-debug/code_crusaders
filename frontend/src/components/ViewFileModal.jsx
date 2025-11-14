import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ViewFileModal({ cid, viewerDid, onClose }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fetch(`/view-data/${cid}?viewerDid=${encodeURIComponent(viewerDid)}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setContent(data.data);
      } catch (err) {
        setError("Failed to fetch file content.");
      }
    };
    fetchFile();
  }, [cid, viewerDid]);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="text-xl font-bold text-orange-500 mb-4">File Content</h3>

        {error && <p className="small text-red-500 mb-3">{error}</p>}

        {content && (
          <pre className="bg-gray-100 p-3 rounded-lg text-sm mb-3 break-words">
            {content}
          </pre>
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