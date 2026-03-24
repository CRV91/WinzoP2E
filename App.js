// Khai báo các biến từ cửa sổ trình duyệt (đã nạp qua CDN)
const { useState, useEffect } = React;
const { 
  Trophy, Star, Swords, LayoutGrid, Award, 
  Home, User, Globe, Grid3X3, Copy, 
  CheckCircle2, Zap, Settings, ChevronRight 
} = lucide;

const tg = window.Telegram?.WebApp;

const TRANSLATIONS = {
  vi: {
    brand: "WINZO", lobby: "Sảnh Game", profile: "Cá nhân",
    search_opponent: "Đang ghép trận...", match_found: "Đã tìm thấy đối thủ!",
    victory: "CHIẾN THẮNG!", defeat: "THẤT BẠI", balance: "Số dư", rank: "Hạng",
    affiliate_title: "Mời bạn bè", copy: "Sao chép mã", game_names: {
      chess: "Cờ Vua", xiangqi: "Cờ Tướng", go: "Cờ Vây", caro: "Cờ Caro"
    }
  },
  en: {
    brand: "WINZO", lobby: "Lobby", profile: "Profile",
    search_opponent: "Matching...", match_found: "Opponent Found!",
    victory: "VICTORY!", defeat: "DEFEAT", balance: "Balance", rank: "Rank",
    affiliate_title: "Invite Friends", copy: "Copy Code", game_names: {
      chess: "Chess", xiangqi: "Xiangqi", go: "Go", caro: "Gomoku"
    }
  }
};

const GAME_MODES = [
  { id: 'chess', icon: <Swords size={18} /> },
  { id: 'xiangqi', icon: <Award size={18} /> },
  { id: 'go', icon: <LayoutGrid size={18} /> },
  { id: 'caro', icon: <Grid3X3 size={18} /> },
];

const TOURNAMENTS = [
  { id: 1, name: 'Solo Beginner', fee: 100, prize: 180, players: 2 },
  { id: 2, name: 'Pro Battle', fee: 500, prize: 900, players: 2 },
  { id: 3, name: 'King Arena', fee: 1000, prize: 1800, players: 2 },
];

const App = () => {
  const [lang, setLang] = useState('vi');
  const [view, setView] = useState('lobby');
  const [selectedGame, setSelectedGame] = useState(GAME_MODES[0]);
  const [userStars, setUserStars] = useState(2500);
  const [gameStatus, setGameStatus] = useState('searching');
  const [isWinner, setIsWinner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teleUser, setTeleUser] = useState(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setTeleUser(tg.initDataUnsafe?.user);
      tg.headerColor = '#050608';
    }
  }, []);

  const handleJoinGame = (tourney) => {
    if (userStars < tourney.fee) {
      tg?.showPopup({ message: "Bạn không đủ Stars!" });
      return;
    }
    setUserStars(prev => prev - tourney.fee);
    setGameStatus('searching');
    setView('matchmaking');
    
    setTimeout(() => {
      setGameStatus('found');
      tg?.HapticFeedback?.notificationOccurred('warning');
      
      setTimeout(() => {
        const win = Math.random() > 0.5;
        setIsWinner(win);
        setGameStatus('result');
        if (win) {
          setUserStars(p => p + tourney.prize);
          tg?.HapticFeedback?.notificationOccurred('success');
        } else {
          tg?.HapticFeedback?.notificationOccurred('error');
        }
      }, 3000);
    }, 2000);
  };

  const Lobby = () => (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center bg-gray-900/50 p-4 rounded-3xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={20} className="fill-white text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter">{t.brand}</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/20">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-yellow-500">{userStars.toLocaleString()}</span>
        </div>
      </header>
      <div className="grid grid-cols-4 gap-2 bg-gray-900 p-1 rounded-2xl">
        {GAME_MODES.map((game) => (
          <button 
            key={game.id} 
            onClick={() => {setSelectedGame(game); tg?.HapticFeedback?.selectionChanged();}}
            className={`flex flex-col items-center py-3 rounded-xl transition-all ${selectedGame.id === game.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            {game.icon}
            <span className="text-[10px] mt-1 font-bold">{t.game_names[game.id]}</span>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {TOURNAMENTS.map((tr) => (
          <div key={tr.id} className="bg-gray-800/30 border border-white/5 rounded-3xl p-4 flex items-center justify-between group active:scale-95 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{tr.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Phí: {tr.fee} ⭐</p>
              </div>
            </div>
            <button 
              onClick={() => handleJoinGame(tr)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20"
            >
              {tr.prize} ⭐
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const Matchmaking = () => (
    <div className="fixed inset-0 bg-[#050608] z-50 flex flex-col items-center justify-center p-6 text-center">
      {gameStatus === 'searching' && (
        <div className="space-y-6">
          <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-black italic animate-pulse">{t.search_opponent}</h2>
        </div>
      )}
      {gameStatus === 'found' && (
        <div className="flex items-center gap-8">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl border-4 border-white/10 overflow-hidden flex items-center justify-center">
              {teleUser?.photo_url ? <img src={teleUser.photo_url} alt="me" /> : <User size={40} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">BẠN</p>
          </div>
          <div className="text-4xl font-black italic text-blue-500">VS</div>
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-red-600 rounded-3xl border-4 border-white/10 flex items-center justify-center">
              <User size={40} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">ĐỐI THỦ</p>
          </div>
        </div>
      )}
      {gameStatus === 'result' && (
        <div className="w-full max-w-sm space-y-8">
          <div className={`p-10 rounded-[3rem] border-4 ${isWinner ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <h2 className={`text-5xl font-black mb-2 ${isWinner ? 'text-green-500' : 'text-red-500'}`}>{isWinner ? 'WIN' : 'LOSE'}</h2>
            <p className="text-gray-400 font-medium">{isWinner ? 'Bạn đã thắng trận đấu!' : 'Hẹn gặp lại bạn lần sau'}</p>
          </div>
          <button onClick={() => setView('lobby')} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg">XÁC NHẬN</button>
        </div>
      )}
    </div>
  );

  const Profile = () => (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-8">
        <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] border-4 border-gray-900 shadow-2xl overflow-hidden mb-4">
          {teleUser?.photo_url ? <img src={teleUser.photo_url} className="w-full h-full object-cover" alt="ava" /> : <User size={48} className="m-auto mt-6" />}
        </div>
        <h2 className="text-2xl font-black">{teleUser?.first_name || "Player_Winzo"}</h2>
        <span className="bg-blue-500/10 text-blue-500 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mt-2">Level 12 • Pro</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 p-5 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase mb-1">{t.balance}</p>
          <p className="text-xl font-black text-yellow-500">{userStars.toLocaleString()} ⭐</p>
        </div>
        <div className="bg-gray-900 p-5 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-black uppercase mb-1">{t.rank}</p>
          <p className="text-xl font-black text-blue-500">#1,240</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-blue-500/30 pb-24">
      {view === 'lobby' && <Lobby />}
      {view === 'matchmaking' && <Matchmaking />}
      {view === 'profile' && <Profile />}
      <nav className="fixed bottom-6 left-6 right-6 bg-gray-900/80 backdrop-blur-xl border border-white/10 h-20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl z-40">
        <button onClick={() => setView('lobby')} className={`p-4 rounded-2xl transition-all ${view === 'lobby' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
          <Home size={24} />
        </button>
        <button onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')} className="p-4 text-gray-500 active:text-white">
          <Globe size={24} />
        </button>
        <button onClick={() => setView('profile')} className={`p-4 rounded-2xl transition-all ${view === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
          <User size={24} />
        </button>
      </nav>
    </div>
  );
};

// Gán vào biến toàn cục window để index.html truy cập được
window.App = App;
