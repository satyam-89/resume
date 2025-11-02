const canvas = document.getElementById('nokey');
const ctx = canvas.getContext('2d');
let can_w = canvas.width = window.innerWidth;
let can_h = canvas.height = window.innerHeight;

const BALL_NUM = 50;
const R = 3;
const balls = [];
const dis_limit = 200;
const link_line_width = 1.2;
let mouse_in = false;
const mouse_ball = { x:0, y:0, vx:0, vy:0, r:0, type:'mouse' };

// Shooting stars
const shootingStars = [];
const SHOOT_CHANCE = 0.2; // High chance for fast appearance

// Utility
function randomNum(min,max){ return Math.random()*(max-min)+min; }
function randomSidePos(len){ return Math.random()*len; }
function getRandomSpeed(pos){
    let min=-1,max=1;
    switch(pos){
        case 'top': return [randomNum(min,max),randomNum(0.1,max)];
        case 'right': return [randomNum(min,-0.1),randomNum(min,max)];
        case 'bottom': return [randomNum(min,max),randomNum(min,-0.1)];
        case 'left': return [randomNum(0.1,max),randomNum(min,max)];
        default: return [0,0];
    }
}

// Balls
function getRandomBall(){
    const pos = ['top','right','bottom','left'][Math.floor(Math.random()*4)];
    let ball = { vx:0, vy:0, r:R, alpha:1, phase: randomNum(0,10) };
    switch(pos){
        case 'top': ball.x=randomSidePos(can_w); ball.y=-R; [ball.vx,ball.vy]=getRandomSpeed('top'); break;
        case 'right': ball.x=can_w+R; ball.y=randomSidePos(can_h); [ball.vx,ball.vy]=getRandomSpeed('right'); break;
        case 'bottom': ball.x=randomSidePos(can_w); ball.y=can_h+R; [ball.vx,ball.vy]=getRandomSpeed('bottom'); break;
        case 'left': ball.x=-R; ball.y=randomSidePos(can_h); [ball.vx,ball.vy]=getRandomSpeed('left'); break;
    }
    return ball;
}

function initBalls(num){
    for(let i=0;i<num;i++){
        balls.push({
            x: randomSidePos(can_w),
            y: randomSidePos(can_h),
            vx: getRandomSpeed('top')[0],
            vy: getRandomSpeed('top')[1],
            r: R,
            alpha:1,
            phase: randomNum(0,10)
        });
    }
}

// Render Balls with white & gold glow
function renderBalls(){
    balls.forEach(b=>{
        if(!b.type){
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 + b.alpha*20;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x,b.y,R,0,Math.PI*2);
            ctx.fill();

            ctx.shadowBlur = 25 + b.alpha*15;
            ctx.beginPath();
            ctx.arc(b.x,b.y,R*0.6,0,Math.PI*2);
            ctx.fill();
        }
    });
}

// Lines between balls
function getDisOf(b1,b2){
    const dx = b1.x - b2.x;
    const dy = b1.y - b2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function renderLines(){
    for(let i=0;i<balls.length;i++){
        for(let j=i+1;j<balls.length;j++){
            const fraction = getDisOf(balls[i],balls[j])/dis_limit;
            if(fraction<1){
                const alpha = 1 - fraction;
                ctx.strokeStyle = `rgba(255,255,255,${alpha*0.6})`;
                ctx.lineWidth = link_line_width;
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(balls[i].x, balls[i].y);
                ctx.lineTo(balls[j].x, balls[j].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Update balls
function updateBalls(){
    const new_balls = [];
    balls.forEach(b=>{
        b.x+=b.vx; b.y+=b.vy;
        if(b.x>-50 && b.x<can_w+50 && b.y>-50 && b.y<can_h+50) new_balls.push(b);
        b.phase+=0.03;
        b.alpha=Math.abs(Math.cos(b.phase));
    });
    balls.length=0;
    balls.push(...new_balls);
}

function addBallIfNeeded(){
    if(balls.length<BALL_NUM) balls.push(getRandomBall());
}

// Shooting stars
const MAX_SHOOTING_STARS = 5; // max stars at a time

function spawnShootingStar(){
    if(shootingStars.length < MAX_SHOOTING_STARS){
        const startX = randomNum(0, can_w);
        const startY = randomNum(0, can_h/2);
        shootingStars.push({
            x: startX,
            y: startY,
            vx: randomNum(8,12),
            vy: randomNum(3,6),
            len: randomNum(80,150),
            alpha: 1
        });
    }
}

function renderShootingStars(){
    for(let i=shootingStars.length-1;i>=0;i--){
        const s = shootingStars[i];
        ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len, s.y - s.len*0.3);
        ctx.stroke();
        ctx.closePath();

        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.02;

        if(s.alpha <= 0 || s.x > can_w + 50 || s.y > can_h + 50){
            shootingStars.splice(i,1);
        }
    }
}

// Render loop
function render(){
    ctx.clearRect(0,0,can_w,can_h);
    renderBalls();
    renderLines();
    renderShootingStars();
    updateBalls();
    addBallIfNeeded();
    spawnShootingStar();
    requestAnimationFrame(render);
}

// Mouse
canvas.addEventListener('mouseenter',()=>{mouse_in=true; balls.push(mouse_ball);});
canvas.addEventListener('mouseleave',()=>{mouse_in=false; balls.splice(balls.indexOf(mouse_ball),1);});
canvas.addEventListener('mousemove',(e)=>{mouse_ball.x=e.pageX; mouse_ball.y=e.pageY;});

// Resize
window.addEventListener('resize',()=>{
    can_w = canvas.width = window.innerWidth;
    can_h = canvas.height = window.innerHeight;
});

// Init
initBalls(BALL_NUM);
requestAnimationFrame(render);

document.addEventListener("DOMContentLoaded", () => {
  const typed = new Typed("#typed", {
    strings: [
      "GAME DEVELOPER"
    ],
    typeSpeed: 90,   // Speed of typing
    backSpeed: 50,   // Speed of erasing
    startDelay: 500, // Delay before typing starts
    backDelay: 1000, // Pause before erasing
    loop: true,      // Keep repeating
    showCursor: true,
    cursorChar: "|"  // Cursor style
    
  });
});

// ===== Infinite Loop Auto Slide for Projects =====
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".projects-slider");
  if (!slider) return;

  let scrollSpeed = 1; // pixels per frame
  let cloneWidth = 0;

  // Duplicate all cards for smooth looping
  const clone = slider.innerHTML;
  slider.innerHTML += clone;

  // Calculate total width of one set
  cloneWidth = slider.scrollWidth / 2;

  function autoScroll() {
    slider.scrollLeft += scrollSpeed;

    // Reset when reaching half width (end of first set)
    if (slider.scrollLeft >= cloneWidth) {
      slider.scrollLeft = 0;
    }

    requestAnimationFrame(autoScroll);
  }

  autoScroll();
});

// my project

// projects.js — draggable looping carousel (center-snap)
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.querySelector('.carousel-track');
  const cards = Array.from(document.querySelectorAll('.card'));
  if (!track || cards.length === 0) return;

  let current = 0;
  const cardWidth = cards[0].getBoundingClientRect().width + 40; // card width + margin
  const total = cards.length;

  function clampIndex(i) {
    return ((i % total) + total) % total;
  }

  // center translate calc
  function computeCenterTranslate(index) {
    const centerX = viewport.clientWidth / 2 - (cards[0].offsetWidth / 2);
    return centerX - index * cardWidth;
  }

  function updateCardClasses(instant = false) {
    cards.forEach((c) => c.classList.remove('left', 'right', 'active', 'far'));
    const left = clampIndex(current - 1);
    const right = clampIndex(current + 1);

    cards[current].classList.add('active');
    cards[left].classList.add('left');
    cards[right].classList.add('right');

    cards.forEach((c, i) => {
      if (![current, left, right].includes(i)) c.classList.add('far');
    });

    const t = computeCenterTranslate(current);
    track.style.transition = instant ? 'none' : 'transform 0.5s cubic-bezier(.22,.9,.3,1)';
    track.style.transform = `translateX(${t}px)`;
  }

  function next() {
    current = clampIndex(current + 1);
    updateCardClasses();
  }
  function prev() {
    current = clampIndex(current - 1);
    updateCardClasses();
  }

  // Drag/swipe handling
  let dragging = false, startX = 0, lastTranslate = 0;

  const getTrackTranslate = () => {
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m41;
  };

  function pointerDown(e) {
    dragging = true;
    track.classList.add('grabbing');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    lastTranslate = getTrackTranslate();
    track.style.transition = 'none';
  }

  function pointerMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = clientX - startX;
    track.style.transform = `translateX(${lastTranslate + dx}px)`;
  }

  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('grabbing');

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = endX - startX;
    const threshold = 100;

    if (dx < -threshold) next();
    else if (dx > threshold) prev();
    else updateCardClasses(); // snap back
  }

  // events
  track.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  track.addEventListener('touchstart', pointerDown, { passive: true });
  track.addEventListener('touchmove', pointerMove, { passive: true });
  track.addEventListener('touchend', pointerUp);

  window.addEventListener('resize', () => updateCardClasses(true));

  // init
  current = 0;
  updateCardClasses(true);
});



