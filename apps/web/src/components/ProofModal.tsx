'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Link as LinkIcon, Image as ImageIcon, Video, ShieldCheck, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (proofData: { screenshotUrl: string; videoUrl: string; notes?: string }) => void;
  taskTitle: string;
}

export default function ProofModal({ isOpen, onClose, onConfirm, taskTitle }: ProofModalProps) {
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('task-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('task-images').getPublicUrl(filePath);
      setScreenshotUrl(publicUrl);
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(`TACTICAL UPLOAD FAILED: ${error.message || 'Verification signal lost.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      alert('CRITICAL: Screenshot evidence missing.');
      return;
    }
    onConfirm({ screenshotUrl, videoUrl, notes });
    setScreenshotUrl('');
    setVideoUrl('');
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 40 }} 
            className="relative w-full max-w-lg bg-[#0a0a0f] border border-[#00f2ff]/20 rounded-3xl shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#00f2ff]/10 via-transparent to-transparent">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#00f2ff]/10 rounded-2xl border border-[#00f2ff]/20">
                  <ShieldCheck className="text-[#00f2ff]" size={28} />
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">MISSION VERIFICATION</h3>
              <p className="text-[10px] text-[#00f2ff] font-mono font-bold uppercase tracking-[0.2em]">Mandate: {taskTitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <p className="text-xs text-slate-400 leading-relaxed">
                Strategic completion requires visual evidence. Upload a screenshot and provide a video link to synchronize this mission as secured.
              </p>

              <div className="space-y-4">
                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <ImageIcon size={14} className="text-[#00f2ff]" />
                    <span>SCREENSHOT EVIDENCE</span>
                  </label>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    ref={fileInputRef}
                  />

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${screenshotUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5 hover:border-[#00f2ff]/50'}`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="text-[#00f2ff] animate-spin" size={24} />
                        <span className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-widest">Uploading...</span>
                      </div>
                    ) : screenshotUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={screenshotUrl} className="w-full h-full object-cover opacity-30" alt="Preview" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <CheckCircle2 className="text-green-500 mb-2" size={24} />
                          <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">Evidence Secured</span>
                          <span className="text-[8px] text-slate-500 uppercase mt-1">Click to replace</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="text-slate-600" size={24} />
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Click to Scan Screenshot</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Link */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <Video size={14} className="text-purple-500" />
                    <span>VIDEO PROOF (LINK)</span>
                  </label>
                  <div className="relative group">
                    <input 
                      type="url" 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                      placeholder="https://loom.com/..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white text-xs focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700 font-mono" 
                      required
                    />
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" size={16} />
                  </div>
                </div>

                {/* Optional Notes */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>MISSION NOTES (OPTIONAL)</span>
                  </label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Provide additional mission intel or context..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 resize-none" 
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={uploading || !screenshotUrl}
                  className={`w-full py-4 font-black text-xs tracking-[0.2em] uppercase rounded-xl transition-all flex items-center justify-center space-x-3 group ${uploading || !screenshotUrl ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:from-[#00f2ff] hover:to-[#00f2ff] text-black shadow-[0_10px_30px_rgba(0,242,255,0.2)]'}`}
                >
                  <CheckCircle2 size={18} className={uploading || !screenshotUrl ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span>{uploading ? 'UPLOADING...' : 'SUBMIT INTEL & COMPLETE'}</span>
                </button>
              </div>

              <p className="text-[9px] text-center text-slate-600 font-mono uppercase tracking-widest">
                Verification data will be stored in the permanent mission log.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
