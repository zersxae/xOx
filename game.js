class XOXGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.difficulty = 'impossible';
        this.scores = { player: 0, ai: 0 };
        this.isProcessing = false;
        this.winStreak = 0;
        this.username = '';
        this.achievements = {
            firstWin: false,
            streak: false,
            impossible: false,
            master: false,
            draw: false
        };
        
        // Hile modları
        this.cheatModes = {
            win: false,
            nyan: false,
            party: false,
            ghost: false,
            pixel: false,
            retro: false,
            glitch: false,
            ultra: false,
            ninja: false,
            turbo: false,
            power: false
        };
        
        // Bot mesajları
        this.botMessages = {
            thinking: [
                "Hmm... 🤔",
                "Düşünüyorum... ⚡",
                "İyi hamle! 👏",
                "Bunu beklemiyordum! 😮",
                "İlginç bir strateji... 🧐"
            ],
            winning: [
                "Çok kolaydı! 😎",
                "Bir dahaki sefere şansını dene! 🎮",
                "Yapay zeka üstünlüğü! 🤖",
                "Daha çok pratik yapmalısın! 📚",
                "Ben kazandım! 🏆"
            ],
            losing: [
                "İnanılmaz bir oyun! 👏",
                "Beni yendin! 🎉",
                "Tebrikler! 🌟",
                "Çok iyiydin! 💫",
                "Rövanş istiyorum! 🔄"
            ],
            draw: [
                "Berabere! İyi oyundu! 🤝",
                "Çekişmeli bir maçtı! ⚔️",
                "Bir daha oynayalım! 🎮",
                "İyi rakipsin! 🤜🤛",
                "Dengeli bir maç! ⚖️"
            ]
        };
        
        // Ses efektlerini güncelle
        this.sounds = {
            clickX: new Howl({
                src: ['https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3'],
                volume: 0.2
            }),
            clickO: new Howl({
                src: ['https://cdn.freesound.org/previews/240/240777_4107740-lq.mp3'],
                volume: 0.2
            }),
            win: new Howl({
                src: ['https://cdn.freesound.org/previews/536/536782_7124191-lq.mp3'],
                volume: 0.3
            }),
            lose: new Howl({
                src: ['https://cdn.freesound.org/previews/76/76376_1022651-lq.mp3'],
                volume: 0.3
            }),
            draw: new Howl({
                src: ['https://cdn.freesound.org/previews/242/242501_4414128-lq.mp3'],
                volume: 0.3
            }),
            cheat: new Howl({
                src: ['https://cdn.freesound.org/previews/242/242503_4414128-lq.mp3'],
                volume: 0.3
            })
        };

        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        // Bot zorluk seviyeleri ve stratejileri
        this.botStrategies = {
            impossible: {
                name: 'İmkansız Bot',
                taunts: [
                    'Beni yenemezsin!',
                    'Çok kolay oldu!',
                    'Bir daha dene!',
                    'Ben kazandım!',
                    'Yapay zeka üstünlüğü!'
                ]
            },
            easy: {
                name: 'Kolay Bot',
                taunts: [
                    'İyi oyundu!',
                    'Şansını dene!',
                    'Bu sefer kazanabilirsin!',
                    'Eğleniyor musun?',
                    'Tekrar deneyelim!'
                ]
            }
        };

        this.initializeGame();
        this.loadGameData();
        this.initializeSettings();
        this.initializeCheatCodes();
    }

    initializeGame() {
        // Oyun tahtası ve butonları seç
        this.cells = Array.from(document.querySelectorAll('.cell'));
        this.statusDisplay = document.getElementById('status');
        this.restartBtn = document.getElementById('restartBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');

        // Event listener'ları ekle
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());

        // Modalları kapatmak için dışarı tıklama
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });

        this.updateStatus();
        this.updateScores();

        // Başarımları yükle
        this.loadAchievements();
    }

    showBotMessage(type, duration = 2000) {
        const messages = this.botMessages[type];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const messageElement = document.getElementById('botMessage');
        
        messageElement.textContent = message;
        messageElement.classList.add('show');
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, duration);
    }

    handleCellClick(cell) {
        if (this.isProcessing) return;
        
        const index = cell.dataset.index;
        if (this.board[index] === '' && this.gameActive) {
            this.isProcessing = true;
            this.makeMove(index, 'X');
            
            if (this.gameActive) {
                setTimeout(() => {
                    this.aiMove();
                    this.isProcessing = false;
                }, 500);
            } else {
                this.isProcessing = false;
            }
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        
        if (player === 'X') {
            this.sounds.clickX.play();
        } else {
            this.sounds.clickO.play();
            this.showBotMessage('thinking');
        }

        if (this.checkWin(player)) {
            this.handleWin(player);
        } else if (!this.board.includes('')) {
            this.handleDraw();
        } else {
            this.currentPlayer = player === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }

    aiMove() {
        const index = this.getBestMove();
        this.makeMove(index, 'O');
    }

    getBestMove() {
        // Eğer kazanma modu aktifse, ilk boş hücreyi seç
        if (this.cheatModes.win) {
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === '') return i;
            }
        }

        if (this.difficulty === 'easy') {
            // Kolay modda %90 rastgele hamle yap
            if (Math.random() < 0.9) {
                const emptyCells = this.board.reduce((acc, cell, index) => {
                    if (cell === '') acc.push(index);
                    return acc;
                }, []);
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }

        // Minimax algoritması ile en iyi hamleyi bul
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        // Kazanan kontrolü
        if (this.checkWin('O')) return 10 - depth;
        if (this.checkWin('X')) return depth - 10;
        if (!board.includes('')) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWin(player) {
        return this.winPatterns.some(pattern => 
            pattern.every(index => this.board[index] === player)
        );
    }

    handleWin(player) {
        this.gameActive = false;
        if (player === 'X') {
            this.scores.player++;
            this.winStreak++;
            this.statusDisplay.textContent = 'Kazandın! 🎉';
            this.sounds.win.play();
            this.showBotMessage('losing');
            this.checkAchievements();
        } else {
            this.scores.ai++;
            this.winStreak = 0;
            this.statusDisplay.textContent = 'Kaybettin! 😈';
            this.sounds.lose.play();
            this.showBotMessage('winning');
        }
        this.highlightWinningCells(player);
        this.updateScores();
        this.saveGameData();
        
        if (player === 'X') {
            this.createConfetti();
        }
    }

    handleDraw() {
        this.gameActive = false;
        this.statusDisplay.textContent = 'Berabere!';
        this.sounds.draw.play();
        this.showBotMessage('draw');
        this.winStreak = 0;
        
        if (!this.achievements.draw) {
            this.achievements.draw = true;
            this.showNotification('Başarım Açıldı: Diplomatik! 🤝');
            this.showAchievementAnimation('draw');
        }
        
        this.updateAchievements();
        this.saveGameData();
    }

    highlightWinningCells(player) {
        this.winPatterns.forEach(pattern => {
            if (pattern.every(index => this.board[index] === player)) {
                pattern.forEach(index => this.cells[index].classList.add('win'));
            }
        });
    }

    updateStatus() {
        if (this.gameActive) {
            this.statusDisplay.textContent = this.currentPlayer === 'X' ? 
                'Sıra Sende' : 'Sıra Bilgisayarda';
        }
    }

    updateScores() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
        
        this.updateStatus();
    }

    openSettings() {
        this.settingsModal.classList.add('show');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    loadGameData() {
        const savedData = localStorage.getItem('xoxGameData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.scores = data.scores || { player: 0, ai: 0 };
            this.updateScores();
        }
    }

    saveGameData() {
        const data = {
            scores: this.scores
        };
        localStorage.setItem('xoxGameData', JSON.stringify(data));
    }

    initializeSettings() {
        const resetDataBtn = document.getElementById('resetDataBtn');
        const themeSelect = document.getElementById('themeSelect');
        const animationsToggle = document.getElementById('animationsToggle');
        const cheatSelect = document.getElementById('cheatSelect');

        resetDataBtn.addEventListener('click', () => {
            if (confirm('Tüm veriler sıfırlanacak. Emin misiniz?')) {
                localStorage.removeItem('xoxGameData');
                localStorage.removeItem('username');
                localStorage.removeItem('achievements');
                this.scores = { player: 0, ai: 0 };
                this.achievements = {
                    firstWin: false,
                    streak: false,
                    impossible: false,
                    master: false,
                    draw: false
                };
                this.username = '';
                this.updateScores();
                this.updateAchievements();
                this.updatePlayerName();
                this.restartGame();
                this.closeSettingsModal();
                this.showUsernameModal();
            }
        });

        themeSelect.addEventListener('change', (e) => {
            document.body.setAttribute('data-theme', e.target.value);
            localStorage.setItem('theme', e.target.value);
        });

        animationsToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('no-animations', !e.target.checked);
            localStorage.setItem('animations', e.target.checked);
        });

        // Hile kodları menüsü
        cheatSelect.addEventListener('change', (e) => {
            const code = e.target.value;
            if (code) {
                const codes = {
                    'nyan': () => this.toggleCheatMode('nyan'),
                    'party': () => this.toggleCheatMode('party'),
                    'ghost': () => this.toggleCheatMode('ghost'),
                    'pixel': () => this.toggleCheatMode('pixel'),
                    'retro': () => this.toggleCheatMode('retro'),
                    'glitch': () => this.toggleCheatMode('glitch'),
                    'ultra': () => this.toggleCheatMode('ultra'),
                    'ninja': () => this.toggleCheatMode('ninja'),
                    'turbo': () => this.toggleCheatMode('turbo'),
                    'power': () => this.toggleCheatMode('power'),
                    'kolay': () => this.setEasyMode(),
                    'kazan': () => this.toggleWinMode(),
                    'süperkolay': () => this.setSuperEasyMode()
                };
                if (codes[code]) {
                    codes[code]();
                }
            }
        });

        // Kayıtlı ayarları yükle
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const savedAnimations = localStorage.getItem('animations') !== 'false';
        
        themeSelect.value = savedTheme;
        animationsToggle.checked = savedAnimations;
        document.body.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('no-animations', !savedAnimations);
    }

    initializeCheatCodes() {
        let buffer = '';
        const codes = {
            'nyan': () => this.toggleCheatMode('nyan'),
            'party': () => this.toggleCheatMode('party'),
            'ghost': () => this.toggleCheatMode('ghost'),
            'pixel': () => this.toggleCheatMode('pixel'),
            'retro': () => this.toggleCheatMode('retro'),
            'glitch': () => this.toggleCheatMode('glitch'),
            'ultra': () => this.toggleCheatMode('ultra'),
            'ninja': () => this.toggleCheatMode('ninja'),
            'turbo': () => this.toggleCheatMode('turbo'),
            'power': () => this.toggleCheatMode('power'),
            'kolay': () => this.setEasyMode(),
            'kazan': () => this.toggleWinMode(),
            'süperkolay': () => this.setSuperEasyMode()
        };

        document.addEventListener('keydown', (e) => {
            buffer += e.key.toLowerCase();
            Object.keys(codes).forEach(code => {
                if (buffer.includes(code)) {
                    codes[code]();
                    buffer = '';
                }
            });

            if (buffer.length > 20) buffer = '';
        });
    }

    toggleCheatMode(mode) {
        this.cheatModes[mode] = !this.cheatModes[mode];
        const container = document.querySelector('.container');
        this.sounds.cheat.play();
        
        // Tüm hile modu classlarını temizle
        Object.keys(this.cheatModes).forEach(m => {
            container.classList.remove(m + '-mode');
        });

        // Aktif hile modlarını uygula
        Object.entries(this.cheatModes).forEach(([m, active]) => {
            if (active) container.classList.add(m + '-mode');
        });

        this.showNotification(`${mode.toUpperCase()} modu ${this.cheatModes[mode] ? 'aktif' : 'deaktif'}`);
    }

    toggleWinMode() {
        this.cheatModes.win = !this.cheatModes.win;
        this.sounds.cheat.play();
        this.showNotification(`Kazanma Modu: ${this.cheatModes.win ? 'Aktif 🏆' : 'Deaktif'}`);
    }

    setSuperEasyMode() {
        this.difficulty = 'easy';
        this.sounds.cheat.play();
        // Tüm hile modlarını kapat
        Object.keys(this.cheatModes).forEach(mode => {
            this.cheatModes[mode] = false;
        });
        // Kazanma modunu aç
        this.cheatModes.win = true;
        this.showNotification('Süper Kolay Mod Aktif! 🎮');
    }

    setEasyMode() {
        this.difficulty = this.difficulty === 'impossible' ? 'easy' : 'impossible';
        this.sounds.cheat.play();
        // Eğer kolay moda geçildiyse, kazanma şansını artır
        if (this.difficulty === 'easy') {
            this.showNotification('Kolay Mod Aktif! 🎮 (90% Kazanma Şansı)');
        } else {
            this.showNotification('İmkansız Mod Aktif! 😈');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    checkAchievements() {
        // İlk zafer
        if (!this.achievements.firstWin) {
            this.achievements.firstWin = true;
            this.showNotification('Başarım Açıldı: İlk Zafer! 🏆');
            this.showAchievementAnimation('first-win');
        }

        // 3'lü seri
        if (this.winStreak >= 3 && !this.achievements.streak) {
            this.achievements.streak = true;
            this.showNotification('Başarım Açıldı: Seri Katil! 🔥');
            this.showAchievementAnimation('streak');
        }

        // İmkansız modda kazanma
        if (this.difficulty === 'impossible' && !this.achievements.impossible) {
            this.achievements.impossible = true;
            this.showNotification('Başarım Açıldı: İmkansızı Başaran! ⭐');
            this.showAchievementAnimation('impossible');
        }

        // 10 zafer
        if (this.scores.player >= 10 && !this.achievements.master) {
            this.achievements.master = true;
            this.showNotification('Başarım Açıldı: Usta Oyuncu! 👑');
            this.showAchievementAnimation('master');
        }

        this.updateAchievements();
        this.saveAchievements();
    }

    showAchievementAnimation(achievementId) {
        const element = document.getElementById(`achievement-${achievementId}`);
        const modalElement = document.getElementById(`modal-achievement-${achievementId}`);
        
        if (element) {
            element.classList.add('unlocked');
            this.sounds.cheat.play();
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }

        if (modalElement) {
            modalElement.classList.add('unlocked');
            modalElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                modalElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateAchievements() {
        Object.entries(this.achievements).forEach(([key, value]) => {
            const element = document.getElementById(`achievement-${key}`);
            if (element) {
                if (value) {
                    element.classList.add('unlocked');
                } else {
                    element.classList.remove('unlocked');
                }
            }
        });
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            this.achievements = JSON.parse(saved);
            this.updateAchievements();
        }
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    openAchievements() {
        this.achievementsModal.classList.add('show');
        this.updateModalAchievements();
    }

    closeAchievementsModal() {
        this.achievementsModal.classList.remove('show');
    }

    updateModalAchievements() {
        Object.entries(this.achievements).forEach(([key, value]) => {
            const element = document.getElementById(`modal-achievement-${key}`);
            if (element) {
                if (value) {
                    element.classList.add('unlocked');
                } else {
                    element.classList.remove('unlocked');
                }
            }
        });
    }
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    window.game = new XOXGame();
});