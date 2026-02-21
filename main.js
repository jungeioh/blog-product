/* main.js - 대박 로또 with Theme Support and Bonus Numbers */
const generateBtn = document.getElementById('generate-btn');
const numbersContainer = document.getElementById('numbers-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Lotto Round Calculation
function getCurrentRound() {
    const firstDrawDate = new Date('2002-12-07T20:00:00'); // Round 1
    const now = new Date();
    const diffTime = Math.abs(now - firstDrawDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Use floor for full days
    return Math.floor(diffDays / 7) + 1;
}

const currentRound = getCurrentRound();
const roundEl = document.getElementById('current-round');
if (roundEl) roundEl.textContent = `${currentRound}회`;

// Theme Logic
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcons(theme);
});

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

generateBtn.addEventListener('click', () => {
    generateLottoRows();
});

function generateLottoRows() {
    numbersContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        generateLottoNumbers(i);
    }
}

function generateLottoNumbers(rowIndex) {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const mainNumbers = Array.from(numbers).sort((a, b) => a - b);
    
    // Generate 1 bonus number that doesn't overlap with main numbers
    let bonusNumber;
    do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
    } while (numbers.has(bonusNumber));

    displayNumbers(mainNumbers, bonusNumber, rowIndex);
}

function displayNumbers(mainNumbers, bonusNumber, rowIndex) {
    const rowEl = document.createElement('div');
    rowEl.classList.add('number-row');
    
    // Display main numbers
    mainNumbers.forEach((number, index) => {
        const numberEl = createNumberElement(number, rowIndex, index);
        rowEl.appendChild(numberEl);
    });

    // Add "+" separator
    const plusEl = document.createElement('div');
    plusEl.classList.add('plus-sign');
    plusEl.textContent = '+';
    plusEl.style.animationDelay = `${rowIndex * 0.2 + 0.6}s`;
    rowEl.appendChild(plusEl);

    // Display bonus number
    const bonusEl = createNumberElement(bonusNumber, rowIndex, 6, true);
    rowEl.appendChild(bonusEl);

    numbersContainer.appendChild(rowEl);
}

function createNumberElement(number, rowIndex, index, isBonus = false) {
    const numberEl = document.createElement('div');
    numberEl.classList.add('number');
    if (isBonus) numberEl.classList.add('bonus');
    numberEl.textContent = number;
    numberEl.style.backgroundColor = getNumberColor(number);
    numberEl.style.animationDelay = `${rowIndex * 0.2 + index * 0.1}s`;
    return numberEl;
}

function getNumberColor(number) {
    const hue = (number / 45) * 360;
    return `oklch(65% 0.15 ${hue})`;
}

// Initial generation
generateLottoRows();

// Tab Switching Logic
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        // Update Buttons
        navBtns.forEach(nb => nb.classList.remove('active'));
        btn.classList.add('active');
        
        // Update Sections
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});

// Form Submission handling (UX improvement)
const inquiryForm = document.getElementById('inquiry-form');
inquiryForm.addEventListener('submit', (e) => {
    // Formspree handles the actual POST, we just add a small UI feedback
    setTimeout(() => {
        inquiryForm.reset();
        alert('상담 신청이 정상적으로 접수되었습니다. 곧 풀이 결과를 전달해 드리겠습니다!');
    }, 1000);
});

/* --- Face Analysis Logic --- */
const faceBtn = document.getElementById('face-btn');
const cameraModal = document.getElementById('camera-modal');
const closeCamera = document.getElementById('close-camera');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const cameraStatus = document.getElementById('camera-status');
const scanLine = document.querySelector('.scan-line');
let stream = null;

// Open Camera
faceBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        video.srcObject = stream;
        cameraModal.style.display = 'flex';
        setTimeout(() => cameraModal.classList.add('show'), 10);
        cameraStatus.textContent = "얼굴을 화면에 맞춰주세요";
    } catch (err) {
        alert("카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
        console.error(err);
    }
});

// Close Camera
closeCamera.addEventListener('click', stopCamera);
window.addEventListener('click', (e) => {
    if (e.target === cameraModal) stopCamera();
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    cameraModal.classList.remove('show');
    setTimeout(() => {
        cameraModal.style.display = 'none';
        scanLine.style.display = 'none';
        captureBtn.disabled = false;
        captureBtn.textContent = "촬영 및 분석";
    }, 300);
}

// Capture & Analyze
captureBtn.addEventListener('click', () => {
    if (!stream) return;

    // Start Scanning Effect
    scanLine.style.display = 'block';
    captureBtn.disabled = true;
    captureBtn.textContent = "관상 분석 중...";
    cameraStatus.textContent = "얼굴 특징을 추출하고 있습니다...";

    // Capture Frame immediately
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simulate Analysis Delay
    setTimeout(() => {
        // Generate numbers based on pixel data (Simulation)
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let pixelSum = 0;
        // Sample pixels to create a seed
        for (let i = 0; i < frameData.length; i += 500) {
            pixelSum += frameData[i];
        }

        generateFaceLottoRows(pixelSum);
        
        stopCamera();
        alert("관상 분석이 완료되었습니다! 당신의 얼굴에 숨겨진 행운의 번호입니다.");
        
        // Ensure we show the lotto section
        document.querySelector('[data-target="lotto-section"]').click();

    }, 3000); // 3-second scan simulation
});

function generateFaceLottoRows(seed) {
    numbersContainer.innerHTML = '';
    
    // Use the seed to add entropy to Math.random()
    // This is a fun simulation, so we just re-run the generator 
    // but seeded with intent.
    for (let i = 0; i < 5; i++) {
        // We pass the seed to modify the 'randomness' slightly if we had a seeded RNG
        // For now, we just generate fresh numbers which feels like a result.
        generateLottoNumbers(i); 
    }
}
