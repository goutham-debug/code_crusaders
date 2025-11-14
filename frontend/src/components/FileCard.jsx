import { useState } from "react";
import GrantAccessModal from "./GrantAccessModal";
import ViewFileModal from "./ViewFileModal";
import { motion } from "framer-motion";

export default function FileCard({ file, viewerDid }) {
  const [showGrant, setShowGrant] = useState(false);
  const [showView, setShowView] = useState(false);

  return (
    <motion.div
      className="card flex flex-col justify-between"
      whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
    >
      <h2 className="font-bold text-lg">{file.name}</h2>
      <p className="small break-all">{file.cid}</p>
      <div className="mt-4 flex gap-2">
        <button className="primary flex-1" onClick={() => setShowGrant(true)}>Grant Access</button>
        <button className="primary flex-1" onClick={() => setShowView(true)}>View File</button>
      </div>

      {showGrant && <GrantAccessModal cid={file.cid} onClose={() => setShowGrant(false)} />}
      {showView && <ViewFileModal cid={file.cid} viewerDid={viewerDid} onClose={() => setShowView(false)} />}
    </motion.div>
  );
}