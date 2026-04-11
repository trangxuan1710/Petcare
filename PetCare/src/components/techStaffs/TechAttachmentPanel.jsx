import React from 'react';
import { Camera, MinusCircle, Upload } from 'lucide-react';
import './TechAttachmentPanel.css';

const TechAttachmentPanel = ({ images, files }) => {
    return (
        <section className="tech-attach-panel">
            <div className="tech-attach-header">
                <h3>File và ảnh tải lên</h3>
            </div>

            <div className="tech-image-grid">
                {images.map((image, index) => (
                    <article key={index} className="tech-image-card">
                        <div className="tech-image-top">
                            <strong>Anh ket qua {index + 1}</strong>
                            <MinusCircle size={16} color="#ef4444" />
                        </div>
                        {image ? (
                            <img src={image} alt={`Ket qua ${index + 1}`} className="tech-image-preview" />
                        ) : (
                            <div className="tech-image-placeholder">
                                <Camera size={22} color="#94a3b8" />
                            </div>
                        )}
                    </article>
                ))}
            </div>

            <button type="button" className="tech-upload-action">
                <Upload size={18} />
                <span>Tai len file ket qua kham benh</span>
            </button>

            <div className="tech-upload-files">
                {files.map((file, idx) => (
                    <div key={idx} className="tech-upload-file-row">
                        <span>{file}</span>
                        <MinusCircle size={16} color="#ef4444" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TechAttachmentPanel;
