const backToTop = document.getElementById('backtotop');

const checkScroll = () => {
    /*
    웹페이지가 수직으로 얼마나 스크롤되었는지를 확인하는 값(픽셀 단위로 반환)
    https://developer.mozilla.org/ko/docs/Web/API/Window/pageYOffset
    */

    let pageYOffset = window.scrollY;

    if (pageYOffset !== 0) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
}

const moveBackToTop = () => {
    if (window.scrollY > 0) {
        /*
        smooth하게 스크롤하기
        https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
        */
       window.scrollTo({top:0, behavior:"smooth"})
    }
}

window.addEventListener('scroll', checkScroll);
backToTop.addEventListener('click', moveBackToTop);

/*---------------------------------------------------------------------------------*/
function transformNext(event) {
    const slideNext = event.target;
    const slidePrev = slideNext.previousElementSibling;

    const classList = slideNext.parentElement.parentElement.nextElementSibling;
    let activeLi = classList.getAttribute('data-position');
    const liList = classList.getElementsByTagName('li');

    //하나의 카드라도 왼쪽으로 이동했다면 오른쪽으로 갈 수 있음
    if (Number(activeLi) < 0) {
        activeLi = Number(activeLi) + 260;

        //왼쪽에 있던 카드가 오른쪽으로 갔다면, 다시 왼쪽으로 갈 수 있으므로 PREV 버튼 활성화
        slidePrev.style.color = '#2f3059';
        slidePrev.classList.add('slide-prev-hover');
        slidePrev.addEventListener('click', transformPrev);

        if ( Number(activeLi) === 0) {
            slideNext.style.color = '#cfd8dc';
            slideNext.classList.remove('slide-prev-hover');
            slideNext.addEventListener('click', transformPrev);
        }
    }

    classList.style.transition = 'transform 1s';
    classList.style.transform = 'translateX(' + String(activeLi) + 'px)';
    classList.setAttribute('data-position', activeLi);
}

function transformPrev(event) {
    const slidePrev = event.target;
    const slideNext = slidePrev.nextElementSibling;

    // ul 태그 선택
    const classList = slidePrev.parentElement.parentElement.nextElementSibling;
    let activeLi = classList.getAttribute('data-position');
    const liList = classList.getElementsByTagName('li');

    /*
    classList.clientWidth는 ul 태그의 실질적인 너비
    liList.length * 260 에서 260은 각 li 요소의 실질 너비(margin 포함)
    activeLi는 data-position에 있는 현재 위치
    즉, liList.length * 260 + Number(activeLi)는 현재 위치부터 오른쪽으로 나열되어야 하는 나머지 카드들의 너비
    */

    /*
    classList.clientWidth < (liList.length * 260 + Number(activeLi)) 의미는
    오른쪽으로 나열될 카드들이 넘친 상태이므로, 왼쪽으로 이동이 가능함
    */
   
    if (classList.clientWidth < (liList.length * 260 + Number(activeLi))) {
        //위치를 왼쪽으로 260 이동 (-260px)
        activeLi = Number(activeLi) - 260;

        /* 위치를 왼쪽으로 260 이동 (-260px)
        해당 위치는 변경된 activeLi 값이 적용된 liList.length * 260 + Number(activeLi) 값임
        이 값보다 classList.clientWidth (ul 태그의 너비)가 크다는 것은
        넘치는 li가 없다는 뜻으로, NEXT 버튼이 활성화되면 안 됨
        */
       if (classList.clientWidth > (liList.length * 260 + Number(activeLi))) {
        slidePrev.style.color = '#cfd8dc';
        slidePrev.classList.remove('slide-prev-hober');
        slidePrev.removeEventListener('click', transformPrev);
       }
        
        slideNext.style.color = '#2f3059';
        slideNext.classList.add('slide-next-hover');
        slideNext.addEventListener('click', transformNext);
    }

    classList.style.transition = 'transform 1s';
    classList.style.transform = 'translateX(' + String(activeLi) + 'px)';
    classList.setAttribute('data-position', activeLi);
}

const slidePrevList = document.getElementsByClassName('slide-prev');

for (let i = 0; i < slidePrevList.length; i++) {
    // ul 태그 선택
    let classList = slidePrevList[i].parentElement.parentElement.nextElementSibling;
    let liList = classList.getElementsByTagName('li');

    // 카드가 ul 태그 너비보다 넘치면 왼쪽(PREV) 버튼은 활성화하고, 오른쪽(NEXT)는 현재 맨 첫 카드 위치이므로 비활성화
    if (classList.clientWidth < (liList.length * 260)) {
        slidePrevList[i].classList.add('slide-prev-hover');
        slidePrevList[i].addEventListener('click', transformPrev);
    } else {
        /* 태그 삭제 시, 부모 요소에서 removeChild를 통해 삭제해야 함. 따라서
        1. 먼저 부모 요소를 찾아서
        2. 부모 요소의 자식 요소로 있는 PREV와 NEXT 요소를 삭제함
        */
        const arrowContainer = slidePrevList[i].parentElement;
        arrowContainer.removeChild(slidePrevList[i].nextElementSibling);
        arrowContainer.removeChild(slidePrevList[i]);
    }
}

/*---------------------------------------------------------------------------------*/
let touchstartX;
let currentClassList;
let currentImg;
let currentActiveLi;
let nowActiveLi;
let mouseStart;

function processTouchMove(event) {
    // preventDefault(): 해당 요소의 고유 동작을 중단시키는 함수 (이미지만 드래그로 이동하는 고유 동작 중단)
    event.preventDefault();

    /*
    currentActiveLi: class-list에서 data-position으로 현재 카드 위치를 알아냄
    touchstartX: 최초 요소의 x 좌표값
    event.clientX: 드래그 중인 현재의 마우스 좌표값
    즉, (Number(event.clientX) - Number(touchstartX))는 마우스가 얼마나 이동 중인지 나타냄
    */
    let currentX = event.clientX || event.touches[0].screenX;
    nowActiveLi = Number(currentActiveLi) + (Number(currentX) - Number(touchstartX));

    // 바로 즉시 마우스 위치에 따라 카드를 이동함
    currentClassList.style.transition = 'transform 0s linear';
    currentClassList.style.transform = 'translateX(' + String(nowActiveLi) + 'px)';
}

function processTouchStart(event) {
    mouseStart = true;

    // preventDefault(): 해당 요소의 고유 동작을 중단시키는 함수 (이미지만 드래그로 이동하는 고유 동작 중단)
    event.preventDefault();
    touchstartX = event.clientX /* 마우스 */ || event.touches[0].screenX;/* 터치 */
    currentImg = event.target;

    // 드래그 처리를 위해 드래그 중(mousemove), 드래그가 끝났을 때(mouseup)에 이벤트를 걸어줌
    currentImg.addEventListener('mousemove', processTouchMove);
    currentImg.addEventListener('mouseup', processTouchEnd);

    currentImg.addEventListener('touchmove', processTouchMove);
    currentImg.addEventListener('touchend', processTouchEnd);

    currentClassList = currentImg.parentElement.parentElement;
    currentActiveLi = currentClassList.getAttribute('data-position');
}

function processTouchEnd(event) {
    // preventDefault(): 해당 요소의 고유 동작을 중단시키는 함수 (이미지만 드래그로 이동하는 고유 동작 중단)
    event.preventDefault();

    if (mouseStart === true) {
        currentImg.removeEventListener('mousemove', processTouchMove);
        currentImg.removeEventListener('mouseup', processTouchEnd);

        currentImg.removeEventListener('touchmove', processTouchMove);
        currentImg.removeEventListener('touchend', processTouchEnd);

        // 맨 처음 카드가 맨 앞에 배치되도록 초기 상태로 이동
        currentClassList.style.transition = 'transform 1s ease';
        currentClassList.style.transform = 'translateX(0px)';
        currentClassList.setAttribute('data-position', 0);

        // 맨 처음 카드가 맨 앞에 배치된 상태로 화살표 버튼도 초기 상태로 변경
        let eachSlidePrev = currentClassList.previousElementSibling.children[1].children[0];
        let eachSlideNext = currentClassList.previousElementSibling.children[1].children[1];
        let eachLiList = currentClassList.getElementsByTagName('li');
        if (currentClassList.clientWidth < (eachLiList.length * 260)) {
            eachSlidePrev.style.color = '#2f3059';
            eachSlidePrev.classList.add('slide-prev-hover');
            eachSlidePrev.addEventListener('click', transformPrev);

            eachSlideNext.style.color = '#cfd8dc';
            eachSlideNext.classList.remove('slide-next-hover');
            eachSlideNext.removeEventListener('click', transformNext);
        }
        mouseStart = false; 
    }
}

// 특정 요소를 드래그하다가 요소 밖에서 드래그를 끝낼 수 있으므로, window에 이벤트를 걸어줌
window.addEventListener('dragend', processTouchEnd);
window.addEventListener('mouseup', processTouchEnd);

// 인터페이스 간의 오동작을 막기 위해 카드 내의 이미지에만 드래그 인터페이스 제공
const classImgLists = document.querySelectorAll('ul li img');
for (let i = 0; i < classImgLists.length; i++) {
    // 해당 요소에 마우스를 누르면 드래그를 시작할 수 있으므로, 이벤트를 걸어줌
    classImgLists[i].addEventListener('mousedown', processTouchStart);
    classImgLists[i].addEventListener('touchstart', processTouchStart);
}