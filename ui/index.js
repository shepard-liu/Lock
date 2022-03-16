const { startDrag, transform } = window.electron;

// Configuring HTML
require('./style.css');
document.title = 'Lock-beta';
document.body.innerHTML = `
<section id="heading">
<h1 id="status">Welcome</h1>
<svg id="lockBody" t="1647075997684" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
    p-id="4258">
    <path
        d="M748.8 864 275.2 864c-32 0-57.6-25.6-57.6-57.6L217.6 512c0-32 32-57.6 57.6-57.6l467.2 0c38.4 0 57.6 25.6 57.6 57.6l0 294.4C806.4 838.4 780.8 864 748.8 864z"
        p-id="4259"></path>
</svg>
<svg id="lockHead" class="lock-open" t="1647075997684" viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="4258">
    <path
        d="M364.8 422.4 364.8 339.2c0-70.4 51.2-121.6 121.6-121.6l51.2 0c64 0 121.6 51.2 121.6 121.6l0 83.2 57.6 0L716.8 339.2c0-102.4-83.2-179.2-179.2-179.2L486.4 160c-102.4 0-179.2 83.2-179.2 179.2l0 83.2L364.8 422.4z"
        p-id="4260">
    </path>
</svg>
</section>
<section id="password">
<label id="passwordLabel">Password</label>
<input id="passwordInput" aria-labelledby="passwordLabel" type="password" />
<div id="eyeWrapper">
    <svg t="1647412372769" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="2213">
        <path d="M508 512m-112 0a112 112 0 1 0 224 0 112 112 0 1 0-224 0Z" p-id="2214"></path>
        <path
            d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3-7.7 16.2-7.7 35.2 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z"
            p-id="2215"></path>
    </svg>
</div>
</section>
<section id="files">
<div id="fileZone" draggable="true">
    <span id='filePlaceholder'>
        <svg t="1647079752199" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2z"
                p-id="6010">
            </path>
        </svg>
    </span>

    <div id="fileHint">Drag and drop files here</div>
</div>
</section>
<section id="options">
<span id="encrypt" class="mode-activated">Encrypt</span>
<div id="switch">
    <div id="switchCircle"></div>
</div>
<span id="decrypt">Decrypt</span>
</section>
`;

// States
const states = {
    mode: 'encrypt',
    showPassword: false,
    files: null,
}

// Elements
const [
    elemPwdInput,
    elemPwdEye,
    elemStatus,
    elemFileZone,
    elemFilePlaceholder,
    elemSwitch,
    elemSwitchCircle,
    elemEncrypt,
    elemDecrypt,
    elemLockHead,
    elemFileHint,
] = [
    'passwordInput',
    'eyeWrapper',
    'status',
    'fileZone',
    'filePlaceholder',
    'switch',
    'switchCircle',
    'encrypt',
    'decrypt',
    'lockHead',
    'fileHint',
].map((id) => document.getElementById(id));

// Event listeners
elemSwitch.onclick = () => {
    elemSwitchCircle.classList.toggle('switch-right');
    elemDecrypt.classList.toggle('mode-activated');
    elemEncrypt.classList.toggle('mode-activated');
    states.mode = states.mode === 'encrypt' ? 'decrypt' : 'encrypt';
    elemLockHead.classList.toggle('lock-open', states.mode === 'encrypt');
}

let deEffectTimeout = null, containsDir = false;
elemFileZone.addEventListener('dragover', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    // setting a temperary file over effect
    elemFileZone.parentElement.style.backgroundColor = 'rgb(105,105,105)';

    clearTimeout(deEffectTimeout);

    deEffectTimeout = setTimeout(() => {
        elemFileZone.parentElement.style.backgroundColor = null;
    }, 100);

});

elemFileZone.addEventListener('drop', async (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const pwd = elemPwdInput.value;
    if (!pwd) {
        elemPwdInput.style.borderColor = 'rgb(181 48 48)';
        return;
    };

    setCurrentFiles(ev.dataTransfer.files);
    elemStatus.innerText = `${states.mode.charAt(0).toUpperCase() + states.mode.slice(1)}ing...`;
    const filePaths = [];
    for (const file of states.files)
        filePaths.push(file.path);

    let transformedFiles = null;
    try {
        transformedFiles = await transform(elemPwdInput.value, filePaths, states.mode);
    } catch (err) {
        resetFiles();
        elemFileZone.parentElement.style.borderColor = 'rgb(181 48 48)';
        setTimeout(() => {
            elemFileZone.parentElement.style.borderColor = null;
        }, 400);
        return;
    }
    setTimeout(() => {
        elemStatus.innerText = `${states.mode.charAt().toUpperCase() + states.mode.slice(1)}ed!`;
        elemLockHead.classList.toggle('lock-open');
        setCurrentFiles(transformedFiles);
    }, 400);
});

elemFileZone.addEventListener('dragenter', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
})

elemFileZone.addEventListener('dragstart', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    startDrag();
})

elemPwdInput.addEventListener('input', (ev) => {
    if (elemPwdInput.value)
        elemPwdInput.style.borderColor = null;
})


elemPwdEye.addEventListener('click', (ev) => {
    const show = states.showPassword = !states.showPassword;

    elemPwdEye.innerHTML = show ? eyeClose : eyeOpen;
    elemPwdInput.type = show ? 'text' : "password";
})

//* Utils
function setCurrentFiles(files) {
    states.files = files;
    if (files === null || files.length === 0) return;
    // Update UI
    const maxFileNameLength = 18;
    const firstFileName = files[0].name || files[0];
    elemFileZone.parentElement.style.borderStyle = 'solid';
    const clippedFileName = firstFileName.length > maxFileNameLength
        ? firstFileName.slice(0, maxFileNameLength - 3) + '...' + firstFileName.slice(-3)
        : firstFileName;
    const hintStr = `"${clippedFileName}"` + (files.length > 1 ? ` and ${files.length - 1} more` : '');
    elemFileHint.innerText = hintStr;

    elemFilePlaceholder.innerHTML = files.length > 1 ? filePlaceholderSvgMulti : filePlaceholderSvg;
}

function resetFiles() {
    states.files = null;
    elemFileHint.innerText = 'Drag and drop files here';
    elemFileZone.parentElement.style.borderStyle = 'dashed';
    elemFilePlaceholder.innerHTML = filePlaceholderSvg;
    elemStatus.innerText = `Welcome`;
}

//* Components
const filePlaceholderSvg = `
<svg id='filePlaceholder' t="1647079752199" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="6009">
    <path
        d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2z"
        p-id="6010">
    </path>
</svg>
`;

const filePlaceholderSvgMulti = `
<svg id='filePlaceholder' viewBox="0 0 212 254" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g>
        <g transform="translate(-121.000000, -163.000000)">
            <g transform="translate(121.000000, 163.000000)">
                <g transform="translate(0.000000, 34.000000)">
                    <path d="M170.690057,55.171875 C172.164489,56.6450893 173,58.6339286 173,60.7209821 L173,212.142857 C173,216.488839 169.485938,220 165.136364,220 L7.86363636,220 C3.5140625,220 0,216.488839 0,212.142857 L0,7.85714286 C0,3.51116071 3.5140625,0 7.86363636,0 L112.228835,0 C114.317614,0 116.33267,0.834821429 117.807102,2.30803571 L170.690057,55.171875 Z M154.864489,64.3303571 L108.616477,18.1205357 L108.616477,64.3303571 L154.864489,64.3303571 Z" id="形状"></path>
                </g>
                <g id="ss" transform="translate(39.000000, 0.000000)">
                    <path d="M170.690057,55.171875 C172.164489,56.6450893 173,58.6339286 173,60.7209821 L173,212.142857 C173,216.488839 169.485938,220 165.136364,220 L7.86363636,220 C3.5140625,220 0,216.488839 0,212.142857 L0,7.85714286 C0,3.51116071 3.5140625,0 7.86363636,0 L112.228835,0 C114.317614,0 116.33267,0.834821429 117.807102,2.30803571 L170.690057,55.171875 Z M154.864489,64.3303571 L108.616477,18.1205357 L108.616477,64.3303571 L154.864489,64.3303571 Z" id="形状"></path>
                </g>
            </g>
        </g>
    </g>
</svg>`;

const eyeClose = `
<svg t="1647412405326" class="icon" viewBox="0 0 1049 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2360" width="200" height="200"><path d="M247.36 246.528L176.704 175.872l46.336-46.4 85.76 85.76C375.296 186.496 447.296 172.16 524.672 172.16c217.216 0 392.128 112.96 524.672 338.752-59.52 103.04-128.32 182.528-206.272 238.528l98.624 98.624-46.4 46.4-109.12-109.184a531.2 531.2 0 0 1-1.024 0.512l-126.272-126.208 0.832-0.768-70.016-69.952a99.968 99.968 0 0 1-0.768 0.64l-140.8-140.736 0.64-0.832-71.552-71.616a202.752 202.752 0 0 0-0.64 0.832L246.336 247.104l0.96-0.576z m451.584 358.848c14.4-28.16 22.464-60.288 22.464-94.4C721.408 398.72 633.344 307.84 524.672 307.84c-35.264 0-68.352 9.6-96.96 26.368l78.528 78.528c6.016-1.28 12.288-1.856 18.688-1.856 54.272 0 98.368 45.44 98.368 101.632 0 5.44-0.448 10.816-1.28 16l76.928 76.928zM191.296 284.8l150.656 150.72a208.64 208.64 0 0 0-14.08 75.52c0 112.256 88.128 203.264 196.8 203.264 28.16 0 54.848-6.08 79.04-17.024l117.888 117.824A551.04 551.04 0 0 1 524.672 849.792c-219.136 0-394.048-112.96-524.672-338.816C56.128 415.36 119.936 339.904 191.232 284.8z m329.216 329.216L426.816 520.32c3.776 51.008 43.904 91.52 93.696 93.696z" p-id="2361"></path></svg>
`;

const eyeOpen = `
<svg t="1647412437580" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2506" width="200" height="200"><path d="M508 512m-112 0a112 112 0 1 0 224 0 112 112 0 1 0-224 0Z" p-id="2507"></path><path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3-7.7 16.2-7.7 35.2 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z" p-id="2508"></path></svg>
`;