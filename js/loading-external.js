const loadingScreen = document.querySelector(".main-loader-ex");

function hideLoader() {
    setTimeout(() => {
        loadingScreen.classList.add("fade-out");
        

        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 500);
    }, 800);
}


function simulateProgress() {
    const fakeProgress = [25, 45, 65, 80, 100]; 
    let index = 0;
    
    
    if (!document.querySelector('.loading-progress')) {
        const progressElem = document.createElement('div');
        progressElem.className = 'loading-progress';
        progressElem.style.color = 'rgba(255, 255, 255, 0.7)';
        progressElem.style.fontFamily = "'Poppins', sans-serif";
        progressElem.style.fontSize = '0.8rem';
        progressElem.style.marginTop = '10px';
        loadingScreen.appendChild(progressElem);
    }
    
    const progressElem = document.querySelector('.loading-progress');
    
    
    const progressInterval = setInterval(() => {
        progressElem.textContent = `${fakeProgress[index]}%`;
        index++;
        
        if (index >= fakeProgress.length) {
            clearInterval(progressInterval);
            hideLoader();
        }
    }, 300);
}


window.addEventListener("load", function() {
    
    simulateProgress();
});


document.addEventListener("DOMContentLoaded", function() {
    
    setTimeout(() => {
        if (!loadingScreen.classList.contains('hidden')) {
            hideLoader();
        }
    }, 5000);
});
