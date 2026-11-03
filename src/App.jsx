import { useEffect, useMemo, useRef, useState } from 'react';
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, Quality } from 'mediabunny';
import {
  ArrowRight, AudioLines, CarFront, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clapperboard, Clipboard, CloudUpload, Code2, Download, FileVideo,
  Film, Gauge, ImagePlus, Info, Layers3, Link2, ListVideo, LoaderCircle, Menu,
  Mic2, MoreHorizontal, Music2, Play, Plus, Radio, Settings2, Sparkles, Trash2,
  Upload, WandSparkles, X,
} from 'lucide-react';

const templates = [
  { name: '빠른 8초 티저', desc: '자막만 더한 경쾌한 세로 영상', tags: ['커스텀 레시피', '틱톡 톤', '8초'], duration: 8, tone: '틱톡' },
  { name: '딜러 광고', desc: '나레이션, 제목, 제원, 가격, 엔드 카드', tags: ['커스텀 레시피', '슈퍼볼 톤', '24초'], duration: 24, tone: '슈퍼볼' },
  { name: '가격 인하 프로모션', desc: '가격 공개와 강조 엔드 카드', tags: ['커스텀 레시피', '가격 강조'], duration: 15, tone: '슈퍼볼' },
  { name: '360° 둘러보기', desc: '차량을 살펴보는 쇼룸 스타일', tags: ['360° 회전', '쇼룸'], duration: 24, tone: '기본' },
  { name: '산악 드라이브', desc: '굽이진 산길과 모험적인 분위기', tags: ['산악 주행', '스토리텔러'], duration: 15, tone: '스토리텔러' },
  { name: '오픈 로드 크루즈', desc: '긴 도로와 석양의 여유', tags: ['오픈 로드', '앰비언트'], duration: 15, tone: '기본' },
  { name: '어반 나이트 드라이브', desc: '네온과 젖은 도로의 반사광', tags: ['도심 야간', '에너지'], duration: 15, tone: '틱톡' },
  { name: '도시 라이프스타일', desc: '골든아워의 역동적인 시내 주행', tags: ['시티 무브', '에너지'], duration: 15, tone: '기본' },
  { name: '럭셔리 히어로', desc: '차분하고 고급스러운 제원 소개', tags: ['럭셔리', '갤러리 룩'], duration: 15, tone: '스토리텔러' },
];

const featureOptions = ['무사고', '1인 소유', '정비 기록', '후방 카메라', '애플 카플레이', '열선 시트', '선루프', '4륜 구동', '크루즈 컨트롤', '가죽 시트'];
const styles = ['딜러 쇼케이스', '스펙 히어로', '360° 워크어라운드', '스트리트 에너지', '마운틴 런', '어반 나이트', '오픈 하이웨이', '롤링 드라이브'];
const intents = ['자동 선택', '매물 상세 페이지 방문자', '모델 인지도 광고', '잠재고객 재접촉', '신규 입고', '가격 인하'];
const placements = ['기본', '전시장 라운지 화면', '내 웹사이트 매물 페이지', '영업 담당자 1:1 전달', '외부 매물 마켓'];
const voices = ['프리미엄 웜', '부드러운 바리톤', '대담한 권위', '친근한 전문가', '편안하고 자연스럽게', '자신감 있는 여성', '밝고 경쾌하게', '우아한 럭셔리'];
const musicOptions = ['자동 선택', '트렌딩 틱톡', '시네마틱 에픽', '럭셔리 엘레강스', '에너지 일렉트로닉', '앰비언트 드리미', '모던 코퍼레이트', '음악 없음'];

function IconButton({ children, onClick, className = '', title, disabled = false }) {
  return <button type="button" title={title} className={`icon-button ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function App() {
  const [page, setPage] = useState(() => location.hash.replace('#', '') || 'overview');
  const [mode, setMode] = useState('simple');
  const [category, setCategory] = useState('vehicle');
  const [template, setTemplate] = useState(templates[0]);
  const [photos, setPhotos] = useState([]);
  const [vehicle, setVehicle] = useState({ year: '2023', make: 'Toyota', model: 'RAV4', trim: 'XLE', price: '28,990,000', mileage: '24,100', vin: '', drivetrain: 'AWD', color: 'Silver Sky Metallic', body: 'SUV', dealer: '', description: '1인 소유, 무사고, 사륜구동' });
  const [features, setFeatures] = useState(['무사고', '1인 소유']);
  const [customFeature, setCustomFeature] = useState('');
  const [direction, setDirection] = useState('자동 선택');
  const [intent, setIntent] = useState('자동 선택');
  const [placement, setPlacement] = useState('기본');
  const [aspect, setAspect] = useState('9:16');
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState(8);
  const [camera, setCamera] = useState('시네마틱');
  const [narration, setNarration] = useState(false);
  const [voice, setVoice] = useState('프리미엄 웜');
  const [tone, setTone] = useState('틱톡');
  const [script, setScript] = useState('');
  const [cta, setCta] = useState('');
  const [music, setMusic] = useState('에너지 일렉트로닉');
  const [brand, setBrand] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [scene, setScene] = useState('사진에 맞춤');
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [overlays, setOverlays] = useState({ captions: true, title: false, price: false, mileage: false, end: false, points: false, spec: false, spotlight: false });
  const [open, setOpen] = useState({ subject: true, direction: true, finish: true, audio: true, branding: true, advanced: false });
  const [video, setVideo] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [listingUrl, setListingUrl] = useState('');
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const dragIndex = useRef(null);

  useEffect(() => {
    const sync = () => setPage(location.hash.replace('#', '') || 'overview');
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  const selectedFeatures = useMemo(() => [...features, ...(customFeature.trim() ? [customFeature.trim()] : [])], [features, customFeature]);
  const codeText = useMemo(() => JSON.stringify({ type: category, vehicle, duration, aspect, resolution, template: template.name, direction, intent, placement, narration, voice: narration ? voice : null, tone, music, features: selectedFeatures }, null, 2), [category, vehicle, duration, aspect, resolution, template, direction, intent, placement, narration, voice, tone, music, selectedFeatures]);

  function navigate(next) {
    location.hash = next;
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toast(message) { setNotice(message); window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => setNotice(''), 4300); }
  function updateVehicle(key, value) { setVehicle(current => ({ ...current, [key]: value })); }
  function applyTemplate(item) { setTemplate(item); setDuration(item.duration); setTone(item.tone); toast(`${item.name} 템플릿을 적용했습니다. 사진을 추가해 영상을 만들어 보세요.`); }
  function addPhotos(incoming) {
    const list = [...(incoming || [])].filter(file => file.type.startsWith('image/'));
    if (!list.length) { toast('JPG, PNG 또는 WebP 사진을 선택해 주세요.'); return; }
    const accepted = list.filter(file => file.size <= 15 * 1024 * 1024).slice(0, Math.max(0, 20 - photos.length));
    if (!accepted.length) { toast('사진은 최대 20장, 파일당 15MB까지 추가할 수 있습니다.'); return; }
    setPhotos(current => [...current, ...accepted.map((file, index) => ({ file, name: file.name, url: URL.createObjectURL(file), key: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}` }))]);
    toast(`${accepted.length}장의 사진을 추가했습니다.`);
  }
  function removePhoto(key) {
    setPhotos(current => { const item = current.find(photo => photo.key === key); if (item) URL.revokeObjectURL(item.url); return current.filter(photo => photo.key !== key); });
  }
  function movePhoto(from, to) {
    setPhotos(current => { if (from == null || from === to || to < 0 || to >= current.length) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  }
  function lookupNotice(kind) {
    toast(kind === 'vin' ? 'VIN 자동 조회는 CatalogReel API 연결이 필요합니다. 차량 정보를 직접 입력해 주세요.' : '매물 자동 가져오기는 원본 API 연결이 필요합니다. 공개 데모에서는 사진과 정보를 직접 입력해 주세요.');
  }
  function toggleFeature(item) { setFeatures(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]); }
  function toggleOverlay(key) { setOverlays(current => ({ ...current, [key]: !current[key] })); }
  function toggleSection(key) { setOpen(current => ({ ...current, [key]: !current[key] })); }

  function drawFrame(ctx, photo, seconds, index, count) {
    const canvas = ctx.canvas, w = canvas.width, h = canvas.height;
    const progressInScene = seconds / Math.max(1, duration / count);
    const scale = 1.02 + Math.max(0, Math.min(1, progressInScene)) * 0.055;
    const cover = Math.max(w / photo.width, h / photo.height) * scale;
    const sw = w / cover, sh = h / cover;
    const pan = (index % 2 ? -1 : 1) * Math.min(w * 0.012, seconds * 3);
    ctx.fillStyle = '#101113'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(photo, (photo.width - sw) / 2 - pan / cover, (photo.height - sh) / 2, sw, sh, 0, 0, w, h);
    const fade = ctx.createLinearGradient(0, h * 0.44, 0, h);
    fade.addColorStop(0, 'rgba(5,7,10,0)'); fade.addColorStop(0.45, 'rgba(5,7,10,.18)'); fade.addColorStop(1, 'rgba(5,7,10,.92)');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
    const pad = w * 0.075, scaleText = w / 720;
    if (brand.trim()) { ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.font = `600 ${14 * scaleText}px Arial`; ctx.fillText(brand.trim().slice(0, 34), pad, h * 0.085); }
    ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.font = `500 ${14 * scaleText}px Arial`; ctx.textAlign = 'right'; ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`, w - pad, h * 0.085); ctx.textAlign = 'left';
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim();
    ctx.fillStyle = '#f2a51a'; ctx.fillRect(pad, h * 0.755, 42 * scaleText, 3 * scaleText);
    ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.min(42, 43 * scaleText)}px Arial`; ctx.textBaseline = 'alphabetic';
    const titleParts = title.length > 25 ? [title.slice(0, 24), title.slice(24, 45)] : [title];
    titleParts.forEach((part, line) => ctx.fillText(part, pad, h * 0.82 + line * 48 * scaleText));
    ctx.fillStyle = '#ffc14b'; ctx.font = `700 ${32 * scaleText}px Arial`; ctx.fillText(vehicle.price ? `₩ ${vehicle.price}` : '가격 문의', pad, h * 0.89);
    ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.font = `500 ${16 * scaleText}px Arial`; ctx.fillText([vehicle.trim, vehicle.mileage && `${vehicle.mileage} km`, vehicle.drivetrain].filter(Boolean).join('  ·  ').slice(0, 58), pad, h * 0.925);
    if (selectedFeatures.length && overlays.points) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = `500 ${13 * scaleText}px Arial`; ctx.fillText(selectedFeatures.slice(0, 3).join('   ·   ').slice(0, 52), pad, h * 0.96); }
    if (cta.trim() && index === count - 1) { ctx.fillStyle = '#151515'; ctx.beginPath(); ctx.roundRect(w - pad - 170 * scaleText, h * 0.94, 170 * scaleText, 32 * scaleText, 16 * scaleText); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `600 ${12 * scaleText}px Arial`; ctx.fillText(cta.slice(0, 22), w - pad - 85 * scaleText, h * 0.963); ctx.textAlign = 'left'; }
  }

  async function renderWebm(canvas, ctx, bitmaps, secondsTotal) {
    if (!('MediaRecorder' in window) || !canvas.captureStream) throw new Error('이 브라우저는 영상 인코딩을 지원하지 않습니다. 최신 Chrome 또는 Edge를 사용해 주세요.');
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(item => MediaRecorder.isTypeSupported(item));
    const stream = canvas.captureStream(24); const recorder = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 5_000_000 } : undefined); const chunks = [];
    const complete = new Promise((resolve, reject) => { recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); }; recorder.onerror = event => reject(event.error || new Error('영상 인코딩에 실패했습니다.')); recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' })); });
    recorder.start(250); const fps = 24, total = Math.ceil(secondsTotal * fps), segment = secondsTotal / bitmaps.length;
    for (let frame = 0; frame < total; frame++) { const idx = Math.min(bitmaps.length - 1, Math.floor(frame / (segment * fps))); drawFrame(ctx, bitmaps[idx], (frame % Math.ceil(segment * fps)) / fps, idx, bitmaps.length); if (frame % 6 === 0) { setProgress(Math.round(frame / total * 96)); await new Promise(resolve => setTimeout(resolve, 1000 / fps)); } }
    recorder.stop(); const blob = await complete; stream.getTracks().forEach(track => track.stop()); return blob;
  }

  async function generateVideo() {
    if (!photos.length) { toast('사진을 한 장 이상 추가해 주세요.'); return; }
    if (!vehicle.year.trim() || !vehicle.make.trim() || !vehicle.model.trim()) { toast('연식, 제조사, 모델을 입력해 주세요.'); return; }
    setBusy(true); setProgress(0); setNotice('');
    const canvas = canvasRef.current, ctx = canvas.getContext('2d', { alpha: false });
    const [vw, vh] = aspect === '9:16' ? [720, 1280] : [1280, 720]; canvas.width = vw; canvas.height = vh;
    const bitmaps = [];
    try {
      for (const entry of photos) bitmaps.push(await createImageBitmap(entry.file));
      let blob;
      if ('VideoEncoder' in window) {
        const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
        const source = new CanvasSource(canvas, { codec: 'avc', bitrate: new Quality(resolution === '1080p' ? 'high' : 'medium') });
        output.addVideoTrack(source, { frameRate: 24 }); await output.start();
        const fps = 24, total = Math.ceil(duration * fps), segment = duration / bitmaps.length;
        for (let frame = 0; frame < total; frame++) { const idx = Math.min(bitmaps.length - 1, Math.floor(frame / (segment * fps))); drawFrame(ctx, bitmaps[idx], (frame % Math.ceil(segment * fps)) / fps, idx, bitmaps.length); await source.add(frame / fps, 1 / fps); if (frame % 6 === 0) { setProgress(Math.round(frame / total * 96)); await new Promise(resolve => setTimeout(resolve, 0)); } }
        source.close(); await output.finalize(); blob = new Blob([output.target.buffer], { type: 'video/mp4' });
      } else blob = await renderWebm(canvas, ctx, bitmaps, duration);
      const url = URL.createObjectURL(blob); const entry = { url, type: blob.type, title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, date: new Date(), duration, aspect, size: blob.size };
      setVideo(entry); setHistory(list => [entry, ...list]); setProgress(100); setShowPreview(true); toast(`${blob.type === 'video/mp4' ? 'MP4' : 'WebM'} 영상이 완성됐습니다.`);
    } catch (error) { console.error(error); toast(error?.message || '영상 생성에 실패했습니다. 사진 형식을 확인해 주세요.'); }
    finally { bitmaps.forEach(bitmap => bitmap.close()); setBusy(false); }
  }
  async function copyCode() { try { await navigator.clipboard.writeText(codeText); toast('영상 설정 JSON을 복사했습니다.'); } catch { toast('클립보드에 복사할 수 없습니다. 설정 JSON 창에서 직접 복사해 주세요.'); } }

  const titleForPage = { overview: '개요', playground: '플레이그라운드', videos: '영상', lounge: '라운지', transactions: '거래 내역', keys: 'API 키', tenants: '하위 계정' }[page] || '개요';

  return <div className="app-shell">
    <header className="topbar">
      <a className="wordmark" href="#overview" onClick={event => { event.preventDefault(); navigate('overview'); }}><span>Catalog</span><b>Reel</b></a>
      <span className="workspace-label">로컬 워크스페이스</span>
      <nav className="top-links"><button onClick={() => navigate('playground')}>플레이그라운드</button><button onClick={() => toast('가이드 문서는 준비 중입니다.')}>문서</button><span className="local-pill">로컬 모드</span></nav>
      <button className="top-signin" onClick={() => toast('정적 공개 버전은 계정 로그인을 제공하지 않습니다.')}>로그인</button>
    </header>

    <div className="console-tabs" role="navigation" aria-label="콘솔 메뉴">
      {[
        ['overview', '개요'], ['videos', '영상'], ['lounge', '라운지'], ['transactions', '거래 내역'], ['keys', 'API 키'], ['tenants', '하위 계정'],
      ].map(([key, label]) => <button key={key} className={page === key ? 'selected' : ''} onClick={() => navigate(key)}>{label}</button>)}
      <button className="new-video-tab" onClick={() => navigate('playground')}><Plus size={15}/> 새 영상</button>
    </div>

    <main className="page-wrap">
      {page === 'overview' && <>
        <div className="page-heading"><div><h1>개요</h1><p>CatalogReel에서 차량 영상을 만들고 작업 현황을 확인하세요.</p></div></div>
        <section className="welcome-card">
          <div><div className="welcome-eyebrow"><Sparkles size={15}/> 영상 제작</div><h2>첫 영상을 만들어 보세요</h2><p>템플릿을 고르고 차량 사진을 추가한 뒤 생성하면 됩니다. 복잡한 설정 없이 시작할 수 있어요.</p><button className="primary" onClick={() => navigate('playground')}>첫 영상 만들기 <ArrowRight size={16}/></button><small>공개 데모는 브라우저에서 영상 파일을 생성합니다. 원본 계정과 연결되지 않습니다.</small></div>
          <div className="welcome-icon"><Clapperboard size={26}/></div>
        </section>
        <section className="balance-card"><div><span>작업 방식</span><strong>브라우저 로컬 생성</strong><small>계정 잔액·크레딧과 연결되지 않음</small></div><span className="tier-pill">공개 데모</span></section>
        <div className="section-label">원본 콘솔의 요금제 카드</div>
        <section className="plans-grid">
          {[
            ['Starter', '$20', '100 크레딧', '기본 렌더링'], ['Growth', '$90', '500 크레딧', '10% 절약'], ['Scale', '$400', '2,500 크레딧', '20% 절약'],
          ].map(([name, price, credits, badge]) => <article className="plan-card" key={name}><div className="plan-top"><strong>{name}</strong>{name !== 'Starter' && <span>{badge}</span>}</div><b>{price}</b><p>{credits}<button onClick={() => toast('결제는 원본 계정과 연결되지 않아 공개 데모에서 제공하지 않습니다.')}> · 구매</button></p></article>)}
        </section>
        <section className="activity-block"><div className="section-heading"><h2>최근 활동</h2><button onClick={() => navigate('transactions')}>거래 내역 보기 <ArrowRight size={15}/></button></div><div className="activity-row"><span className="activity-dot"><Check size={13}/></span><span><b>브라우저 제작기 준비 완료</b><small>영상은 이 기기에서 생성되며 서버에 업로드되지 않습니다.</small></span><span className="activity-tag">정보</span></div></section>
      </>}

      {page === 'playground' && <>
        <div className="page-heading playground-heading"><div><h1>플레이그라운드</h1><p>템플릿을 선택하고 사진을 추가하면 브랜드 스타일의 영상으로 만들어 드립니다. 설정은 JSON으로 복사할 수 있습니다.</p></div><div className="heading-badges"><span className="tier-pill">로컬 렌더링</span><span className="tier-pill">최대 20장</span></div></div>
        <div className="studio-grid">
          <div className="studio-main">
            <div className="mode-row"><div className="segmented"><button className={mode === 'simple' ? 'active' : ''} onClick={() => setMode('simple')}>간편 설정</button><button className={mode === 'advanced' ? 'active' : ''} onClick={() => setMode('advanced')}>고급 설정</button></div><span>{mode === 'simple' ? '템플릿 + 사진 → 생성' : '세부 옵션 직접 설정'}</span></div>
            <section className="quick-card">
              <div className="card-title-row"><div className="card-title"><Sparkles size={16}/><div><h2>빠른 시작</h2><p>카테고리를 선택하고 예시 템플릿을 적용하세요.</p></div></div><button className="subtle-button" onClick={() => { setPhotos([]); setTemplate(templates[0]); setDuration(8); toast('제작 설정을 초기화했습니다.'); }}><X size={15}/> 초기화</button></div>
              <div className="category-row">{[['vehicle', '차량 · 9'], ['ecommerce', '이커머스 · 5'], ['realestate', '부동산 · 2']].map(([key, label]) => <button className={category === key ? 'active' : ''} key={key} onClick={() => setCategory(key)}>{label}</button>)}</div>
              <div className="template-grid">{templates.map(item => <button type="button" key={item.name} className={`template-card ${template.name === item.name ? 'picked' : ''}`} onClick={() => applyTemplate(item)}><span className="template-name">{item.name}</span><span className="template-desc">{item.desc}</span><span className="tag-list">{item.tags.map(tag => <i key={tag}>{tag}</i>)}</span></button>)}</div>
              <p className="preset-note"><Info size={13}/>{template.name} 적용됨 · 사진을 추가하면 영상을 만들 수 있습니다.</p>
            </section>

            <section className="form-card">
              <button className="section-toggle" onClick={() => toggleSection('subject')}><div className="section-icon"><ImagePlus size={17}/></div><div><strong>주제</strong><small>영상 내용과 사용할 사진</small></div><ChevronDown className={open.subject ? '' : 'rotated'} size={18}/></button>
              {open.subject && <div className="section-body">
                <div className="category-pills">{[['vehicle','차량'],['ecommerce','이커머스'],['realestate','부동산']].map(([key,label]) => <button key={key} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>{label}</button>)}</div>
                <div className="upload-zone" role="button" tabIndex="0" onClick={() => fileRef.current?.click()} onKeyDown={event => event.key === 'Enter' && fileRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addPhotos(event.dataTransfer.files); }}><CloudUpload size={25}/><strong>사진을 끌어오거나 클릭해 업로드</strong><span>최대 20장 · JPG, PNG, WebP · 장당 15MB</span></div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={event => { addPhotos(event.target.files); event.target.value = ''; }}/>
                <p className="field-hint">사진의 순서대로 장면이 이어집니다. 사진 파일은 서버로 전송되지 않습니다.</p>
                {photos.length > 0 && <div className="photo-list">{photos.map((photo, index) => <article className="photo-row" key={photo.key} draggable onDragStart={() => { dragIndex.current = index; }} onDragOver={event => event.preventDefault()} onDrop={() => movePhoto(dragIndex.current, index)}><span className="photo-index">{String(index + 1).padStart(2, '0')}</span><img src={photo.url} alt="업로드한 차량"/><span className="photo-caption"><b title={photo.name}>{photo.name}</b><small>{(photo.file.size / 1024 / 1024).toFixed(1)} MB</small></span><div className="photo-actions"><IconButton title="위로" onClick={() => movePhoto(index, index - 1)} disabled={index === 0}><ChevronDown className="up-icon" size={15}/></IconButton><IconButton title="삭제" onClick={() => removePhoto(photo.key)}><Trash2 size={15}/></IconButton></div></article>)}</div>}
                <div className="import-grid"><div className="import-field"><label htmlFor="vin">VIN으로 차량 정보 가져오기</label><div className="input-with-button"><input id="vin" value={vehicle.vin} onChange={event => updateVehicle('vin', event.target.value)} placeholder="17자리 차대번호 입력"/><button onClick={() => lookupNotice('vin')}><Gauge size={14}/> 조회</button></div><small>제조사·모델·트림 자동 입력 · API 연동 필요</small></div><div className="import-field"><label htmlFor="listing">매물 페이지 가져오기</label><div className="input-with-button"><input id="listing" value={listingUrl} onChange={event => setListingUrl(event.target.value)} placeholder="딜러 매물 URL 붙여넣기"/><button onClick={() => lookupNotice('listing')}><Link2 size={14}/> 가져오기</button></div><small>가격·제원·사진 자동 불러오기 · API 연동 필요</small></div></div>
                <div className="vehicle-fields">
                  <div className="subsection-title"><div><h3>차량 정보</h3><p>입력한 정보가 타이틀과 오버레이에 표시됩니다.</p></div><span className="pill-soft">선택 입력</span></div>
                  <div className="field-grid">
                    {[['연식','year','2023'],['제조사','make','Toyota'],['모델','model','RAV4'],['트림','trim','XLE'],['가격 (원)','price','28,990,000'],['주행거리 (km)','mileage','24,100'],['구동 방식','drivetrain','AWD'],['차체 유형','body','SUV'],['색상','color','Silver Sky Metallic'],['판매점','dealer','판매점 이름']].map(([label,key,placeholder]) => <label className="text-field" key={key}>{label}<input value={vehicle[key]} placeholder={placeholder} onChange={event => updateVehicle(key, event.target.value)}/></label>)}
                    <label className="text-field full">매물 설명<textarea rows="2" value={vehicle.description} onChange={event => updateVehicle('description', event.target.value)} placeholder="차량 상태나 강조하고 싶은 내용"/></label>
                  </div>
                  <div className="features-area"><b>특장점</b><div className="chips">{featureOptions.map(item => <button key={item} className={features.includes(item) ? 'active' : ''} onClick={() => toggleFeature(item)}>{features.includes(item) && <Check size={12}/>} {item}</button>)}</div><div className="inline-add"><Plus size={15}/><input value={customFeature} onChange={event => setCustomFeature(event.target.value)} placeholder="특장점 직접 입력"/></div></div>
                </div>
              </div>}
            </section>

            <section className="form-card">
              <button className="section-toggle" onClick={() => toggleSection('direction')}><div className="section-icon"><WandSparkles size={17}/></div><div><strong>연출 방향</strong><small>촬영 느낌과 고객 대상</small></div><ChevronDown className={open.direction ? '' : 'rotated'} size={18}/></button>
              {open.direction && <div className="section-body">
                <div className="subsection-title"><div><h3>연출 스타일</h3><p>사진 분위기에 맞춰 자동 선택하거나 스타일을 고정합니다.</p></div></div>
                <div className="option-grid">{[['자동 선택','사진에 맞춰 감독이 선택'],['딜러 쇼케이스','깔끔한 전시장'],...styles.slice(1).map(item => [item, item === '스펙 히어로' ? '고급스러운 제원 강조' : `${item} 스타일`])].map(([name,desc]) => <button key={name} className={direction === name ? 'option-card active' : 'option-card'} onClick={() => setDirection(name)}><strong>{name}</strong><small>{desc}</small></button>)}</div>
                <div className="field-grid two-col"><label className="select-field">고객 의도<select value={intent} onChange={event => setIntent(event.target.value)}>{intents.map(item => <option key={item}>{item}</option>)}</select></label><label className="select-field">영상 게시 위치<select value={placement} onChange={event => setPlacement(event.target.value)}>{placements.map(item => <option key={item}>{item}</option>)}</select></label></div>
                <label className="check-line"><input type="checkbox"/> 이 차량 사진에서 확인되는 특징을 영상 설명에 반영</label>
              </div>}
            </section>

            <section className="form-card">
              <button className="section-toggle" onClick={() => toggleSection('finish')}><div className="section-icon"><Settings2 size={17}/></div><div><strong>마감 및 형식</strong><small>영상 품질, 비율, 길이</small></div><ChevronDown className={open.finish ? '' : 'rotated'} size={18}/></button>
              {open.finish && <div className="section-body">
                <div className="setting-row"><div className="setting-label">렌더 품질</div><div className="segmented compact"><button className={resolution === '720p' ? 'active' : ''} onClick={() => setResolution('720p')}>빠른 렌더 · 720p</button><button className={resolution === '1080p' ? 'active' : ''} onClick={() => setResolution('1080p')}>고화질 · 1080p</button></div></div>
                <div className="setting-row"><div className="setting-label">카메라 스타일</div><div className="segmented compact"><button className={camera === '시네마틱' ? 'active' : ''} onClick={() => setCamera('시네마틱')}>시네마틱</button><button className={camera === '휴대폰 촬영' ? 'active' : ''} onClick={() => setCamera('휴대폰 촬영')}>휴대폰 촬영</button></div></div>
                <div className="setting-row"><div className="setting-label">화면 비율</div><div className="segmented compact"><button className={aspect === '9:16' ? 'active' : ''} onClick={() => setAspect('9:16')}>9:16 세로</button><button className={aspect === '16:9' ? 'active' : ''} onClick={() => setAspect('16:9')}>16:9 가로</button></div></div>
                <div className="setting-row duration-setting"><label className="setting-label" htmlFor="duration">영상 길이 <b>{duration}초</b></label><input id="duration" type="range" min="8" max="24" step="1" value={duration} onChange={event => setDuration(Number(event.target.value))}/><div className="range-labels"><span>8초</span><span>24초</span></div></div>
              </div>}
            </section>

            <section className="form-card">
              <button className="section-toggle" onClick={() => toggleSection('audio')}><div className="section-icon"><AudioLines size={17}/></div><div><strong>오디오 및 나레이션</strong><small>음성, 톤, 음악 설정</small></div><ChevronDown className={open.audio ? '' : 'rotated'} size={18}/></button>
              {open.audio && <div className="section-body">
                <div className="setting-row"><div className="setting-label">나레이션</div><div className="segmented compact"><button className={!narration ? 'active' : ''} onClick={() => setNarration(false)}>나레이션 없음</button><button className={narration ? 'active' : ''} onClick={() => setNarration(true)}>AI 나레이션</button></div></div>
                {narration && <><label className="select-field">음성 스타일<select value={voice} onChange={event => setVoice(event.target.value)}>{voices.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-field full">맞춤 대본<textarea value={script} onChange={event => setScript(event.target.value)} rows="3" placeholder="나레이션으로 읽을 문구를 입력하세요"/></label><label className="text-field full">음성 CTA<input value={cta} onChange={event => setCta(event.target.value)} placeholder="예: 지금 시승을 예약하세요"/></label></>}
                <div className="field-grid two-col"><label className="select-field">톤<select value={tone} onChange={event => setTone(event.target.value)}>{['기본','틱톡','스토리텔러','맥커너히','슈퍼볼','미니멀','정보 전달','대화형','제원 중심'].map(item => <option key={item}>{item}</option>)}</select></label><label className="select-field">음악 프리셋<select value={music} onChange={event => setMusic(event.target.value)}>{musicOptions.map(item => <option key={item}>{item}</option>)}</select></label></div>
              </div>}
            </section>

            <section className="form-card">
              <button className="section-toggle" onClick={() => toggleSection('branding')}><div className="section-icon"><Layers3 size={17}/></div><div><strong>브랜딩 및 장면</strong><small>오버레이, 자막, 배경 장면</small></div><ChevronDown className={open.branding ? '' : 'rotated'} size={18}/></button>
              {open.branding && <div className="section-body">
                <div className="field-grid two-col"><label className="text-field">브랜드명<input value={brand} onChange={event => setBrand(event.target.value)} placeholder="오버레이 브랜드명"/></label><label className="text-field">로고 URL<input value={logoUrl} onChange={event => setLogoUrl(event.target.value)} placeholder="https://..."/></label><label className="text-field">화면 CTA<input value={cta} onChange={event => setCta(event.target.value)} placeholder="문의하기"/></label><label className="select-field">장면 프리셋<select value={scene} onChange={event => setScene(event.target.value)}>{['사진에 맞춤','딜러 매장','모던 쇼룸','스튜디오 히어로','도심 주행','골든아워 주차장','시승 도로','산악 도로','도시 야경','전원 도로'].map(item => <option key={item}>{item}</option>)}</select></label></div>
                <label className="check-line"><input type="checkbox" checked={burnCaptions} onChange={event => setBurnCaptions(event.target.checked)}/> 영상에 자막 표시</label>
                <div className="advanced-box"><button className="advanced-toggle" onClick={() => toggleSection('advanced')}><div><strong>고급 오버레이 설정</strong><small>선택한 요소만 영상에 표시</small></div><ChevronDown className={open.advanced ? '' : 'rotated'} size={17}/></button>{open.advanced && <div className="overlay-grid">{[['captions','자막'],['title','타이틀 카드'],['price','가격 공개'],['mileage','주행거리 표시'],['end','엔드 카드'],['points','판매 포인트'],['spec','제원 콜아웃'],['spotlight','특장점 강조']].map(([key,label]) => <label key={key}><input type="checkbox" checked={overlays[key]} onChange={() => toggleOverlay(key)}/>{label}</label>)}</div>}</div>
              </div>}
            </section>
          </div>

          <aside className="studio-side">
            <section className="render-card"><div className="render-top"><span>{category === 'vehicle' ? '차량' : category === 'ecommerce' ? '이커머스' : '부동산'} · {template.name} · {duration}초 · {aspect}</span><span className="tier-pill">로컬</span></div><div className="render-summary"><div><small>필요 크레딧</small><strong>없음</strong><span>이 기기에서 처리</span></div><div className="render-size"><b>{duration}초 영상</b><small>{photos.length}장 · {resolution}</small></div></div><button className="generate-button" onClick={generateVideo} disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/> 영상 만드는 중 {progress}%</> : <><Sparkles size={16}/> 영상 생성</>}</button>{busy && <div className="progress-track"><i style={{ width: `${progress}%` }}/></div>}<button className="code-button" onClick={() => setShowCode(true)}><Code2 size={16}/> 설정 JSON 보기 / 복사</button><p><Info size={13}/> 생성된 파일은 이 기기에서만 처리됩니다. 서버 업로드나 계정 크레딧 사용은 없습니다.</p></section>
            <section className={`preview-card ${video ? 'has-video' : ''}`}>
              {video ? <><video src={video.url} controls playsInline/><div className="preview-card-footer"><div><strong>{video.title}</strong><small>{video.duration}초 · {video.aspect} · {(video.size / 1024 / 1024).toFixed(1)} MB</small></div><button className="download-small" onClick={() => downloadVideo(video)}><Download size={15}/> 저장</button></div></> : <div className="empty-preview"><Sparkles size={28}/><strong>완성된 영상이 여기에 표시됩니다.</strong><span>사진을 올리고 영상 생성을 눌러 보세요.</span></div>}
            </section>
            <div className="video-tip"><CircleHelp size={15}/><span>렌더링은 사진 수와 영상 길이에 따라 시간이 달라집니다.</span></div>
          </aside>
        </div>
      </>}

      {page === 'videos' && <>
        <div className="page-heading"><div><h1>영상</h1><p>현재 브라우저 세션에서 만든 영상 목록입니다.</p></div><button className="primary" onClick={() => navigate('playground')}><Plus size={16}/> 새 영상</button></div>
        {history.length ? <div className="video-list">{history.map((item, index) => <article className="history-card" key={`${item.date}-${index}`}><div className="history-thumb"><FileVideo size={22}/></div><div><strong>{item.title}</strong><small>{item.date.toLocaleString('ko-KR')} · {item.duration}초 · {item.aspect}</small></div><a className="history-download" href={item.url} download={`${item.title.replaceAll(' ', '-')}.${item.type === 'video/mp4' ? 'mp4' : 'webm'}`}><Download size={15}/> 다운로드</a></article>)}</div> : <EmptyPage icon={<ListVideo size={26}/>} title="아직 생성된 영상이 없습니다" text="플레이그라운드에서 사진을 추가하고 첫 영상을 만들어 보세요." action={() => navigate('playground')}/>}
      </>}
      {page === 'lounge' && <EmptyPage icon={<Radio size={26}/>} title="라운지 화면은 계정 서비스가 필요합니다" text="공개 데모는 로그인과 조직별 라운지 목록을 제공하지 않습니다. 영상 제작은 플레이그라운드에서 사용할 수 있습니다." action={() => navigate('playground')}/>}
      {page === 'transactions' && <EmptyPage icon={<Gauge size={26}/>} title="거래 내역을 연결하지 않았습니다" text="이 앱은 원본 계정의 결제 정보나 크레딧을 읽지 않습니다. 브라우저 로컬 렌더링은 크레딧을 사용하지 않습니다." action={() => navigate('overview')}/>}
      {page === 'keys' && <EmptyPage icon={<Code2 size={26}/>} title="API 키를 공개 앱에 보관하지 않습니다" text="브라우저 앱은 비밀 키를 안전하게 저장할 수 없으므로 API 키 생성·관리 화면은 제공하지 않습니다." action={() => setShowCode(true)}/>}
      {page === 'tenants' && <EmptyPage icon={<Layers3 size={26}/>} title="하위 계정 관리는 계정 서버가 필요합니다" text="조직·멤버 권한 관리 기능은 공개 정적 앱과 연결되지 않습니다." action={() => navigate('overview')}/>}

      <footer className="site-footer"><div><a className="wordmark footer-wordmark" href="#overview" onClick={event => { event.preventDefault(); navigate('overview'); }}><span>Catalog</span><b>Reel</b></a><p>차량 정보와 사진으로 완성도 높은 영상을 만들어 보세요.</p><small>© 2026 CatalogReel · 공개 로컬 데모</small></div><div className="footer-column"><b>제품</b><button onClick={() => navigate('playground')}>플레이그라운드</button><button onClick={() => navigate('videos')}>내 영상</button><button onClick={() => toast('문서 페이지는 준비 중입니다.')}>문서</button></div><div className="footer-column"><b>콘솔</b><button onClick={() => navigate('overview')}>개요</button><button onClick={() => navigate('transactions')}>거래 내역</button><button onClick={() => navigate('keys')}>API 키</button></div><div className="footer-column"><b>안내</b><button onClick={() => toast('공개 데모는 계정 연동이 없습니다.')}>계정 연동</button><button onClick={() => toast('업로드한 사진은 브라우저에서만 처리합니다.')}>개인정보</button></div></footer>
    </main>

    <nav className="mobile-bottom">{[['overview', '개요', <Gauge size={19}/>], ['playground','만들기',<Sparkles size={19}/>], ['videos','영상',<Film size={19}/>], ['transactions','내역',<MoreHorizontal size={19}/>]].map(([key,label,icon]) => <button key={key} className={page === key ? 'active' : ''} onClick={() => navigate(key)}>{icon}<span>{label}</span></button>)}</nav>
    <canvas ref={canvasRef} className="hidden-canvas"/>
    {notice && <div className="toast" role="status"><Info size={16}/><span>{notice}</span><IconButton title="닫기" onClick={() => setNotice('')}><X size={15}/></IconButton></div>}
    {showCode && <div className="dialog-backdrop" onClick={event => event.target === event.currentTarget && setShowCode(false)}><section className="dialog"><header><div><Code2 size={18}/><strong>영상 설정 JSON</strong></div><IconButton title="닫기" onClick={() => setShowCode(false)}><X size={18}/></IconButton></header><p>현재 제작 설정을 복사해 개발 작업에 활용할 수 있습니다. 인증 정보는 포함되지 않습니다.</p><pre>{codeText}</pre><button className="primary full-button" onClick={copyCode}><Clipboard size={16}/> JSON 복사</button></section></div>}
    {showPreview && video && <div className="dialog-backdrop" onClick={event => event.target === event.currentTarget && setShowPreview(false)}><section className="dialog video-dialog"><header><div><Film size={18}/><strong>영상 미리보기</strong></div><IconButton title="닫기" onClick={() => setShowPreview(false)}><X size={18}/></IconButton></header><div className="video-preview-frame"><video src={video.url} controls autoPlay playsInline/></div><div className="preview-meta"><span><CarFront size={15}/>{video.title}</span><span>{photos.length}장 · {video.aspect}</span></div><button className="download-full" onClick={() => downloadVideo(video)}><Download size={17}/> {video.type === 'video/mp4' ? 'MP4' : 'WebM'} 다운로드</button></section></div>}
  </div>;
}

function downloadVideo(video) {
  const anchor = document.createElement('a'); anchor.href = video.url; anchor.download = `${video.title.replaceAll(' ', '-')}-catalogreel.${video.type === 'video/mp4' ? 'mp4' : 'webm'}`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
}

function EmptyPage({ icon, title, text, action }) {
  return <section className="empty-page"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{text}</p><button className="primary" onClick={action}>계속하기 <ArrowRight size={15}/></button></section>;
}

export { App };

