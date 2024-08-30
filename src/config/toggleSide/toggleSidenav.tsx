export function toggleSidenav() {
    const iconSidenav = document?.getElementById('iconSidenav');

    if (window.innerWidth < 1200) {
        if (document?.getElementById('sidenavBody')?.classList.contains('g-sidenav-pinned')) {
            document?.getElementById('sidenavBody')?.classList.remove('g-sidenav-pinned');
            setTimeout(function () {
                document?.getElementById('sidenav-main')?.classList.remove('bg-white');
            }, 100);
            document?.getElementById('sidenav-main')?.classList.remove('bg-transparent');

        } else {
            document?.getElementById('sidenavBody')?.classList.add('g-sidenav-pinned');
            document?.getElementById('sidenav-main')?.classList.add('bg-white');
            document?.getElementById('sidenav-main')?.classList.remove('bg-transparent');
            iconSidenav?.classList.remove('d-none');
        }
    }
}