// 🔥 Firebase SDK에서 initializeApp 함수 가져오기
// Firebase 프로젝트를 웹 앱에 연결할 수 있게 해주는 핵심 함수.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
// 📦 Firestore(데이터베이스) 관련 함수들을 가져오기
import {
  getFirestore,       // Firestore 인스턴스를 가져오는 함수
  collection,         // 특정 컬렉션(테이블과 유사)을 참조하는 함수
  addDoc,             // 컬렉션에 새 문서를 추가할 때 사용하는 함수 
  getDocs,            // 컬렉션/쿼리 결과의 모든 문서를 가져올 때 사용하는 함수
  getDoc,             // 특정 문서의 데이터를 가져올 때 사용하는 함수
  query,              // Firestore에서 조건/정렬을 지정할 때 사용하는 함수
  orderBy,            // 쿼리 결과를 특정 필드 기준으로 정렬할 때 사용하는 함수
  serverTimestamp,    // 서버 시간을 필드 값으로 저장할 때 사용하는 함수
  deleteDoc,          // 특정 문서를 삭제할 때 사용하는 함수
  doc as firestoreDoc // 특정 문서 참조를 가져올 때 사용 (doc 이름을 firestoreDoc으로 바꿔서 사용)
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
// 🔑 Firebase Authentication(로그인/인증) 관련 함수들을 가져오기
import {
  getAuth,                     // Firebase Auth 인스턴스를 가져오는 함수
  signInWithEmailAndPassword,  // 이메일/비밀번호로 로그인할 때 사용
  onAuthStateChanged           // 로그인 상태 변화(로그인/로그아웃)를 실시간으로 감지하는 함수
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
// 🔧 Firebase 설정 및 초기화
// Firebase 콘솔에서 발급받은 프로젝트 설정값을 넣어야 함
const firebaseConfig = {
  apiKey: "AIzaSyA-CWXpFVzpV3aIzOcjCZo3KLtphyg7w4Q",  // Firebase 프로젝트의 API 키 (앱이 Firebase와 통신할 때 사용)
  authDomain: "mymobileweddingpagejeju.firebaseapp.com",  // Firebase Authentication에서 사용하는 도메인 주소
  projectId: "mymobileweddingpagejeju",                   // Firebase 프로젝트 고유 ID
  storageBucket: "mymobileweddingpagejeju.firebasestorage.app", // Firebase Storage(파일 저장소) 주소
  messagingSenderId: "290839972010",                  // Firebase Cloud Messaging(푸시 알림)에서 사용하는 발신자 ID
  appId: "1:290839972010:web:e86fdf43e2ef6f71ca68d3"  // Firebase 앱 고유 식별자 (웹 앱을 구분하는 ID)
};
// 🚀 Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
// 📦 Firestore 인스턴스 가져오기 (데이터베이스)
const db = getFirestore(app); 
// 🔑 Auth 인스턴스 가져오기 (로그인/인증)
const auth = getAuth(); 

// =======================
// DOM 요소 캐싱 (전역)
// =======================
const el = {
  guestName: document.getElementById("guestName"),
  guestMessage: document.getElementById("guestMessage"),
  guestPassword: document.getElementById("guestPassword"),
  sendBtn: document.getElementById("sendMessageBtn"),
  guestbookList: document.getElementById("guestbookList"),
  adminEmail: document.getElementById("adminEmail"),
  adminPassword: document.getElementById("adminPassword"),
  adminLoginBox: document.getElementById("adminLogin")
};

// 🗑️ 삭제 모달 관련 요소
const deleteModal = document.getElementById("deleteModal");
const deletePwInput = document.getElementById("deletePwInput");
const deleteError = document.getElementById("deleteError");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");


// 🔐 관리자 로그인 상태 감지
let isAdmin = false; //관리자 여부. 기본값은 false(로그인 안된 상태)

// 🗑️ 삭제할 대상 메시지 id 저장
let deleteTargetId = null;


onAuthStateChanged(auth, (user) => {
  // Firebase Auth에서 제공하는 함수.
  // 사용자의 로그인 상태(로그인/로그아웃)가 바뀔 때마다 자동으로 호출됨.
  // 'auth'는 getAuth(app)으로 초기화한 인증 객체.
  console.log("isAdmin 상태:", isAdmin);
  // 현재 isAdmin 값(관리자 여부)을 콘솔에 출력해서 디버깅 확인.
  console.log("로그인 상태:", user); 
  // 로그인된 사용자 정보(user 객체)를 콘솔에 출력
  // 로그인 안 되어 있으면 null이 출력됨.

  isAdmin = !!user;
  // user 객체가 존재하면 true, 없으면 false.
  // 즉 로그인 상태면 isAdmin = true, 로그아웃 상태면 isAdmin = false.

  loadGuestbook();
  // 로그인 상태가 바뀔 때마다 방명록을 다시 불러옴.
  // 관리자 여부에 따라 삭제 버튼을 보여줄지 말지 결정하기 위함.
});

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener("DOMContentLoaded", () => {
  // 1. 데이터 바인딩
  const introText = "저희 결혼합니다.";
  const weddingInvitation = "Wedding Invitation";
  const welcomeMessage1 = "믿음과 사랑으로 인연을 맺어";
  const welcomeMessage2 = "결혼이라는 새로운 출발을 하려 합니다.";
  const welcomeMessage3 = "함께 축복해 주신다면";
  const welcomeMessage4 = "한없는 기쁨으로 간직하겠습니다.";
  const welcomeMessage5 = "귀한 시간 내주시어";
  const welcomeMessage6 = "결혼식에 참석해 주셨으면 합니다.";
  const welcomeMessage7 = "감사드립니다.";
  const groomFullName = "이치종";
  const groomAccountBank = "카카오뱅크";
  const groomAccount = "3333-03-4753848";
  const brideFullName = "길신영";
  const brideAccountBank = "국민은행";
  const brideAccount = "484201-01-336538";
  const groomFirstName = groomFullName.slice(1);
  const brideFirstName = brideFullName.slice(1);
  const groomFatherFullName = "이영호";
  const groomFatherAccountBank = "농협은행";
  const groomFatherAccount = "352-8007-1972-73";
  const groomMotherFullName = "김애정";
  const groomMotherAccountBank = "기업은행";
  const groomMotherAccount = "198-071884-02-014";
  const brideFatherFullName = "길기용";
  const brideFatherAccountBank = "SC제일은행"; 
  const brideFatherAccount = "357-20-362811";
  const brideMotherFullName = "전영희";
  const brideMotherAccountBank = "국민은행";
  const brideMotherAccount = "023-21-0644-360";
  const weddingYear = "2026";
  const weddingMonth = "04";
  const weddingDay = "26";
  const weddingDayOfWeekEng = "Sun";
  const weddingDayOfWeekKor = "일";
  const weddingTimeZone = "AM";
  const weddingTimeZoneKor = "오전";
  const weddingHour = "11";
  const weddingMinute = "00";
  const weddingLocation = "밀리토피아호텔 바이마린";
  const weddingLocationDetail = "웨딩센터 2층 아이리스홀";
  const weddingLocationAddress1 = "경기도 성남시 수정구 위례대로 83";
  const weddingLocationAddress2 = "경기도 성남시 수정구 창곡동 566";
  const weddingLocationContact = "031-727-9350";

  
  const flower_arch_groom_bride_sitting           = "images/weddingPhoto/flower-arch-groom-bride-sitting.JPG";
  const flower_arch_groom_bride_standing          = "images/weddingPhoto/flower-arch-groom-bride-standing1.JPG";
  const flower_arch_groom_bride_standing2         = "images/weddingPhoto/flower-arch-groom-bride-standing2.jpg";
  const groom_bride_top_flower_ring               = "images/weddingPhoto/groom-bride-top-flower-ring.JPG";
  const groom                                     = "images/weddingPhoto/groom.JPG";
  const bride                                     = "images/weddingPhoto/bride.JPG";
  const white_wall_groom_bride_standing_beigesuit = "images/weddingPhoto/white-wall-groom-bride-standing-beigesuit.JPG";
  const white_wall_groom_bride_standing_flower    = "images/weddingPhoto/white-wall-groom-bride-standing-flower.JPG";
  const white_wall_groom_bride_standing           = "images/weddingPhoto/white-wall-groom-bride-standing.JPG";
  const window_groom_bride                        = "images/weddingPhoto/window-groom-bride.JPG";

  const mainPhoto                                 = "images/weddingPhoto/mainPhoto.JPG";



  document.title = `${groomFirstName} ❤️ ${brideFirstName}의 모바일 청첩장`;

  const dataMap = {
    // 인트로
    introText,
    weddingInvitation,

    // 환영 메시지
    welcomeMessage1,
    welcomeMessage2,
    welcomeMessage3,
    welcomeMessage4,
    welcomeMessage5,
    welcomeMessage6,
    welcomeMessage7,

    // 신랑 신부 정보
    groomFullName,
    groomFirstName,
    groomAccountBank,
    groomAccount,
    brideFullName,
    brideFirstName,
    brideAccountBank,
    brideAccount,

    // 부모님 정보
    groomFatherFullName,
    groomFatherAccountBank,
    groomFatherAccount,
    groomMotherFullName,
    groomMotherAccountBank,
    groomMotherAccount,
    brideFatherFullName,
    brideFatherAccountBank,
    brideFatherAccount,
    brideMotherFullName,
    brideMotherAccountBank,
    brideMotherAccount,

    // 결혼식 정보
    weddingYear,
    weddingMonth,
    weddingDay,
    weddingDayOfWeekEng,
    weddingDayOfWeekKor,
    weddingTimeZone,
    weddingTimeZoneKor,
    weddingHour,
    weddingMinute,
    weddingLocation,
    weddingLocationDetail,

    // 주소
    weddingLocationAddress1,
    weddingLocationAddress2,
    weddingLocationContact,

    //이미지 모음                 
    flower_arch_groom_bride_sitting,
    flower_arch_groom_bride_standing,
    flower_arch_groom_bride_standing2,
    groom_bride_top_flower_ring,
    groom,
    bride,   
    white_wall_groom_bride_standing_beigesuit,
    white_wall_groom_bride_standing_flower,
    white_wall_groom_bride_standing,
    window_groom_bride,

    mainPhoto
  };

  document.querySelectorAll("[data-name]").forEach(el => {
    const key = el.dataset.name;
    if (dataMap[key]) {
      if (el.tagName === "IMG") {
        el.src = dataMap[key];
      } else {
        el.textContent = dataMap[key];
      }
    }
  });

  updateDday();
  loadGuestbook();

  // URL 쿼리로 로그인 폼 보이기
  const params = new URLSearchParams(window.location.search);
  const isAdminMode = params.get("admin") === "true";
  if (isAdminMode) {
    el.adminLoginBox.style.display = "block";
  }
});

// 2. 디데이 계산
function updateDday() {
  const weddingDate = new Date("2026-04-26T11:00:00+09:00");
  const today = new Date();
  const diffTime = weddingDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const ddayText = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? "오늘!" : `D+${Math.abs(diffDays)}`);
  document.getElementById("dday").textContent = `${ddayText}`;
}

// 4. 벚꽃 애니메이션
function startSakura() {
  const canvas = document.getElementById("sakuraCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const sakuraImages = [
    "images/intro/newSakuraLeaf1.png",
    "images/intro/newSakuraLeaf2.png",
    "images/intro/newSakuraLeaf3.png",
    "images/intro/newSakuraLeaf4.png",
    "images/intro/newSakuraLeaf5.png"
  ].map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });

  const petals = [];
  const sakuraCount = window.innerWidth >= 768 ? 80 : 37; // 데스크탑과 모바일에 따라 꽃잎 수 조절

  const leafSize = window.innerWidth >= 768 
  ? Math.random() * 20 + 20   // 데스크탑: 20~50px
  : Math.random() * 14 + 10;  // 모바일: 10~20px

  for (let i = 0; i < sakuraCount; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: leafSize,
      speedY: 1 + Math.random() * 1.2,
      speedX: Math.random() * 0.8,
      angle: Math.random() * 2 * Math.PI,
      rotationSpeed: 0.01 + Math.random() * 0.02,
      opacity: 0,
      img: sakuraImages[Math.floor(Math.random() * sakuraImages.length)]
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);

    // 앞뒤로 뒤집히는 효과 (sin 값으로 scaleX 조정)
    const flipX = Math.sin(Date.now() / 300 + p.x * 0.01);
    ctx.scale(flipX, 1); // flipX가 -1 ~ 1 사이로 변하면서 좌우 반전


    ctx.rotate(p.angle);
    ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.angle += p.rotationSpeed + Math.sin(Date.now() / 1000 + p.x) * 0.005;
      p.opacity += 0.01;
      if (p.opacity > 1) p.opacity = 1;
      if (p.y > canvas.height) p.y = -20;
      if (p.x > canvas.width) p.x = -20;
      drawPetal(p);
    });
    requestAnimationFrame(animate);
  }
  let loadedCount = 0;
  sakuraImages.forEach(img => {
    img.onload = () => {
      loadedCount++;
      if (loadedCount === sakuraImages.length) {
        requestAnimationFrame(animate);
        // 인트로 메시지 애니메이션도 동시에 시작
        document.getElementById("introText").classList.add("show");
      }
    };
  });
}

window.addEventListener("load", () => {
  const overlay = document.getElementById("introOverlay");

  if (sessionStorage.getItem("introPlayed") != "true") {

    // 🔥 인트로 시작 → 스크롤 잠금
    document.body.style.overflow = "hidden";

    startSakura();

    setTimeout(() => {
      overlay.classList.add("fade-out");

      // 🔥 인트로 종료 → 스크롤 다시 허용
      document.body.style.overflow = "";
    }, 3800);

    sessionStorage.setItem("introPlayed", "true");
  }
  else {
    overlay.classList.add("fade-out");
  }
});

window.openMapLink = function (appUrl, webUrl) {
  var timeout = setTimeout(function() {
    window.open(webUrl, "_blank"); // 새 탭으로 열기
  }, 1000);

  window.location.href = appUrl;

  window.onblur = function() {
    clearTimeout(timeout);
  };
}

window.copyAddress = function (dataName, button) {
  const el = document.querySelector(`[data-name="${dataName}"]`);
  const text = el.textContent.trim();

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("주소 복사완료~");
      })
      .catch(err => {
        console.error("복사 실패:", err);
        showToast("복사에 실패했습니다");
      });
  } else {
    showToast("이 브라우저에서는 복사를 지원하지 않습니다");
  }
}

/* 6. 갤러리 슬라이더 기능 */
const sliderContainer = document.querySelector("#gallerySlider");
const slides = document.querySelectorAll("#gallerySlider .slides img");

let currentIndex = 0;
let startX = 0;
let isDragging = false;

window.goToSlide = function(index) {
  const slider = document.getElementById("gallerySlider");
  const activeImg = slides[index];

  slider.style.height = activeImg.offsetHeight + "px";

  
  currentIndex = index;

  // 모든 이미지 숨기기
  slides.forEach(img => img.classList.remove("active"));

  // 현재 이미지 보이기
  slides[index].classList.add("active");

  // 썸네일 active 업데이트
  document.querySelectorAll("#thumbnailList img").forEach(t => t.classList.remove("active"));
  const activeThumb = document.querySelector(`#thumbnailList img[data-index="${index}"]`);
  activeThumb.classList.add("active");

  // 썸네일 자동 스크롤
  if (isGalleryInView()) {
    activeThumb.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
  // 🔥 자동 슬라이드 리셋 (추천)
  resetAutoSlide();
}

// 터치 시작
sliderContainer.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

// 터치 종료
sliderContainer.addEventListener("touchend", (e) => {
  if (!isDragging) return;
  isDragging = false;

  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (diff < -50) {
    // 오른쪽으로 스와이프 → 다음
    let nextIndex = currentIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0; // 마지막 → 첫 번째
    goToSlide(nextIndex);

  } else if (diff > 50) {
    // 왼쪽으로 스와이프 → 이전
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = slides.length - 1; // 첫 번째 → 마지막
    goToSlide(prevIndex);
  }

  resetAutoSlide();
});

/* 자동 슬라이드 재설정 */
window.resetAutoSlide = function() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    goToSlide(nextIndex);
  }, 3000);
  
  isAutoSlidePaused = false;
  document.getElementById("slideToggleIcon").src = "images/svg-icons/pause.svg";
}

let isAutoSlidePaused = false;

document.getElementById("slideToggleBtn").addEventListener("click", () => {
  const icon = document.getElementById("slideToggleIcon");

  if (isAutoSlidePaused) {
    // ▶ 재생 → 자동 슬라이드 다시 시작
    resetAutoSlide();
    /* 아래 두줄은 resetAutoSlide() 함수로 대체
    isAutoSlidePaused = false;
    icon.src = "images/svg-icons/pause.svg";  // 일시정지 아이콘으로 변경
    */
  } else {
    // ⏸ 일시정지 → 자동 슬라이드 멈춤
    clearInterval(autoSlideInterval);
    isAutoSlidePaused = true;
    icon.src = "images/svg-icons/play.svg";   // 재생 아이콘으로 변경
  }
});

window.isGalleryInView = function() {
  const rect = sliderContainer.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}


// 썸네일 클릭 이동
document.querySelectorAll("#thumbnailList img").forEach(thumb => {
  thumb.addEventListener("click", () => {
    const index = parseInt(thumb.dataset.index);
    goToSlide(index);
  });
});

// 초기 active 설정
document.querySelector('#thumbnailList img[data-index="0"]').classList.add("active");
slides[0].classList.add("active");

let autoSlideInterval = setInterval(() => {
  let nextIndex = currentIndex + 1;
  if (nextIndex >= slides.length) nextIndex = 0;
  goToSlide(nextIndex);
}, 3000); // 3초마다 자동 전환

// 5. 방명록 기능
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

el.sendBtn.addEventListener("click", async () => {
  const name = el.guestName.value.trim();
  const message = el.guestMessage.value.trim();
  const password = el.guestPassword.value.trim();

  if (!name || !message || !password) {
    showToast("이름, 비밀번호, 메시지를 모두 입력해주세요.");
    return;
  }

  if(password.length < 4) {
    showToast("비밀번호는 4자리 숫자여야 합니다.");
    return;
  }

  const hashed = await hashPassword(password);

  await addDoc(collection(db, "guestbook"), {
    name,
    message,
    password: hashed,
    timestamp: serverTimestamp()
  });

  // 🔥 새 메시지 애니메이션 플래그 저장
  localStorage.setItem("newMessage", "1");

  el.guestName.value = "";
  el.guestMessage.value = "";
  el.guestPassword.value = "";
  
  loadGuestbook();
});



async function loadGuestbook() {
  const q = query(collection(db, "guestbook"), orderBy("timestamp", "asc"));
  const snapshot = await getDocs(q);

  el.guestbookList.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const li = document.createElement("li");
    li.className = "chat-bubble";

    li.innerHTML = `
      <div class="chat-name">${data.name}</div>
      <div class="chat-message">${data.message}</div>
      <div class="chat-time">${formatTime(data.timestamp)}</div>

      <img src="images/svg-icons/trash.svg" class="delete-icon" data-id="${doc.id}" alt="메시지 삭제 아이콘">
    `;
    el.guestbookList.appendChild(li);
  });

  attachDeleteEvents();

  // 🔥 새 메시지 애니메이션 적용
  if (localStorage.getItem("newMessage") === "1") {
    const bubbles = el.guestbookList.querySelectorAll(".chat-bubble");
    const lastBubble = bubbles[bubbles.length - 1];
    lastBubble.classList.add("new-bubble");
    localStorage.removeItem("newMessage");
  }

  // 🔥 최신 메시지가 아래에 보이도록 자동 스크롤
  el.guestbookList.scrollTop = el.guestbookList.scrollHeight;

}

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
}

// 🗑️ 방명록 삭제 함수
async function deleteGuestbookEntry(id) {
  try {
    await deleteDoc(firestoreDoc(db, "guestbook", id));
    loadGuestbook();
  } catch (err) {
    console.error("삭제 실패:", err);
    alert("삭제에 실패했어요.");
  }
}


// 공백 입력 방지 + 비밀번호 숫자만 허용
document.addEventListener("input", function (e) {
  const target = e.target;

  // 이름, 비밀번호에서 공백 제거
  if (target.id === "guestName" || target.id === "guestPassword") {
    target.value = target.value.replace(/\s/g, ""); // 공백 제거
  }

  // 비밀번호는 숫자만
  if (target.id === "guestPassword") {
    const original = target.value;
    const filtered = original.replace(/[^0-9]/g, "");

    if (original !== filtered) {
      showToast("비밀번호는 숫자만 입력할 수 있어요");
    }
    target.value = filtered;
  }
});
/* ============================
   🔍 Firestore에서 문서 가져오기
============================ */
async function getGuestbookDoc(id) {
  const docRef = firestoreDoc(db, "guestbook", id);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap : null;
}

/* ============================
   ✔ 비밀번호 검증 함수
============================ */
function isCorrectPassword(snap, hashed) {
  return snap.data().password === hashed;
}

/* ============================
   🗑️ 삭제 클릭 처리 함수 (모달 버전)
============================ */
async function handleDeleteClick(id) {
  // 관리자면 바로 삭제
  if (isAdmin) {
    deleteGuestbookEntry(id);
    return;
  }

  // 일반 사용자는 모달에서 비밀번호 입력
  deleteTargetId = id;
  openDeleteModal();
}

/* ============================
   🪟 삭제 모달 열기/닫기
============================ */
function openDeleteModal() {
  if (!deleteModal) return;
  deletePwInput.value = "";
  deleteError.textContent = "";
  deleteModal.classList.add("show");
  deletePwInput.focus();
}

function closeDeleteModal() {
  if (!deleteModal) return;
  deleteModal.classList.remove("show");
  deleteTargetId = null;
}

/* ============================
   🪟 삭제 모달 버튼 이벤트
============================ */
if (deleteCancelBtn && deleteConfirmBtn) {
  deleteCancelBtn.addEventListener("click", () => {
    closeDeleteModal();
  });

  deleteConfirmBtn.addEventListener("click", async () => {
    const pw = deletePwInput.value.trim();

    if (!pw) {
      deleteError.textContent = "비밀번호를 입력해주세요.";
      return;
    }

    const hashed = await hashPassword(pw);
    const snap = await getGuestbookDoc(deleteTargetId);

    if (!snap) {
      deleteError.textContent = "메시지를 찾을 수 없습니다.";
      return;
    }

    if (!isCorrectPassword(snap, hashed)) {
      deleteError.textContent = "비밀번호가 일치하지 않습니다.";
      return;
    }

    await deleteGuestbookEntry(deleteTargetId);
    closeDeleteModal();
  });
}

/* ============================
   🧷 삭제 이벤트 바인딩
============================ */
function attachDeleteEvents() {
  document.querySelectorAll(".delete-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const id = icon.dataset.id;
      handleDeleteClick(id);
    });
  });
}

window.loginAdmin = function () {
  const email = el.adminEmail.value;
  const password = el.adminPassword.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("로그인 성공!");
    })
    .catch((error) => {
      alert("로그인 실패: " + error.message);
    });
};

window.logoutAdmin = function () {
  auth.signOut()
    .then(() => {
      alert("로그아웃 성공!");
      isAdmin = false;
      loadGuestbook(); // 삭제 버튼 숨기기 위해 다시 로드
    })
    .catch((error) => {
      alert("로그아웃 실패: " + error.message);
    });
};


window.toggleAccount = function (header) {
  const box = header.parentElement;
  box.classList.toggle("open");
}

window.copyAccount = function(button) {
  const row = button.parentElement;
  const numberEl = row.querySelector(".account-number");

  // 은행명은 바로 위의 account-row에 있음
  const bankEl = row.previousElementSibling.querySelector(".bank");

  const bank = bankEl.textContent.trim();
  const numberRaw = numberEl.textContent.trim();

  // 🔥 하이픈 제거
  //const number = numberRaw.replace(/-/g, "");

  // 🔥 복사할 텍스트
  const textToCopy = `${bank} ${numberRaw}`;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast("계좌번호 복사완료~");
    })
    .catch(() => {
      showToast("복사에 실패했습니다");
    });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800); // 1.8초 후 사라짐
}

document.addEventListener("DOMContentLoaded", function() {
  new daum.roughmap.Lander({
    "timestamp" : "1765279961113",
    "key" : "dyc7m2xawav",
    "mapWidth" : "100%",
    "mapHeight" : "360",
    "container" : "daumRoughmapContainer1765279961113" // div id 지정
  }).render();
});