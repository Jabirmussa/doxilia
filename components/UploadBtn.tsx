import FeatherIcon from '@/components/FeatherIcon';
import "./AllFiles.css";
import { useDashboard } from '@/src/app/contexts/DashboardContext';

export default function UploadBtn() {
  const { setActiveScreen } = useDashboard();

  return (
    <button
      className="upload-btn"
      onClick={() => setActiveScreen("add-document")}
    >
      <span>Upload file</span>
      <div className="upload-icon">
        <FeatherIcon name="plus" className="icon-svg" />
      </div>
    </button>
  );
}
