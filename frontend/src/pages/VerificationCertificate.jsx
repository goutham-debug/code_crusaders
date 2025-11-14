import { useLocation } from "react-router-dom";
import FileCard from "../components/FileCard";

export default function VerificationCertificate() {
  const location = useLocation();
  const { did } = location.state || {};

  const files = [
    { cid: "Qm123", name: "Certificate A" },
    { cid: "Qm456", name: "Certificate B" },
  ];

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center text-orange-500 mb-6">
        Verification Certificates
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {files.map(file => (
          <FileCard key={file.cid} file={file} viewerDid={did} />
        ))}
      </div>
    </div>
  );
}