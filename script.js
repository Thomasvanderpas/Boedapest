// ================================
        // TAB FUNCTIONALITY
        // ================================
        function switchTab(tabName) {
            // Verberg alle tab-inhoud
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Verwijder active class van alle knoppen
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });

            // Toon geselecteerde tab
            const tabContent = document.getElementById(tabName);
            if (tabContent) {
                tabContent.classList.add('active');
            }

            // Voeg active class toe aan geklikte knop
            if (event && event.target) {
                event.target.classList.add('active');
            }
        }

        // ================================
        // COUNTDOWN FUNCTIONALITY
        // ================================
        const targetDate = new Date('2025-08-15T17:00:00');

        function updateCountdown() {
            const now = new Date();
            const timeLeft = targetDate - now;

            if (timeLeft <= 0) {
                // Countdown afgelopen
                document.getElementById('countdownTimer').style.display = 'none';
                document.getElementById('week5Tasks').style.display = 'block';
                document.querySelector('.countdown-title').textContent = 'Countdown Afgelopen!';

                // Toon de Scorebord-tabknop
                const scoreboardTab = document.getElementById('scoreboardTab');
                if (scoreboardTab) {
                    scoreboardTab.style.display = 'inline-block';
                }

                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }

        // Start countdown updates
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Eerste call

        // ================================
        // EXISTING SCOREBOARD FUNCTIONALITY
        // ================================
        const currentRound = 1;

        const playersData = {
            "Willem": [],
            "Niels": [],
            "Daan": [],
            "Rutger": [],
            "Mark": [],
            "Rogier": []
        };

        let previousRankings = {};

        function calculatePlayerScores() {
            const scores = {};
            
            Object.keys(playersData).forEach(playerName => {
                const playerTasks = playersData[playerName];
                const totalScore = playerTasks.reduce((sum, task) => sum + task.points, 0);
                
                const currentRoundTasks = playerTasks.filter(task => task.week === currentRound);
                const currentRoundScore = currentRoundTasks.reduce((sum, task) => sum + task.points, 0);
                
                scores[playerName] = {
                    total: totalScore,
                    currentRound: currentRoundScore,
                    tasks: playerTasks
                };
            });
            
            return scores;
        }

        function createRankings(scores) {
            return Object.entries(scores)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([name, data], index) => ({
                    position: index + 1,
                    name: name,
                    ...data
                }));
        }

        function getPositionChange(playerName, currentPosition) {
            if (!previousRankings[playerName]) return null;
            
            const previousPosition = previousRankings[playerName];
            const change = previousPosition - currentPosition;
            
            if (change > 0) return { direction: 'up', amount: change };
            if (change < 0) return { direction: 'down', amount: Math.abs(change) };
            return null;
        }

        function getPositionClass(position) {
            switch(position) {
                case 1: return 'gold';
                case 2: return 'silver';
                case 3: return 'bronze';
                default: return 'regular';
            }
        }

        function renderScoreboard() {
            const scores = calculatePlayerScores();
            const rankings = createRankings(scores);
            const playersList = document.getElementById('playersList');
            
            document.getElementById('currentRound').textContent = currentRound;
            
            playersList.innerHTML = '';
            
            rankings.forEach(player => {
                const positionChange = getPositionChange(player.name, player.position);
                
                const playerRow = document.createElement('div');
                playerRow.className = 'player-row';
                playerRow.onclick = () => togglePlayerDetails(player.name);
                
                playerRow.innerHTML = `
                    <div class="position">
                        <div class="position-badge ${getPositionClass(player.position)}">${player.position}</div>
                        ${positionChange ? `
                            <span class="position-change ${positionChange.direction}">
                                <span class="material-icons">
                                    ${positionChange.direction === 'up' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                                ${positionChange.amount}
                            </span>
                        ` : ''}
                    </div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-score">
                        <span class="total-score">${player.total}</span>
                        ${player.currentRound > 0 ? `<span class="round-score">+${player.currentRound}</span>` : ''}
                    </div>
                    <div class="player-details" id="details-${player.name}">
                        ${renderPlayerDetails(player.tasks)}
                    </div>
                `;
                
                playersList.appendChild(playerRow);
                
                previousRankings[player.name] = player.position;
            });
        }

        function renderPlayerDetails(tasks) {
            if (!tasks || tasks.length === 0) return '<p>Nog geen taken voltooid.</p>';
            
            const sortedTasks = [...tasks].sort((a, b) => a.week - b.week);
            
            return `
                <div class="details-header">
                    <div>Week</div>
                    <div>Opdracht</div>
                    <div>Punten</div>
                    <div>Bewijs</div>
                </div>
                ${sortedTasks.map(task => `
                    <div class="detail-row">
                        <div class="week-number">${task.week}</div>
                        <div class="task-description">${task.task}</div>
                        <div class="points">${task.points} pt</div>
                        <div>
                            <button class="proof-media" onclick="openMedia('${task.proof}', '${task.proofType}', event)">
                                ${task.proofType === 'image' ? '📷 Foto' : '🎬 Video'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        function togglePlayerDetails(playerName) {
            const detailsElement = document.getElementById(`details-${playerName}`);
            const playerRow = detailsElement.closest('.player-row');
            
            document.querySelectorAll('.player-details.show').forEach(details => {
                if (details !== detailsElement) {
                    details.classList.remove('show');
                    details.closest('.player-row').classList.remove('expanded');
                }
            });
            
            detailsElement.classList.toggle('show');
            playerRow.classList.toggle('expanded');
        }

        function openMedia(mediaPath, mediaType, event) {
            if (event) {
                event.stopPropagation();
            }
            
            const modal = document.getElementById('mediaModal');
            const mediaContainer = document.getElementById('mediaContainer');
            
            if (mediaType === 'image') {
                mediaContainer.innerHTML = `<img src="${mediaPath}" alt="Bewijs foto">`;
            } else {
                mediaContainer.innerHTML = `
                    <video controls autoplay>
                        <source src="${mediaPath}" type="video/mp4">
                        Je browser ondersteunt geen video.
                    </video>
                `;
            }
            
            modal.style.display = 'block';
        }

        function closeMedia() {
            document.getElementById('mediaModal').style.display = 'none';
            document.getElementById('mediaContainer').innerHTML = '';
        }

        function activatePreviewMode() {
            const scoreboardTab = document.getElementById('scoreboardTab');
            if (scoreboardTab) {
                scoreboardTab.style.display = 'inline-block';
            }

            document.getElementById('countdownTimer').style.display = 'none';
            document.getElementById('week5Tasks').style.display = 'block';

            const title = document.querySelector('.countdown-title');
            title.textContent = 'Preview Mode Actief';
        }

        function showPasswordModal() {
            document.getElementById('passwordModal').style.display = 'block';
            document.getElementById('passwordInput').focus();
        }

        function closePasswordModal() {
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('passwordInput').value = '';
        }

        function checkPassword() {
            const password = document.getElementById('passwordInput').value;
            if (password === "NielsisKaal") {
                activatePreviewMode();
                closePasswordModal();
            } else {
                alert("Onjuist wachtwoord");
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        }

        // ================================
        // DOM CONTENT LOADED EVENT
        // ================================
        document.addEventListener('DOMContentLoaded', function () {
            renderScoreboard();

            document.querySelector('.close').onclick = closeMedia;

            document.getElementById('mediaModal').onclick = function (event) {
                if (event.target === this) {
                    closeMedia();
                }
            };

            // ✅ Preview button event listener - NU CORRECT GEPLAATST!
            const previewButton = document.getElementById('previewButton');
            if (previewButton) {
                previewButton.addEventListener('click', function () {
                    showPasswordModal();
                });
            }

            // Password modal Enter key support
            document.getElementById('passwordInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkPassword();
                }
            });

            // Close password modal when clicking outside
            document.getElementById('passwordModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closePasswordModal();
                }
            });
        });

        
    