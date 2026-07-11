require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { db } = require("./config/firebase");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const hopRoutes = require("./routes/hopRoutes");
const placeRoutes = require("./routes/placeRoutes");
const badgeRoutes = require("./routes/badgeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ===== 📂 画像フォルダ設定 =====
app.use('/images', express.static('/Users/kageshimariku/Lecture/syahunukedasitai'));

// ===== 💻 フロントエンド =====
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoppi | 今日を、ちょっとだけ新しく。</title>
        <style>
            :root {
                --mint: #7bc0a3;
                --cherry-pink: #f68b8b;
                --bg-beige: #fffdf9;
                --card-border: #e2f2eb;
                --text-dark: #4a5568;
                --text-sub: #718096;
                --rain-blue: #6ba4ce;
            }

            body { 
                font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; 
                background: linear-gradient(135deg, #fffdf9 0%, #f0f9f5 100%); 
                color: var(--text-dark); 
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                min-height: 100vh; 
                justify-content: center; 
                margin: 0; 
            }

            .card { 
                background: white; 
                padding: 30px; 
                border-radius: 28px; 
                box-shadow: 0 12px 30px rgba(123, 192, 163, 0.1); 
                max-width: 400px; 
                width: 100%; 
                margin-bottom: 20px; 
                box-sizing: border-box; 
                border: 2px solid var(--card-border);
                position: relative;
                overflow: hidden;
            }

            .card::before {
                content: "🍒";
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 20px;
                opacity: 0.3;
            }

            .text-center { text-align: center; }
            h1 { color: var(--mint); font-size: 24px; margin-bottom: 5px; font-weight: bold; letter-spacing: 0.05em; }
            h2 { color: var(--cherry-pink); font-size: 20px; margin-top: 10px; font-weight: bold; }
            p { color: var(--text-sub); font-size: 14px; line-height: 1.7; }
            
            label { font-size: 13px; font-weight: bold; color: var(--mint); display: block; text-align: left; margin-top: 18px; margin-left: 4px; }
            
            select, input, button { 
                width: 100%; 
                padding: 14px; 
                margin-top: 8px; 
                border-radius: 16px; 
                border: 2px solid var(--card-border); 
                box-sizing: border-box; 
                font-size: 14px; 
                transition: all 0.25s ease; 
                background-color: #fafdfc;
            }
            input:focus, select:focus { border-color: var(--mint); outline: none; background-color: white; }
            
            button { 
                background: linear-gradient(135deg, var(--mint) 0%, #96d1b7 100%); 
                color: white; 
                border: none; 
                font-weight: bold; 
                font-size: 16px;
                cursor: pointer; 
                box-shadow: 0 6px 16px rgba(123, 192, 163, 0.3);
                margin-top: 24px; 
            }
            button:hover { 
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(123, 192, 163, 0.4);
            }
            button:active { transform: translateY(0); }
            button:disabled { background: #cbd5e0; cursor: not-allowed; transform: none; box-shadow: none; }
            
            .btn-cherry {
                background: linear-gradient(135deg, var(--cherry-pink) 0%, #fca3a3 100%);
                box-shadow: 0 6px 16px rgba(246, 139, 139, 0.3);
            }
            .btn-cherry:hover {
                box-shadow: 0 8px 20px rgba(246, 139, 139, 0.4);
            }

            .status-badge { 
                background: #f7fbf9; 
                padding: 14px; 
                border-radius: 18px; 
                margin-top: 15px; 
                display: flex; 
                justify-content: space-around; 
                font-weight: bold; 
                color: var(--mint); 
                border: 2px dashed var(--mint);
            }
            .highlight { color: var(--cherry-pink); font-size: 22px; font-family: 'Arial Rounded MT Bold', sans-serif; }
            .switch-link { color: var(--cherry-pink); cursor: pointer; text-decoration: underline; font-size: 13px; margin-top: 18px; display: inline-block; font-weight: bold; }
            .hidden { display: none !important; }

            .char-avatar {
                height: 110px;
                width: auto;
                object-fit: contain;
                margin-bottom: 10px;
                display: inline-block;
                animation: bounce 2.2s infinite ease-in-out;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-8px) scale(0.98); }
            }

            .loader {
                border: 4px solid #e2f2eb;
                border-top: 4px solid var(--mint);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .location-box {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                padding: 15px;
                font-size: 13px;
                color: #166534;
                margin-top: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .location-box.rainy {
                background: #f0f7ff;
                border: 1px solid #bae6fd;
                color: #0369a1;
            }
            
            .route-btn {
                background: white;
                border: 2px solid var(--mint);
                color: var(--mint);
                padding: 10px 18px;
                border-radius: 14px;
                font-size: 13px;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                transition: all 0.2s ease;
                width: 100%;
                box-sizing: border-box;
            }
            .route-btn:hover {
                background: var(--mint);
                color: white;
            }
            .route-btn.rainy {
                border-color: var(--rain-blue);
                color: var(--rain-blue);
            }
            .route-btn.rainy:hover {
                background: var(--rain-blue);
                color: white;
            }

            .album-container {
                margin-top: 15px;
                max-height: 250px;
                overflow-y: auto;
                padding-right: 5px;
            }
            .album-item {
                background: #fdfdfd;
                border: 2px solid var(--card-border);
                border-radius: 18px;
                padding: 14px;
                margin-bottom: 12px;
                text-align: left;
                font-size: 13px;
                position: relative;
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .album-date {
                font-size: 11px;
                color: var(--text-sub);
                margin-bottom: 4px;
            }
            .album-title {
                font-weight: bold;
                color: var(--text-dark);
                font-size: 14px;
            }
            .album-comment {
                background: #f7fbf9;
                padding: 8px 12px;
                border-radius: 10px;
                margin-top: 6px;
                color: var(--text-dark);
                border-left: 3px solid var(--mint);
            }
            .album-mood {
                position: absolute;
                top: 14px;
                right: 14px;
                font-size: 18px;
            }
        </style>
    </head>
    <body>

        <!-- 🔐 1. 認証カード -->
        <div id="auth-section" class="card text-center">
            <img id="auth-avatar" class="char-avatar" src="/images/NormalM.png" alt="Hoppi">
            <h1 id="auth-title">Hoppi</h1>
            <p id="auth-subtitle">今日を、ちょっとだけ新しく。</p>
            
            <form id="auth-form">
                <div id="nickname-group" class="hidden">
                    <label>ニックネーム</label>
                    <input type="text" id="auth-nickname" placeholder="冒険者のなまえ（例: ミント）">
                </div>
                <label>いつもの最寄駅</label>
                <input type="text" id="auth-station" placeholder="例: 渋谷駅, 新宿駅" required>
                <label>メールアドレス</label>
                <input type="email" id="auth-email" placeholder="example@email.com" required>
                <label>パスワード</label>
                <input type="password" id="auth-password" placeholder="6文字以上" required>
                <button type="submit" id="auth-submit-btn">出発する 🗺️</button>
            </form>
            <div><span id="auth-switch" class="switch-link">はじめての人はこちら（アカウント作成）</span></div>
        </div>

        <!-- 📋 2. AI診断カード -->
        <div id="diagnostic-section" class="card text-center hidden">
            <img class="char-avatar" src="/images/HappyM.png" alt="Hoppi 診断中">
            <h1>きょうの寄り道診断</h1>
            <p>Hoppiがあなたの気分や予定に合わせて、<br>“ちょうどいい寄り道”を提案するよ！</p>
            
            <label>🌦️ いまの外の天気は？</label>
            <select id="diag-weather">
                <option value="sunny">☀️ 晴れ・くもり（お散歩日和！）</option>
                <option value="rainy">☔ 雨が降ってる（または降りそう…）</option>
            </select>

            <label>① 今日は忙しい予定や仕事がある？</label>
            <select id="diag-schedule">
                <option value="free">☕ いつも通り・またはお休みの日！</option>
                <option value="busy">🚨 めっちゃ忙しい！タスクが山積み！</option>
            </select>

            <label>② 今のエネルギー残量は？</label>
            <select id="diag-energy">
                <option value="high">🔋 体力MAX！どこまでも歩ける！</option>
                <option value="middle">🪫 ちょっとリフレッシュしたい気分</option>
                <option value="low">💤 ほぼゼロ…省エネで楽しみたい</option>
            </select>

            <label>③ どんな寄り道がしたい？</label>
            <select id="diag-type">
                <option value="food">🍰 美味しいものを開拓したい (カフェHop)</option>
                <option value="nature">🌳 お散歩して癒やされたい (のんびりHop)</option>
                <option value="shop">🛍️ 面白いものに出会いたい (発見Hop)</option>
            </select>

            <button id="start-diagnostic-btn">Hoppiに提案してもらう ✨</button>
        </div>

        <!-- ⏳ 3. AIミッション生成中カード -->
        <div id="loading-section" class="card text-center hidden">
            <img class="char-avatar" src="/images/NormalM.png" alt="Hoppi 考え中">
            <h1>Hoppiが考え中...</h1>
            <p id="loading-text">あなたの気分に合わせた最適な冒険を考えています...</p>
            <div class="loader"></div>
        </div>

        <!-- 🦉 4. メインの冒険カード -->
        <div id="main-section" class="hidden" style="width: 100%; max-width: 400px;">
            <div class="card text-center">
                <img id="main-avatar" class="char-avatar" src="/images/NormalM.png" alt="Hoppi 提案">
                <h1 id="main-header" style="color: var(--cherry-pink);">今日のご提案</h1>
                <h2 id="hop-title">新しいカフェに行こう</h2>
                <p id="hop-description">徒歩15分以内のカフェに入ってみよう！</p>
                
                <div id="location-container" class="location-box">
                    <div><span id="loc-emoji">📍</span> <span id="real-recommend-place" style="font-weight: bold;">最寄駅近くのスポットを探索中...</span></div>
                    <a id="route-link" href="#" target="_blank" class="route-btn hidden">🗺️ 経路を見る (Google Maps)</a>
                </div>

                <hr style="border: 0; border-top: 2px dashed var(--card-border); margin: 20px 0;">
                
                <label>今のきぶんは？</label>
                <select id="mood-select">
                    <option value="😊">😊 さいこう！めっちゃ気分転換になった</option>
                    <option value="🙂">🙂 なかなか楽しめたよ</option>
                    <option value="🥱">🥱 パタパタお疲れ！達成したよ</option>
                </select>
                <input type="text" id="comment-input" placeholder="思い出を一言残そう！">
                
                <button id="complete-btn" class="btn-cherry">思い出をアルバムに送る 🍒</button>
            </div>

            <div class="card text-center" style="padding: 20px;">
                <h3 style="margin: 0; color: var(--mint);">パートナー: <span id="display-nickname">ミント</span> 🐾 (<span id="display-station">---</span>駅周辺)</h3>
                <div class="status-badge">
                    <div>Lv: <span id="user-level" class="highlight">1</span></div>
                    <div>EXP: <span id="user-exp" class="highlight">0</span></div>
                </div>
            </div>

            <div class="card" style="padding: 24px;">
                <h3 style="margin: 0 0 10px 0; color: var(--mint); text-align: center;">📔 たまった思い出</h3>
                <div class="album-container" id="album-list">
                    <div class="album-item">
                        <div class="album-date">3日前 · カフェHop</div>
                        <div class="album-title">☕ 近所のパン屋さんで新作を買う</div>
                        <div class="album-mood">😊</div>
                        <div class="album-comment">おすすめのメロンパン、外カリカリで美味しかった！</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let userStation = "";
            let currentType = "food";
            let currentWeather = "sunny";

            const authSection = document.getElementById('auth-section');
            const diagnosticSection = document.getElementById('diagnostic-section');
            const loadingSection = document.getElementById('loading-section');
            const mainSection = document.getElementById('main-section');
            const authForm = document.getElementById('auth-form');
            const albumList = document.getElementById('album-list');

            // 🎒 ジャンルごとの基本キーワード設定
            const categoryBase = {
                food: { tag: "カフェHop", keyword: "カフェ" },
                nature: { tag: "のんびりHop", keyword: "公園" },
                shop: { tag: "発見Hop", keyword: "雑貨屋" }
            };

            // 🗺️ 【距離感マトリクス】
            const distanceMatrix = {
                rainy: {
                    high:   { text: "徒歩1分（ほぼ駅ナカ）", search: "駅ナカ" },
                    middle: { text: "徒歩2分（駅直結・アトレ内など）", search: "駅ビル" },
                    low:    { text: "徒歩0分（改札内・構内）", search: "改札内" }
                },
                sunny: {
                    busy: {
                        high:   { text: "徒歩3分（駅チカ）", search: "駅前" },
                        middle: { text: "徒歩5分（サクッと）", search: "" },
                        low:    { text: "徒歩2分（すぐそこ）", search: "駅チカ" }
                    },
                    free: {
                        high:   { text: "徒歩20分（ちょっと大冒険！）", search: "隠れ家" },
                        middle: { text: "徒歩10分（お散歩に最適）", search: "周辺" },
                        low:    { text: "徒歩4分（のんびりペース）", search: "近く" }
                    }
                }
            };

            // ✍️ 状況に応じたオリジナルミッション文章
            const missionMatrix = {
                food: { title: "新しいお気に入りカフェ開拓", desc: "いつもは通り過ぎる場所にあるお店をのぞいて、ホッと一息ついてみよう。" },
                nature: { title: "ココロを癒やす緑・空間めぐり", desc: "スマホをポケットにしまって、その場所にある景色や音に耳を傾けてみてね。" },
                shop: { title: "感性を刺激するモノ探し", desc: "「おっ」と目を引くデザインや、普段買わないようなアイテムをじっくり眺めてみよう。" }
            };

            authForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const nickname = document.getElementById('auth-nickname').value.trim() || "ミント";
                userStation = document.getElementById('auth-station').value.trim().replace(/駅$/, '');
                
                document.getElementById('display-nickname').innerText = nickname;
                document.getElementById('display-station').innerText = userStation;
                authSection.classList.add('hidden');
                diagnosticSection.classList.remove('hidden');
                return false;
            });

            const startDiagnosticBtn = document.getElementById('start-diagnostic-btn');
            startDiagnosticBtn.addEventListener('click', () => {
                diagnosticSection.classList.add('hidden');
                loadingSection.classList.remove('hidden');

                currentWeather = document.getElementById('diag-weather').value;
                const schedule = document.getElementById('diag-schedule').value;
                let energy = document.getElementById('diag-energy').value;
                currentType = document.getElementById('diag-type').value;

                if (currentWeather === "rainy") {
                    setTimeout(() => { document.getElementById('loading-text').innerText = "雨雲を回避しつつ、一番近いルートを計算中...☔"; }, 600);
                    setTimeout(() => { document.getElementById('loading-text').innerText = "「濡れない・すぐ着く」快適スポットを選定中...☕"; }, 1400);
                } else {
                    setTimeout(() => { document.getElementById('loading-text').innerText = "最寄りの「" + userStation + "駅」周辺のマップデータを解析中...🗺️"; }, 600);
                    setTimeout(() => { document.getElementById('loading-text').innerText = "あなたの体力にぴったりな距離を測っています...🏃"; }, 1400);
                }

                setTimeout(() => {
                    let distanceConfig;
                    let adjustNotice = "";

                    if (currentWeather === "rainy") {
                        distanceConfig = distanceMatrix.rainy[energy];
                        if (schedule === "busy") {
                            adjustNotice = "<br><br>⚠️ **Hoppiの気遣い**: 雨のうえに忙しそうだから、改札から一番近い超省エネルートにしたよ！";
                        } else {
                            adjustNotice = "<br><br>⚠️ **Hoppiの気遣い**: 今日は雨降りだから、傘をあまり開かなくていい駅直結エリアがおすすめ！";
                        }
                    } else {
                        distanceConfig = distanceMatrix.sunny[schedule][energy];
                        if (schedule === "busy") {
                            adjustNotice = "<br><br>⚠️ **Hoppiの気遣い**: 今日は忙しそうだから、晴れててもサクッと5分以内で寄れる場所にしたよ！";
                        }
                    }

                    const selectedMission = missionMatrix[currentType];
                    document.getElementById('hop-title').innerText = selectedMission.title;
                    document.getElementById('hop-description').innerHTML = selectedMission.desc + adjustNotice;

                    const baseInfo = categoryBase[currentType];
                    const destinationText = userStation + "駅 " + distanceConfig.text + "の" + baseInfo.keyword;
                    document.getElementById('real-recommend-place').innerText = "おすすめ: " + destinationText;

                    const searchQuery = userStation + "駅 " + distanceConfig.search + " " + baseInfo.keyword;
                    const mapUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(searchQuery);
                    
                    const routeLink = document.getElementById('route-link');
                    routeLink.href = mapUrl;
                    routeLink.classList.remove('hidden');

                    const mainHeader = document.getElementById('main-header');
                    const locContainer = document.getElementById('location-container');
                    const locEmoji = document.getElementById('loc-emoji');

                    if (currentWeather === "rainy") {
                        mainHeader.innerText = "☔ 雨の日のほっこり提案";
                        mainHeader.style.color = "var(--rain-blue)";
                        locContainer.className = "location-box rainy";
                        locEmoji.innerText = "🌧️";
                        routeLink.className = "route-btn rainy";
                        document.getElementById('main-avatar').src = "/images/RelaxM.png";
                    } else {
                        mainHeader.innerText = "今日のご提案";
                        mainHeader.style.color = "var(--cherry-pink)";
                        locContainer.className = "location-box";
                        locEmoji.innerText = "📍";
                        routeLink.className = "route-btn";
                        document.getElementById('main-avatar').src = "/images/CafeM.png";
                    }

                    loadingSection.classList.add('hidden');
                    mainSection.classList.remove('hidden');
                }, 2400);
            });

            // 🍒 思い出保存ロジック（バッククォートの入れ子問題を完全クリア！）
            const completeBtn = document.getElementById('complete-btn');
            completeBtn.addEventListener('click', async () => {
                completeBtn.disabled = true;
                const missionTitle = document.getElementById('hop-title').innerText;
                const userMood = document.getElementById('mood-select').value;
                const userComment = document.getElementById('comment-input').value || "楽しく寄り道できたよ！";

                alert('🐰「最高の一歩だね！思い出アルバムに保存したよ！」');
                
                document.getElementById('user-level').innerText = "1";
                document.getElementById('user-exp').innerText = "30";

                const newItem = document.createElement('div');
                newItem.className = 'album-item';
                const tagText = categoryBase[currentType].tag;
                
                // エラーの原因だったバッククォートをやめ、通常の文字列結合（+）で安全に組み立て！
                let htmlContent = "";
                htmlContent += '<div class="album-date">ただいま · ' + tagText + '</div>';
                htmlContent += '<div class="album-title">✨ ' + missionTitle + '</div>';
                htmlContent += '<div class="album-mood">' + userMood + '</div>';
                htmlContent += '<div class="album-comment">' + userComment + '</div>';
                
                newItem.innerHTML = htmlContent;
                
                albumList.insertBefore(newItem, albumList.firstChild);
                completeBtn.innerText = "今日の思い出保存完了！ 🎉";
            });
        </script>
    </body>
    </html>
  `);
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hops", hopRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/badges", badgeRoutes);

module.exports = app;