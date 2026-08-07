import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Image as ImageIcon, Upload, RefreshCw, Link } from 'lucide-react';
import { toast } from 'sonner';

export default function PanelImagesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState({ external_image_url: '', internal_image_url: '' });

  const [externalFile, setExternalFile] = useState(null);
  const [internalFile, setInternalFile] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'public_settings', 'panel_images'));
      if (snap.exists()) {
        setImages({
          external_image_url: snap.data().external_image_url || '',
          internal_image_url: snap.data().internal_image_url || ''
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load panel images');
    }
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleUploadAndSave = async () => {
    setSaving(true);
    try {
      let extUrl = images.external_image_url;
      let intUrl = images.internal_image_url;

      // Handle External File Upload
      if (externalFile) {
        const extRef = ref(storage, `panel_images/external_${Date.now()}_${externalFile.name}`);
        await uploadBytes(extRef, externalFile);
        extUrl = await getDownloadURL(extRef);
      }

      // Handle Internal File Upload
      if (internalFile) {
        const intRef = ref(storage, `panel_images/internal_${Date.now()}_${internalFile.name}`);
        await uploadBytes(intRef, internalFile);
        intUrl = await getDownloadURL(intRef);
      }

      // Save to Firestore
      await setDoc(doc(db, 'public_settings', 'panel_images'), {
        external_image_url: extUrl,
        internal_image_url: intUrl,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setImages({ external_image_url: extUrl, internal_image_url: intUrl });
      setExternalFile(null);
      setInternalFile(null);
      toast.success('Panel images updated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update panel images');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5" style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron font-bold text-lg text-primary tracking-wider flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> PANEL IMAGES
          </h3>
          <button onClick={loadSettings} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* EXTERNAL PANEL CONFIG */}
          <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.05)' }}>
            <h4 className="font-orbitron font-bold text-sm tracking-widest text-white">EXTERNAL PANEL IMAGE</h4>
            
            {/* Current Image Preview */}
            <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center" 
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(0,212,255,0.2)' }}>
              {(externalFile || images.external_image_url) ? (
                <img 
                  src={externalFile ? URL.createObjectURL(externalFile) : images.external_image_url} 
                  className="w-full h-full object-contain" 
                  alt="External Preview" 
                />
              ) : (
                <span className="text-muted-foreground text-xs font-inter">No image set</span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Link className="w-3.5 h-3.5"/> Direct URL</label>
                <input 
                  type="text" 
                  value={images.external_image_url} 
                  onChange={e => setImages({...images, external_image_url: e.target.value})}
                  disabled={!!externalFile}
                  placeholder="https://example.com/image.png"
                  className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="text-center text-xs text-muted-foreground">OR</div>
              <div>
                <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Upload className="w-3.5 h-3.5"/> Upload File</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setExternalFile(e.target.files[0])}
                  className="w-full font-inter text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* INTERNAL PANEL CONFIG */}
          <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(170,68,255,0.05)' }}>
            <h4 className="font-orbitron font-bold text-sm tracking-widest text-white">INTERNAL PANEL IMAGE</h4>
            
            {/* Current Image Preview */}
            <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center" 
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(170,68,255,0.2)' }}>
              {(internalFile || images.internal_image_url) ? (
                <img 
                  src={internalFile ? URL.createObjectURL(internalFile) : images.internal_image_url} 
                  className="w-full h-full object-contain" 
                  alt="Internal Preview" 
                />
              ) : (
                <span className="text-muted-foreground text-xs font-inter">No image set</span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Link className="w-3.5 h-3.5"/> Direct URL</label>
                <input 
                  type="text" 
                  value={images.internal_image_url} 
                  onChange={e => setImages({...images, internal_image_url: e.target.value})}
                  disabled={!!internalFile}
                  placeholder="https://example.com/image.png"
                  className="w-full px-3 py-2 rounded-lg font-inter text-sm outline-none transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="text-center text-xs text-muted-foreground">OR</div>
              <div>
                <label className="text-xs text-muted-foreground font-inter flex items-center gap-1.5 mb-1.5"><Upload className="w-3.5 h-3.5"/> Upload File</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setInternalFile(e.target.files[0])}
                  className="w-full font-inter text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUploadAndSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
          >
            {saving && <div className="w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />}
            SAVE CHANGES
          </button>
        </div>

      </div>
    </div>
  );
}
