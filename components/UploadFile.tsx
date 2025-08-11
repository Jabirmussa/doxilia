
import FeatherIcon from "./FeatherIcon"

export default function UploadFile() {
  return (
    <div className="upload-screen">
        <div className="rectangle">
        </div>
        <div className="upload-content">
            <FeatherIcon name="upload" className="icon-svg" />
            <p>Drop to upload</p>
        </div>
    </div>
  )
}
