const burgerBtn = document.getElementById('burgerBtn');
const closeBtn = document.getElementById('closeBtn');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('mhomenav__mobile--active');
    burgerBtn.classList.toggle('mhomenav__burger--active', isOpen);
    overlay.classList.toggle('mhomenav__overlay--active', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

burgerBtn.addEventListener('click', toggleMobileMenu);
closeBtn.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', toggleMobileMenu);

document.querySelectorAll('.mhomenav__mobile__ul__a').forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('mhomenav__mobile--active')) {
            toggleMobileMenu();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('mhomenav__mobile--active')) {
        toggleMobileMenu();
    }
});