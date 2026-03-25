import { useEffect, useState, useRef, type Key, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import Lenis from '@studio-freight/lenis';
import { Menu, MapPin, Train, GraduationCap, Trees, ShoppingBag, Maximize, Layout, Package, Sun, CheckCircle, Calendar, Building2, Edit2, Save, X, Upload } from 'lucide-react';
import { cn } from './lib/utils';

// --- Editable Components ---

const EditableText = ({ id, content, setContent, isEditing, className, tag: Tag = 'div' }: any) => {
  const handleBlur = (e: any) => {
    setContent((prev: any) => ({ ...prev, [id]: e.target.innerText }));
  };

  const value = content[id] || (isEditing ? `[${id}]` : "");

  return (
    <Tag
      className={cn(className, isEditing && "outline-dashed outline-1 outline-[var(--c-accent)]/50 cursor-text bg-[var(--c-accent)]/5")}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
    >
      {value}
    </Tag>
  );
};

const EditableImage = ({ id, content, setContent, isEditing, className, alt, onUpdate, initialScale, objectFit = "object-cover" }: any) => {
  const [showInput, setShowInput] = useState(false);
  const initialUrl = id ? content[id] : content;
  const [tempUrl, setTempUrl] = useState(initialUrl);
  const [scale, setScale] = useState(() => {
    if (id) return content[`${id}_scale`] || 100;
    return initialScale || 100;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempUrl(id ? content[id] : content);
    if (id) {
      setScale(content[`${id}_scale`] || 100);
    } else if (initialScale !== undefined) {
      setScale(initialScale);
    }
  }, [content, id, initialScale]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(tempUrl, scale);
    } else {
      setContent((prev: any) => ({ 
        ...prev, 
        [id]: tempUrl,
        [`${id}_scale`]: scale 
      }));
    }
    setShowInput(false);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          // Resize/Compress logic using Canvas
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress as JPEG with 0.7 quality to save space in localStorage
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setTempUrl(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const currentUrl = id ? content[id] : content;
  const currentScale = id ? (content[`${id}_scale`] || 100) : (onUpdate ? scale : 100);

  return (
    <div className={cn("relative group overflow-hidden", className, isEditing && "z-20")}>
      <img
        src={currentUrl}
        style={{ transform: `scale(${currentScale / 100})`, transformOrigin: 'center' }}
        className={cn("w-full h-full transition-all", objectFit, isEditing && "outline-dashed outline-2 outline-[var(--c-accent)]/50 cursor-pointer group-hover:opacity-75")}
        alt={alt}
        onClick={() => isEditing && setShowInput(true)}
        referrerPolicy="no-referrer"
      />
      
      {isEditing && !showInput && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          <div className="bg-[var(--c-accent)] text-white p-2 rounded-full shadow-lg">
            <Edit2 size={16} />
          </div>
        </div>
      )}

      {isEditing && showInput && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowInput(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-black">이미지 수정</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">파일 업로드 (자동 압축 적용)</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[var(--c-accent)]/50 hover:bg-[var(--c-surface)] transition-all text-gray-400 hover:text-[var(--c-accent)]"
                >
                  <Upload size={24} />
                  <span className="text-sm font-medium">내 컴퓨터에서 사진 선택</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">사진 크기 조절 (확대/축소)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="50" 
                    max="200" 
                    value={scale} 
                    onChange={e => setScale(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--c-accent)]"
                  />
                  <span className="text-sm font-mono font-bold text-[var(--c-accent)] w-12">{scale}%</span>
                </div>
              </div>

              <div className="relative py-2 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-300 uppercase">OR</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">이미지 URL 주소</label>
                <input 
                  type="text" 
                  value={(tempUrl || "").startsWith('data:') ? '' : (tempUrl || "")} 
                  onChange={e => setTempUrl(e.target.value)}
                  className="w-full p-3 border border-gray-100 rounded-xl text-sm text-black focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)]"
                  placeholder="https://images.unsplash.com/..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowInput(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold bg-[var(--c-dark)] text-white rounded-lg hover:bg-[var(--c-accent)] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Components ---

const Loader = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 bg-[var(--c-dark)] z-[10000] flex flex-col justify-center items-center text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-display text-[4vw] font-semibold tracking-tighter"
      >
        HILLSTATE
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 h-1 bg-[var(--c-accent)]"
      />
    </motion.div>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
      <div className="font-display font-bold text-2xl tracking-tighter italic">HILLSTATE</div>
      <div className="flex items-center gap-8">
        <a href="tel:1600-6769" className="font-display font-medium text-xl md:text-2xl tracking-tighter hover:text-[var(--c-accent)] transition-colors">
          1600-6769
        </a>
      </div>
    </nav>
  );
};

const Hero = ({ content, setContent, isEditing }: any) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[var(--c-dark)]">
      <motion.div 
        style={{ y }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <EditableImage 
          id="heroImg"
          content={content}
          setContent={setContent}
          isEditing={isEditing}
          className="w-full h-full object-cover opacity-60"
          alt="Hero Background"
        />
      </motion.div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--c-dark)]/60 via-transparent to-[var(--c-dark)]/60" />
      
      <motion.div 
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-white px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="w-12 h-px bg-[var(--c-accent)] mx-auto mb-8" />
          <div className="text-xs uppercase tracking-[0.6em] font-bold opacity-70">The Art of Living</div>
        </motion.div>
        
        <h1 className="text-5xl md:text-[8vw] font-display font-light leading-[0.9] tracking-tighter mb-12 italic">
          HILLSTATE
        </h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="text-xs uppercase tracking-[0.4em] opacity-40 font-bold">Scroll to Explore</div>
          <div className="w-px h-16 bg-gradient-to-b from-[var(--c-accent)] to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

const Intro = ({ content, setContent, isEditing }: any) => {
  return (
    <section className="py-40 px-6 md:px-20 grid md:grid-cols-2 gap-24 max-w-[1800px] mx-auto bg-[var(--c-bg)]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-4xl md:text-6xl leading-[1.1] font-display font-light tracking-tight">
          <EditableText id="introTitle1" content={content} setContent={setContent} isEditing={isEditing} tag="span" className="block italic" />
          <EditableText id="introTitle2" content={content} setContent={setContent} isEditing={isEditing} tag="span" className="text-[var(--c-accent)] font-medium" />
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-lg md:text-xl font-light leading-relaxed text-[var(--c-dark)]/70 flex flex-col justify-end"
      >
        <EditableText id="introDesc" content={content} setContent={setContent} isEditing={isEditing} tag="p" className="mb-12 max-w-lg" />
        <div className="h-px w-24 bg-[var(--c-accent)] mb-12" />
        <div className="flex gap-12 text-xs uppercase tracking-[0.3em] font-bold text-[var(--c-dark)]/30">
          <EditableText id="introMeta1" content={content} setContent={setContent} isEditing={isEditing} tag="div" />
          <EditableText id="introMeta2" content={content} setContent={setContent} isEditing={isEditing} tag="div" />
        </div>
      </motion.div>
    </section>
  );
};

const Location = ({ content, setContent, isEditing }: any) => {
  const points = [
    { icon: <Train size={20} strokeWidth={1.5} />, title: '교통', descId: 'locDesc1', timeId: 'locTime1' },
    { icon: <GraduationCap size={20} strokeWidth={1.5} />, title: '학군', descId: 'locDesc2', timeId: 'locTime2' },
    { icon: <Trees size={20} strokeWidth={1.5} />, title: '공원', descId: 'locDesc3', timeId: 'locTime3' },
    { icon: <ShoppingBag size={20} strokeWidth={1.5} />, title: '생활', descId: 'locDesc4', timeId: 'locTime4' },
  ];

  return (
    <section className="py-40 px-6 md:px-20 bg-[var(--c-bg)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-24 text-center">
          <div className="text-xs uppercase tracking-[0.4em] mb-6 opacity-40 font-bold">Location</div>
          <h2 className="text-5xl md:text-7xl font-display font-light tracking-tighter mb-8">
            <EditableText id="locTitle" content={content} setContent={setContent} isEditing={isEditing} tag="span" className="italic" />
          </h2>
          <EditableText id="locSubtitle" content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-xl text-[var(--c-dark)]/40 font-light italic max-w-2xl mx-auto" />
        </div>

        <div className="grid lg:grid-cols-[1fr_450px] gap-20 items-start">
          <div className="relative aspect-[16/10] bg-[var(--c-surface)] overflow-hidden rounded-3xl shadow-2xl border border-[var(--c-dark)]/5">
            <EditableImage 
              id="locImg"
              content={content}
              setContent={setContent}
              isEditing={isEditing}
              className="w-full h-full object-cover"
              alt="Location Map"
            />
          </div>

          <div className="grid gap-4">
            {points.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 border border-[var(--c-dark)]/5 rounded-2xl hover:border-[var(--c-accent)]/30 transition-all group bg-[var(--c-surface)] hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--c-accent)] border border-[var(--c-dark)]/5">
                    {p.icon}
                  </div>
                  <h4 className="font-display font-bold text-xl italic">{p.title}</h4>
                </div>
                <EditableText id={p.descId} content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-[var(--c-dark)]/50 text-base mb-3 font-light leading-relaxed" />
                <EditableText id={p.timeId} content={content} setContent={setContent} isEditing={isEditing} tag="div" className="text-[var(--c-accent)] font-bold text-xs uppercase tracking-[0.2em]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FloorPlans = ({ content, setContent, isEditing }: any) => {
  const [activeTab, setActiveTab] = useState('84B');
  
  const types = [
    '84A', '84B', '84E', '112A', '112B', '84C(테라스)',
    '84D(테라스)', '102A(테라스)', '102B(테라스)', '157A(테라스)', '157B(테라스)'
  ];

  return (
    <section className="py-40 px-4 md:px-20 bg-[var(--c-bg)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs uppercase tracking-[0.4em] mb-6 opacity-40 font-bold">Floor Plans</div>
          <h2 className="text-4xl md:text-6xl font-display font-light italic mb-8">세대안내</h2>
          <div className="w-12 h-px bg-[var(--c-accent)] mx-auto"></div>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 border border-[var(--c-dark)]/5 mb-12 rounded-xl overflow-hidden shadow-sm">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={cn(
                "py-5 px-2 text-xs md:text-sm border-r border-b border-[var(--c-dark)]/5 transition-all uppercase tracking-widest",
                activeTab === type ? "bg-[var(--c-dark)] text-white font-bold" : "bg-[var(--c-bg)] text-[var(--c-dark)]/40 hover:bg-[var(--c-surface)]"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="border border-[var(--c-dark)]/5 rounded-3xl overflow-hidden shadow-2xl bg-[var(--c-bg)]">
          {/* Top Summary Box */}
          <div className="grid md:grid-cols-[350px_1fr] border-b border-[var(--c-dark)]/5">
            <div className="bg-[var(--c-bg)] p-12 text-[var(--c-dark)] flex flex-col justify-center items-center md:items-start relative overflow-hidden border-r border-[var(--c-dark)]/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-accent)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="font-display font-light italic mb-6 relative z-10 text-[var(--c-accent)] w-full text-center md:text-left leading-tight">
                <EditableText 
                  id={`plan_${activeTab}_size`} 
                  content={content} 
                  setContent={setContent} 
                  isEditing={isEditing} 
                  tag="span" 
                  className="block text-3xl md:text-4xl"
                />
              </div>
              <div className="space-y-3 w-full relative z-10">
                <div className="flex items-center justify-between border border-[var(--c-dark)]/5 px-4 py-2 rounded-full text-xs uppercase tracking-wider">
                  <span className="font-bold opacity-50">Block 02</span>
                  <EditableText id={`plan_${activeTab}_b2_count`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-accent)]" />
                </div>
                <div className="flex items-center justify-between border border-[var(--c-dark)]/5 px-4 py-2 rounded-full text-xs uppercase tracking-wider">
                  <span className="font-bold opacity-50">Block 03</span>
                  <EditableText id={`plan_${activeTab}_b3_count`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-accent)]" />
                </div>
              </div>
            </div>

            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 bg-[var(--c-bg)]">
              {/* Block 2 Info */}
              <div className="space-y-6">
                <div className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--c-accent)] mb-4">Block 02 Details</div>
                <div className="space-y-4 text-sm text-[var(--c-dark)]/60">
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">전용면적</span>
                    <EditableText id={`plan_${activeTab}_b2_private`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">공급면적</span>
                    <EditableText id={`plan_${activeTab}_b2_supply`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">계약면적</span>
                    <EditableText id={`plan_${activeTab}_b2_contract`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                </div>
              </div>
              {/* Block 3 Info */}
              <div className="space-y-6">
                <div className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--c-accent)] mb-4">Block 03 Details</div>
                <div className="space-y-4 text-sm text-[var(--c-dark)]/60">
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">전용면적</span>
                    <EditableText id={`plan_${activeTab}_b3_private`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">공급면적</span>
                    <EditableText id={`plan_${activeTab}_b3_supply`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                  <div className="flex justify-between border-b border-[var(--c-dark)]/5 pb-2">
                    <span className="font-medium opacity-60">계약면적</span>
                    <EditableText id={`plan_${activeTab}_b3_contract`} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-bold text-[var(--c-dark)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Images Section */}
          <div className="p-12 bg-[var(--c-bg)]">
            <div className="text-center mb-12 text-[var(--c-dark)]/20 font-bold text-xs uppercase tracking-[0.5em]">Expanded Option</div>
            <div className="relative p-8 flex justify-center bg-[var(--c-bg)]">
              <EditableImage 
                id={`plan_${activeTab}_iso`}
                content={content}
                setContent={setContent}
                isEditing={isEditing}
                className="w-full h-auto max-w-4xl"
                objectFit="object-contain"
                alt="Floor Plan"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Benefits = ({ content, setContent, isEditing }: any) => {
  const benefits = [
    { titleId: 'benTitle1', descId: 'benDesc1', valId: 'benVal1' },
    { titleId: 'benTitle2', descId: 'benDesc2', valId: 'benVal2' },
    { titleId: 'benTitle3', descId: 'benDesc3', valId: 'benVal3' },
    { titleId: 'benTitle4', descId: 'benDesc4', valId: 'benVal4' },
  ];

  return (
    <section className="py-40 px-6 md:px-20 bg-[var(--c-dark)] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--c-accent)]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-24 text-center">
          <div className="text-xs uppercase tracking-[0.4em] mb-6 opacity-40 font-bold">Special Benefits</div>
          <h2 className="text-5xl md:text-7xl font-display font-light tracking-tighter mb-8 italic">
            <EditableText id="benMainTitle" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-10 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all group"
            >
              <div className="w-12 h-12 rounded-full border border-[var(--c-accent)]/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <CheckCircle className="text-[var(--c-accent)]" size={20} strokeWidth={1.5} />
              </div>
              <EditableText id={b.titleId} content={content} setContent={setContent} isEditing={isEditing} tag="h4" className="text-xl font-display font-bold mb-3 italic" />
              <EditableText id={b.descId} content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-[var(--c-bg)]/50 text-base mb-8 font-light leading-relaxed" />
              <div className="h-px w-12 bg-white/10 mb-8" />
              <EditableText id={b.valId} content={content} setContent={setContent} isEditing={isEditing} tag="div" className="text-4xl font-display font-light text-[var(--c-accent)] italic" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Scenario = ({ content, setContent, isEditing }: any) => {
  return (
    <section className="py-60 px-6 md:px-20 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-32 items-center mb-60">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-xs uppercase tracking-[0.4em] mb-8 opacity-40 font-bold">Scenario 01</div>
            <h3 className="text-4xl md:text-6xl font-display font-light leading-[1.1] mb-10 italic">
              <EditableText id="sceTitle1" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
            </h3>
            <EditableText id="sceDesc1" content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-[var(--c-dark)]/50 text-xl font-light leading-relaxed max-w-md" />
          </motion.div>
          
          <div className="relative group">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl"
            >
              <EditableImage 
                id="sceImg1"
                content={content}
                setContent={setContent}
                isEditing={isEditing}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Scenario 1"
              />
            </motion.div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[var(--c-accent)]/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-32 items-center">
          <div className="relative group lg:order-2">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl"
            >
              <EditableImage 
                id="sceImg2"
                content={content}
                setContent={setContent}
                isEditing={isEditing}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Scenario 2"
              />
            </motion.div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--c-accent)]/10 rounded-full blur-3xl -z-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:order-1"
          >
            <div className="text-xs uppercase tracking-[0.4em] mb-8 opacity-40 font-bold">Scenario 02</div>
            <h3 className="text-4xl md:text-6xl font-display font-light leading-[1.1] mb-10 italic">
              <EditableText id="sceTitle2" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
            </h3>
            <EditableText id="sceDesc2" content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-[var(--c-dark)]/50 text-xl font-light leading-relaxed max-w-md" />
          </motion.div>
        </div>

        <div className="mt-60 text-center">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-[var(--c-accent)] to-transparent mx-auto mb-16" />
          <h4 className="text-3xl md:text-5xl font-display font-light italic text-[var(--c-dark)]/20 tracking-tight">
            <EditableText id="sceQuote" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
          </h4>
        </div>
      </div>
    </section>
  );
};

const Trust = ({ content, setContent, isEditing }: any) => {
  const info = [
    { label: '사업명', valId: 'trustInfo1' },
    { label: '위치', valId: 'trustInfo2' },
    { label: '규모', valId: 'trustInfo3' },
    { label: '시공사', valId: 'trustInfo4' },
  ];

  const premiums = [
    { id: 1, titleId: 'premium1_title', descId: 'premium1_desc' },
    { id: 2, titleId: 'premium2_title', descId: 'premium2_desc' },
    { id: 3, titleId: 'premium3_title', descId: 'premium3_desc' },
    { id: 4, titleId: 'premium4_title', descId: 'premium4_desc' },
    { id: 5, titleId: 'premium5_title', descId: 'premium5_desc' },
    { id: 6, titleId: 'premium6_title', descId: 'premium6_desc' },
    { id: 7, titleId: 'premium7_title', descId: 'premium7_desc' },
  ];

  return (
    <section className="py-40 px-6 md:px-20 bg-[var(--c-surface)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-24">
          <EditableText id="premiumSubtitle" content={content} setContent={setContent} isEditing={isEditing} tag="div" className="text-xs uppercase tracking-[0.4em] mb-6 opacity-40 font-bold" />
          <h2 className="text-5xl md:text-7xl font-display font-light tracking-tighter mb-8 italic">
            <EditableText id="premiumMainTitle" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
          </h2>
          <div className="w-12 h-px bg-[var(--c-accent)] mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-20 items-start">
          <div className="lg:col-span-1 bg-white p-12 rounded-[2rem] shadow-2xl lg:sticky lg:top-32 border border-[var(--c-dark)]/5">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-full bg-[var(--c-surface)] flex items-center justify-center text-[var(--c-accent)] border border-[var(--c-dark)]/5">
                <Building2 size={18} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-display font-bold italic">사업 개요</h4>
            </div>
            <div className="space-y-8">
              {info.map((item, i) => (
                <div key={i} className="flex flex-col gap-2 border-b border-[var(--c-dark)]/5 pb-6 last:border-0">
                  <span className="text-xs uppercase tracking-widest text-[var(--c-dark)]/30 font-bold">{item.label}</span>
                  <EditableText id={item.valId} content={content} setContent={setContent} isEditing={isEditing} tag="span" className="font-medium text-sm text-[var(--c-dark)]" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {premiums.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm flex items-center gap-10 group hover:shadow-2xl transition-all border border-transparent hover:border-[var(--c-accent)]/20"
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-full border border-[var(--c-accent)]/20 flex flex-col items-center justify-center text-[var(--c-accent)] group-hover:bg-[var(--c-accent)] group-hover:text-white transition-all duration-500">
                  <span className="text-xs font-bold leading-none tracking-widest">PREMIUM</span>
                  <span className="text-2xl font-display font-light italic leading-none mt-1">{String(p.id).padStart(2, '0')}</span>
                </div>
                <div>
                  <EditableText id={p.titleId} content={content} setContent={setContent} isEditing={isEditing} tag="h4" className="text-xl md:text-2xl font-display font-bold mb-2 italic" />
                  <EditableText id={p.descId} content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-[var(--c-dark)]/50 text-sm md:text-base font-light leading-relaxed" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  key?: Key;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const Card = ({ number, title, subtitle, description, image, scale, isEditing, onUpdate }: any) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });

  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div ref={container} className="card-item sticky top-[10vh] h-[80vh] w-full flex items-center justify-center mb-[5vh]">
      <motion.div 
        style={{ scale: scrollScale }}
        className="w-[95%] h-full bg-[var(--c-dark)] border border-white/5 relative overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1.2fr] shadow-2xl rounded-[3rem]"
      >
        <div className="p-12 md:p-20 flex flex-col justify-between bg-[var(--c-dark)] z-10">
          <div>
            <div className="font-display text-5xl md:text-6xl mb-6 text-white/10 italic">{number}</div>
            <h3 
              className={cn("text-3xl md:text-4xl font-display font-bold tracking-tight text-white p-1 rounded italic", isEditing && "outline-dashed outline-1 outline-[var(--c-accent)]/50 bg-[var(--c-accent)]/5")}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('title', e.target.innerText)}
            >
              {title}
            </h3>
            <p 
              className={cn("text-xs mt-6 text-[var(--c-accent)] uppercase tracking-[0.4em] font-bold p-1 rounded", isEditing && "outline-dashed outline-1 outline-[var(--c-accent)]/50 bg-[var(--c-accent)]/5")}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('subtitle', e.target.innerText)}
            >
              {subtitle}
            </p>
          </div>
          <div 
            className={cn("text-white/50 font-light text-base md:text-lg leading-relaxed p-1 rounded max-w-md", isEditing && "outline-dashed outline-1 outline-[var(--c-accent)]/50 bg-[var(--c-accent)]/5")}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate('description', e.target.innerText)}
          >
            {description}
          </div>
          <button className="group flex items-center gap-4 text-left uppercase tracking-[0.3em] text-xs font-bold text-white/40 hover:text-[var(--c-accent)] transition-all">
            <span className="w-8 h-px bg-white/20 group-hover:w-12 group-hover:bg-[var(--c-accent)] transition-all" />
            VIEW DETAILS
          </button>
        </div>
        <div className="relative w-full h-full overflow-hidden order-first md:order-last">
          <EditableImage 
            content={image} 
            initialScale={scale}
            isEditing={isEditing}
            onUpdate={(val: string, newScale: number) => {
              onUpdate('image', val);
              onUpdate('scale', newScale);
            }}
            className="w-full h-full opacity-80"
            alt={title}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--c-dark)] via-transparent to-transparent hidden md:block" />
        </div>
      </motion.div>
    </div>
  );
};

const CardStack = ({ content, setContent, isEditing }: any) => {
  const updateCard = (index: number, key: string, value: any) => {
    const newCards = [...content.cards];
    newCards[index] = { ...newCards[index], [key]: value };
    setContent((prev: any) => ({ ...prev, cards: newCards }));
  };

  return (
    <section className="stack-section py-40 bg-[var(--c-dark)]">
      <div className="text-center mb-32 px-6">
        <div className="text-xs uppercase tracking-[0.6em] mb-8 opacity-40 font-bold text-white">The Collection</div>
        <h2 className="font-display text-5xl md:text-8xl tracking-tighter italic text-white font-light">
          <EditableText id="cardMainTitle" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
        </h2>
        <div className="w-12 h-px bg-[var(--c-accent)] mx-auto mt-12" />
      </div>
      <div className="w-full max-w-[1600px] mx-auto relative pb-[10vh]">
        {content.cards.map((card: any, i: number) => (
          <Card 
            key={i} 
            number={card.number}
            title={card.title}
            subtitle={card.subtitle}
            description={card.description}
            image={card.image}
            scale={card.scale || 100}
            isEditing={isEditing}
            onUpdate={(key: string, val: any) => updateCard(i, key, val)}
          />
        ))}
      </div>
    </section>
  );
};

const Final = ({ content, setContent, isEditing }: any) => {
  return (
    <section className="py-60 px-6 md:px-20 bg-[var(--c-bg)] text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-xs uppercase tracking-[0.6em] mb-12 opacity-40 font-bold">The Final Chapter</div>
        <h2 className="text-5xl md:text-8xl font-display font-light tracking-tighter mb-12 italic leading-[0.9]">
          <EditableText id="finalTitle" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
        </h2>
        <EditableText id="finalDesc" content={content} setContent={setContent} isEditing={isEditing} tag="p" className="text-xl text-[var(--c-dark)]/50 font-light mb-16 max-w-2xl mx-auto leading-relaxed" />
        
        <motion.a
          href="https://naver.me/xtNFTryO"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-12 md:px-20 py-6 md:py-10 bg-[var(--c-dark)] text-white text-lg md:text-2xl uppercase tracking-[0.4em] font-bold rounded-full hover:bg-[var(--c-accent)] transition-colors shadow-2xl"
        >
          <EditableText id="footerCta" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
        </motion.a>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square border border-[var(--c-accent)]/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square border border-[var(--c-accent)]/10 rounded-full pointer-events-none" />
    </section>
  );
};

const Footer = ({ content, setContent, isEditing }: any) => {
  return (
    <footer className="footer-sticky">
      <div className="absolute inset-0">
        <EditableImage id="footerImg" content={content} setContent={setContent} isEditing={isEditing} className="w-full h-full object-cover opacity-30 grayscale" alt="Footer Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--c-dark)] via-[var(--c-dark)]/50 to-transparent" />
      </div>
      
      <div className="relative z-10 w-full max-w-[1400px] px-6 md:px-20 flex flex-col items-center mx-auto">
        <div className="text-xs uppercase tracking-[0.6em] mb-12 opacity-40 font-bold text-white">Contact Us</div>
        <div className="font-display text-5xl md:text-7xl font-bold italic mb-16 tracking-tighter text-white">HILLSTATE</div>
        
        <div className="grid md:grid-cols-3 w-full gap-16 text-center border-t border-white/10 pt-16">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-30 mb-6 font-bold text-white">Inquiry</div>
            <a href="tel:1600-6769" className="text-3xl font-display font-light italic text-white">1600-6769</a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-30 mb-6 font-bold text-white">Location</div>
            <div className="text-base font-light opacity-60 text-white">광주광역시 북구 본촌동 산 1번지 일원</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-30 mb-6 font-bold text-white">Status</div>
            <EditableText id="footerMeta" content={content} setContent={setContent} isEditing={isEditing} tag="div" className="text-base font-light opacity-60 text-white" />
          </div>
        </div>
        
        <div className="mt-32 text-xs uppercase tracking-[0.4em] opacity-20 font-bold text-white">
          <EditableText id="footerCopyright" content={content} setContent={setContent} isEditing={isEditing} tag="span" />
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('jungoe_hillstate_content');
    if (saved) return JSON.parse(saved);
    return {
      heroImg: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg?width=1920&height=1000",
      introTitle1: "자연과 예술이 어우러진,",
      introTitle2: "중외공원 힐스테이트.",
      introDesc: "현대건설의 자부심으로 완성되는 중외공원 힐스테이트. 약 68만평 중외공원의 눈부신 자연과 광주 문화예술회관의 품격을 동시에 누리는 단 하나의 하이엔드 주거 공간을 선보입니다.",
      introMeta1: "Open 2024",
      introMeta2: "Gwangju, Korea",
      locTitle: "살기 좋은 곳은 이미 정해져 있습니다",
      locSubtitle: "“이동은 짧게, 삶은 길게”",
      locImg: "https://framerusercontent.com/images/k7Zz2YqX6z6Z6Z6Z6Z6Z6Z6Z6Z.jpg", // Placeholder for the edited map image
      locPin: "",
      locDesc1: "서광주IC, 호남고속도로 인접", locTime1: "차로 5분",
      locDesc2: "하백초등학교 도보 통학", locTime2: "도보 3분",
      locDesc3: "68만평 중외공원 숲세권", locTime3: "도보 1분",
      locDesc4: "마트, 병원, 상권 인접", locTime4: "차로 10분",
      // 84A
      plan_84A_size: "84m²A",
      plan_84A_b2_count: "320세대",
      plan_84A_b3_count: "280세대",
      plan_84A_b2_private: "84.1234m²",
      plan_84A_b2_supply: "108.4567m²",
      plan_84A_b2_contract: "162.7890m²",
      plan_84A_b3_private: "84.1234m²",
      plan_84A_b3_supply: "107.8901m²",
      plan_84A_b3_contract: "158.2345m²",
      plan_84A_map: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      plan_84A_iso: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 84B
      plan_84B_size: "84m²B",
      plan_84B_b2_count: "270세대",
      plan_84B_b3_count: "215세대",
      plan_84B_b2_private: "84.2784m²",
      plan_84B_b2_supply: "107.9324m²",
      plan_84B_b2_contract: "160.9986m²",
      plan_84B_b3_private: "84.2784m²",
      plan_84B_b3_supply: "107.2086m²",
      plan_84B_b3_contract: "156.6315m²",
      plan_84B_map: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      plan_84B_iso: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 84E
      plan_84E_size: "84m²E",
      plan_84E_b2_count: "150세대",
      plan_84E_b3_count: "120세대",
      plan_84E_b2_private: "84.5678m²",
      plan_84E_b2_supply: "109.1234m²",
      plan_84E_b2_contract: "164.5678m²",
      plan_84E_b3_private: "84.5678m²",
      plan_84E_b3_supply: "108.5678m²",
      plan_84E_b3_contract: "160.1234m²",
      plan_84E_map: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      plan_84E_iso: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 112A
      plan_112A_size: "112m²A",
      plan_112A_b2_count: "80세대",
      plan_112A_b3_count: "60세대",
      plan_112A_b2_private: "112.1234m²",
      plan_112A_b2_supply: "145.4567m²",
      plan_112A_b2_contract: "210.7890m²",
      plan_112A_b3_private: "112.1234m²",
      plan_112A_b3_supply: "144.8901m²",
      plan_112A_b3_contract: "208.2345m²",
      plan_112A_map: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      plan_112A_iso: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 112B
      plan_112B_size: "112m²B",
      plan_112B_b2_count: "75세대",
      plan_112B_b3_count: "55세대",
      plan_112B_b2_private: "112.5678m²",
      plan_112B_b2_supply: "146.1234m²",
      plan_112B_b2_contract: "212.5678m²",
      plan_112B_b3_private: "112.5678m²",
      plan_112B_b3_supply: "145.5678m²",
      plan_112B_b3_contract: "210.1234m²",
      plan_112B_map: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      plan_112B_iso: "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 84C(테라스)
      "plan_84C(테라스)_size": "84m²C",
      "plan_84C(테라스)_b2_count": "12세대",
      "plan_84C(테라스)_b3_count": "8세대",
      "plan_84C(테라스)_b2_private": "84.9999m²",
      "plan_84C(테라스)_b2_supply": "110.9999m²",
      "plan_84C(테라스)_b2_contract": "168.9999m²",
      "plan_84C(테라스)_b3_private": "84.9999m²",
      "plan_84C(테라스)_b3_supply": "109.9999m²",
      "plan_84C(테라스)_b3_contract": "165.9999m²",
      "plan_84C(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_84C(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 84D(테라스)
      "plan_84D(테라스)_size": "84m²D",
      "plan_84D(테라스)_b2_count": "10세대",
      "plan_84D(테라스)_b3_count": "6세대",
      "plan_84D(테라스)_b2_private": "84.8888m²",
      "plan_84D(테라스)_b2_supply": "109.8888m²",
      "plan_84D(테라스)_b2_contract": "167.8888m²",
      "plan_84D(테라스)_b3_private": "84.8888m²",
      "plan_84D(테라스)_b3_supply": "108.8888m²",
      "plan_84D(테라스)_b3_contract": "164.8888m²",
      "plan_84D(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_84D(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 102A(테라스)
      "plan_102A(테라스)_size": "102m²A",
      "plan_102A(테라스)_b2_count": "15세대",
      "plan_102A(테라스)_b3_count": "10세대",
      "plan_102A(테라스)_b2_private": "102.1111m²",
      "plan_102A(테라스)_b2_supply": "132.1111m²",
      "plan_102A(테라스)_b2_contract": "195.1111m²",
      "plan_102A(테라스)_b3_private": "102.1111m²",
      "plan_102A(테라스)_b3_supply": "131.1111m²",
      "plan_102A(테라스)_b3_contract": "192.1111m²",
      "plan_102A(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_102A(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 102B(테라스)
      "plan_102B(테라스)_size": "102m²B",
      "plan_102B(테라스)_b2_count": "14세대",
      "plan_102B(테라스)_b3_count": "9세대",
      "plan_102B(테라스)_b2_private": "102.2222m²",
      "plan_102B(테라스)_b2_supply": "133.2222m²",
      "plan_102B(테라스)_b2_contract": "196.2222m²",
      "plan_102B(테라스)_b3_private": "102.2222m²",
      "plan_102B(테라스)_b3_supply": "132.2222m²",
      "plan_102B(테라스)_b3_contract": "193.2222m²",
      "plan_102B(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_102B(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 157A(테라스)
      "plan_157A(테라스)_size": "157m²A",
      "plan_157A(테라스)_b2_count": "5세대",
      "plan_157A(테라스)_b3_count": "3세대",
      "plan_157A(테라스)_b2_private": "157.3333m²",
      "plan_157A(테라스)_b2_supply": "205.3333m²",
      "plan_157A(테라스)_b2_contract": "290.3333m²",
      "plan_157A(테라스)_b3_private": "157.3333m²",
      "plan_157A(테라스)_b3_supply": "204.3333m²",
      "plan_157A(테라스)_b3_contract": "287.3333m²",
      "plan_157A(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_157A(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      // 157B(테라스)
      "plan_157B(테라스)_size": "157m²B",
      "plan_157B(테라스)_b2_count": "4세대",
      "plan_157B(테라스)_b3_count": "2세대",
      "plan_157B(테라스)_b2_private": "157.4444m²",
      "plan_157B(테라스)_b2_supply": "206.4444m²",
      "plan_157B(테라스)_b2_contract": "291.4444m²",
      "plan_157B(테라스)_b3_private": "157.4444m²",
      "plan_157B(테라스)_b3_supply": "205.4444m²",
      "plan_157B(테라스)_b3_contract": "288.4444m²",
      "plan_157B(테라스)_map": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      "plan_157B(테라스)_iso": "https://framerusercontent.com/images/67ve6qabsQyc7B0CSFmLVNdvKBE.jpg",
      benMainTitle: "조건을 보면, 기다릴 이유가 없습니다",
      benTitle1: "이자 지원", benDesc1: "총 절감액 최대 5,000만원", benVal1: "5,000만원",
      benTitle2: "무상 옵션", benDesc2: "발코니 확장 및 가전 무상 제공", benVal2: "Full Option",
      benTitle3: "계약금 정액제", benDesc3: "초기 부담을 낮춘 1,000만원 정액제", benVal3: "1,000만원",
      benTitle4: "중도금 무이자", benDesc4: "입주 시까지 이자 부담 제로", benVal4: "0%",
      cardMainTitle: "Special Features",
      cards: [
        {
          number: '01',
          title: '약 68만평 중외공원',
          subtitle: 'Nature Premium',
          description: '단지 바로 앞에서 누리는 거대한 숲세권. 중외공원의 사계절을 내 집 앞 정원처럼 누리는 쾌적한 힐링 라이프가 펼쳐집니다.',
          image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=1600&auto=format&fit=crop'
        },
        {
          number: '02',
          title: '광주 문화예술의 중심',
          subtitle: 'Culture Premium',
          description: '광주비엔날레, 국립광주박물관, 광주문화예술회관 등 도보로 누리는 압도적인 문화 인프라를 일상처럼 경험하세요.',
          image: 'https://images.unsplash.com/photo-1514119412350-e174d90d280e?q=80&w=1600&auto=format&fit=crop'
        },
        {
          number: '03',
          title: '힐스테이트 브랜드 타운',
          subtitle: 'Brand Premium',
          description: '대한민국 주거 문화를 리드하는 현대건설 힐스테이트. 차원이 다른 혁신 평면과 고품격 커뮤니티 시설을 제공합니다.',
          image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop'
        }
      ],
      sceTitle1: "아이 손을 잡고, 집 앞 학교로 걸어가는 아침",
      sceDesc1: "단지 바로 앞 초등학교로 안전하게 등교하는 아이의 뒷모습. 부모의 걱정은 줄어들고 아이의 아침은 더욱 즐거워집니다.",
      sceTitle2: "퇴근 후, 공원을 천천히 걷는 저녁",
      sceDesc2: "문 밖을 나서면 펼쳐지는 68만평 중외공원의 숲길. 지친 하루의 끝을 자연의 숨결로 치유하는 특별한 일상이 시작됩니다.",
      sceQuote: "“집은 쉬는 곳이 아니라, 삶을 바꾸는 공간입니다”",
      sceImg1: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000&auto=format&fit=crop",
      sceImg2: "https://images.unsplash.com/photo-1516211697149-d8677ecd4e72?q=80&w=1000&auto=format&fit=crop",
      trustMainTitle: "확인할수록 더 단단해지는 선택",
      trustInfo1: "중외공원 힐스테이트 신축공사",
      trustInfo2: "광주광역시 북구 본촌동 산 1번지 일원",
      trustInfo3: "지하 2층 ~ 지상 28층, 총 2,466세대",
      trustInfo4: "현대건설 (주)",
      premiumMainTitle: "역대급 프리미엄 7",
      premiumSubtitle: "주거에 새로운 가치를 만들어 가는 힐스테이트",
      premium1_title: "63만평 중외공원 파크라이프", premium1_desc: "비엔날레를 품은 힐스테이트의 공원특례사업",
      premium2_title: "문화예술을 품은 인프라", premium2_desc: "전시관, 박물관 등 일상으로 누리는 문화생활",
      premium3_title: "시내·외 사통팔달 교통", premium3_desc: "서광주 IC, 북문대로 인근, 인근 산단지구와 근접",
      premium4_title: "한걸음 학군, 안심교육", premium4_desc: "인근 초,중,고 및 단지 내 종로엠스쿨 입점 확정",
      premium5_title: "품격을 더하는 테라스 라이프", premium5_desc: "전용 84㎡ 이상 중대형 및 남향위주 단지배치",
      premium6_title: "삶의 여유를 누리는 커뮤니티", premium6_desc: "힐스라운지, 피트니스 센터, 골프연습장 등",
      premium7_title: "힐스테이트 브랜드 프리미엄", premium7_desc: "브랜드 평판지수 1위에 빛나는 대한민국 대표아파트",
      finalTitle: "당신의 삶이 예술이 되는 곳",
      finalDesc: "중외공원 힐스테이트에서 경험하게 될 압도적인 일상. 지금 바로 관심고객으로 등록하시고 특별한 혜택과 분양 정보를 가장 먼저 받아보세요.",
      footerMeta: "성공적인 분양을 위한 첫걸음",
      footerCta: "관심고객 등록",
      footerCopyright: "© 2025 JUNGOE PARK HILLSTATE. ALL RIGHTS RESERVED.",
      footerImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
    };
  });

  useEffect(() => {
    localStorage.setItem('jungoe_hillstate_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="antialiased selection:bg-[var(--c-accent)] selection:text-white">
      <div className="noise-overlay" />
      
      <AnimatePresence mode="wait">
        {loading && (
          <Loader key="loader" onComplete={() => {}} />
        )}
      </AnimatePresence>

      <Navbar />

      {/* Edit Mode Toggle */}
      <div className="fixed bottom-8 right-8 z-[10001] flex flex-col gap-4">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
            isEditing ? "bg-[var(--c-dark)] text-white rotate-90" : "bg-[var(--c-accent)] text-white hover:scale-110"
          )}
          title={isEditing ? "편집 종료" : "편집 모드 시작"}
        >
          {isEditing ? <X size={24} /> : <Edit2 size={24} />}
        </button>
        {isEditing && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-[var(--c-accent)]/20 text-[10px] font-bold uppercase tracking-widest text-[var(--c-accent)] animate-in fade-in slide-in-from-bottom-4">
            Edit Mode Active<br/>
            <span className="text-[var(--c-dark)]/40 font-normal normal-case">글씨를 클릭해 수정하고,<br/>사진을 클릭해 URL을 변경하세요.</span>
          </div>
        )}
      </div>
      
      <div className="wrapper">
        <Hero content={content} setContent={setContent} isEditing={isEditing} />
        <Intro content={content} setContent={setContent} isEditing={isEditing} />
        <Location content={content} setContent={setContent} isEditing={isEditing} />
        <FloorPlans content={content} setContent={setContent} isEditing={isEditing} />
        <Benefits content={content} setContent={setContent} isEditing={isEditing} />
        <CardStack content={content} setContent={setContent} isEditing={isEditing} />
        <Scenario content={content} setContent={setContent} isEditing={isEditing} />
        <Trust content={content} setContent={setContent} isEditing={isEditing} />
        <Final content={content} setContent={setContent} isEditing={isEditing} />
      </div>

      <Footer content={content} setContent={setContent} isEditing={isEditing} />
    </div>
  );
}
