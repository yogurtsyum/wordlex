const changeTheme = (storage: any) => {
    storage.theme = storage.theme === 'dark' ? 'light' : 'dark';
}

const setupTheme = (window: any, document: any, storage: any) => {
    if (storage.theme === 'dark' || (!('theme' in storage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export { changeTheme, setupTheme };