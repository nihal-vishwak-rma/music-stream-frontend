import { showErrorPopup } from "./ui.js";
import { authFetch } from "./authFetch.js";

let currentPage = 1;
let nextPageToken = null;
let prevPageToken = null;
let isLoadingMore = false;
let hasMorePages = true;


const songsContainer = document.getElementById("songs-container");

if (songsContainer) {
    songsContainer.addEventListener('scroll', () => {

        if (songsContainer.scrollHeight - songsContainer.scrollTop <= songsContainer.clientHeight + 100) {
            if (!isLoadingMore && nextPageToken) {
                loadMoreSongs();
            }
        }
    });
}


async function loadMoreSongs() {
    if (isLoadingMore || !nextPageToken) return;

    isLoadingMore = true;

    try {
        const url = `${API_URL}/music/search?songname=${search}&pagetoken=${nextPageToken}`;

        // Show loading indicator
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loading-more";
        loadingDiv.className = "loading";
        loadingDiv.innerText = "Loading more songs...";
        songsContainer.appendChild(loadingDiv);

        const res = await authFetch(url);

        if (!res.ok) {
            loadingDiv.innerText = "Failed to load more songs!";
            loadingDiv.style.color = "red";
            return;
        }

        const result = await res.json();

        if (!result.data || !result.data.songs) {
            loadingDiv.remove();
            return;
        }

        loadingDiv.remove();

        nextPageToken = result.data.nextPageToken;
        prevPageToken = result.data.prevPageToken;


        allsongs = [...allsongs, ...result.data.songs];

        result.data.songs.forEach((song, index) => {
            const div = document.createElement("div");

            div.innerHTML = `
        <div style="position: relative; display: inline-block; width: 300px; height: 150px; border-radius: 8px; overflow: hidden;">
            <img src="${song.thumbnailUrl}" width="300" height="150" style="display: block; object-fit: cover;" data-song-id="${song.videoId}"> 
            <span class="song-duration" data-song-id="${song.videoId}" style="
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            ">${song.duration}</span>
        </div>
        <br>
        <span style="display: block; margin-top: 8px; font-weight: 500;">${song.title}</span>
      
    `;

            div.addEventListener("click", () => {
                const newIndex = allsongs.findIndex(s => s.videoId === song.videoId);
                currentSongIndex = newIndex;
                playSong(song.videoId, song.title, song.artist);
            });
            songsContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading more songs:", err);
    } finally {
        isLoadingMore = false;
    }
}



let isLoading = false;
let search;

window.allsongs = [];
window.currentSongIndex = -1;

export async function loadTrendingSongs(search) {
    try {
        allsongs = [];

        let url;
        url = nextPageToken
            ? `${API_URL}/music/search?songname=${search}&pagetoken=${nextPageToken}`
            : `${API_URL}/music/search?songname=${search}`;

        const songsContainer = document.getElementById("songs-container");
        songsContainer.innerHTML = `
            <div class="loading" id="loading-songs">Loading songs...</div>
        `;

        const res = await authFetch(url);

        if (!res.ok) {
            const loadingSongs = document.getElementById("loading-songs");
            if (loadingSongs) {
                loadingSongs.innerText = "Failed to load songs!";
                loadingSongs.style.color = "red";
            }
            return;
        }

        const result = await res.json();

        if (!result.data || !result.data.songs) {
            const loadingSongs = document.getElementById("loading-songs");
            if (loadingSongs) {
                console.log(result)
                loadingSongs.innerText = result.message || "No songs found!";
                loadingSongs.style.color = "red";
            }
            return;
        }

        

        nextPageToken = result.data.nextPageToken;
        prevPageToken = result.data.prevPageToken;



        songsContainer.innerHTML = "";

        allsongs = result.data.songs;

        currentSongIndex = 0;



        result.data.songs.forEach((song, index) => {
            const div = document.createElement("div");

            div.innerHTML = `
        <div style="position: relative; display: inline-block; width: 300px; height: 150px; border-radius: 8px; overflow: hidden;">
            <img src="${song.thumbnailUrl}" width="300" height="150" style="display: block; object-fit: cover;" data-song-id="${song.videoId}"> 
            <span class="song-duration" data-song-id="${song.videoId}" style="
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            ">${song.duration}</span>
        </div>
        <br>
        <span style="display: block; margin-top: 8px; font-weight: 500;">${song.title}</span>
    `;


            div.addEventListener("click", () => {
                currentSongIndex = index;
                playSong(song.videoId, song.title, song.artist);
            });
            songsContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading songs:", err);
        const loadingSongs = document.getElementById("loading-songs");
        if (loadingSongs) {
            loadingSongs.innerText = "Error connecting to server!";
            loadingSongs.style.color = "red";
        }
    }
}


var playNext = document.getElementById("playNextBtn");
var playPrev = document.getElementById("playPrevBtn");

playNext.addEventListener('click', () => {
    if (currentSongIndex < allsongs.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0;
    }

    let nextsongs = allsongs[currentSongIndex];
    playSong(nextsongs.videoId, nextsongs.title, nextsongs.artist);
});

playPrev.addEventListener('click', () => {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = allsongs.length - 1;
    }

    let nextsongs = allsongs[currentSongIndex];
    playSong(nextsongs.videoId, nextsongs.title, nextsongs.artist);
});


var searchInput = document.querySelector("#search-input");
var searchBtn = document.querySelector("#search-song");

searchBtn.addEventListener('click', function () {
    currentPage = 1;
    nextPageToken = null;
    prevPageToken = null;
    search = searchInput.value.trim();
    loadTrendingSongs(search);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        currentPage = 1;
        nextPageToken = null;
        prevPageToken = null;
        search = searchInput.value.trim();
        loadTrendingSongs(search);
    }
});

var homePage = document.querySelector("#homePage");
homePage.addEventListener('click', () => {
    nextPageToken = null;
    prevPageToken = null;
    currentPage = 1;
    loadTrendingSongs(null);
});

// song player section

const audioPlayer = document.getElementById("audioPlayer");
let mediaSource = null;
let sourceBuffer = null;
let objectUrl = null;
var isPlay = false;

var playBtn = document.querySelector(".fa-play");
var pauseBtn = document.querySelector(".fa-pause");

playBtn.addEventListener('click', () => {
    isPlay = true;
    playBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    audioPlayer.play().catch(err => console.warn("Play blocked:", err));
});

pauseBtn.addEventListener('click', () => {
    isPlay = false;
    pauseBtn.style.display = "none";
    playBtn.style.display = "inline-block";
    audioPlayer.pause();
});

let currentController = null;



export async function playSong(videoId, title, artist) {
    console.log("Playing:", title);

    // Abort previous streaming
    if (currentController) {
        try { currentController.abort(); } catch (_) { }
    }

    if (audioPlayer) {
        try { audioPlayer.pause(); } catch (_) { }
        try { audioPlayer.src = ""; } catch (_) { }
    }

    if (mediaSource && mediaSource.readyState === 'open') {
        try { mediaSource.endOfStream(); } catch (_) { }
    }

    if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch (_) { }
        objectUrl = null;
    }

    sourceBuffer = null;
    mediaSource = null;

    currentController = new AbortController();
    const signal = currentController.signal;

    const songInfo = document.querySelector(".song-info");
    if (songInfo) songInfo.innerText = `${title} - ${artist}`;

    if (!audioPlayer.paused) audioPlayer.pause();

    try {
        const token = localStorage.getItem("token") || "";
        const response = await authFetch(
            `${API_URL}/music/stream/${videoId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Range: "bytes=0-"
                },
                signal
            }
        );

        if (!response.ok) {
            if (response.status === 403) {
                showErrorPopup("This video is age-restricted and cannot be played.");
            } else if (response.status === 404) {
                showErrorPopup("Audio stream not found.");
            } else {
                showErrorPopup("Failed to play song. Status: " + response.status);
            }
            return;
        }

        const data  = await response.json();

        console.log(data);
        audioPlayer.src = data.data.url;
        audioPlayer.preload = 'metadata';
        audioPlayer.load();


        
        // attach common audio events (these will work for both MSE and blob fallback)
        audioPlayer.addEventListener('loadstart', () => {
            console.log('Started loading audio : ' + title);
        }, { once: true });

        audioPlayer.addEventListener('canplay', () => {
            console.log('Can start playing : ' + title);
            if (isPlay) {
                audioPlayer.play().catch(err => console.warn("Play blocked:", err));
                playBtn.style.display = "none";
                pauseBtn.style.display = "inline-block";
            }
        }, { once: true });

        audioPlayer.addEventListener('loadeddata', () => {
            console.log('First frame loaded');
        }, { once: true });

        audioPlayer.addEventListener('progress', () => {
            if (audioPlayer.buffered.length > 0) {
                const bufferedEnd = audioPlayer.buffered.end(0);
                const duration = audioPlayer.duration;
                if (duration) {
                    const bufferProgress = (bufferedEnd / duration) * 100;
                    console.log(`Buffered: ${bufferProgress.toFixed(1)}%`);
                }
            }
        });

        audioPlayer.addEventListener('canplaythrough', () => {
            if (isPlay && audioPlayer.paused) {
                audioPlayer.play().catch(err => console.warn("Play blocked:", err));
            }
        });

        audioPlayer.addEventListener('waiting', () => {
            console.log('Buffering...');
        });

        audioPlayer.addEventListener('playing', () => {
            console.log('Playing...' + title);
            isPlay = true;
            playBtn.style.display = "none";
            pauseBtn.style.display = "inline-block";
        });

        // Start playing immediately
        isPlay = true;

        const tryPlay = () => {
            if (audioPlayer.readyState >= 2) { 
                audioPlayer.play().catch(err => {
                    console.warn("Play blocked, waiting for user interaction:", err);
                    isPlay = false;
                    pauseBtn.style.display = "none";
                    playBtn.style.display = "inline-block";
                });
            } else {
                setTimeout(tryPlay, 100);
            }
        };

        tryPlay();

    } catch (error) {
        if (!currentController.signal.aborted) {
            console.error("Error loading audio:", error);
        }
        isPlay = false;
        pauseBtn.style.display = "none";
        playBtn.style.display = "inline-block";
    }

    audioPlayer.onended = () => {
        isPlay = false;
        pauseBtn.style.display = "none";
        playBtn.style.display = "inline-block";
        console.log("Song ended");

        if (currentSongIndex < allsongs.length - 1) {
            currentSongIndex++;
        } else {
            currentSongIndex = 0;
        }
        let nextsong = allsongs[currentSongIndex];
        playSong(nextsong.videoId, nextsong.title, nextsong.artist);
    };

    audioPlayer.onerror = (e) => {
        console.error("Audio error:", e);
        isPlay = false;
        pauseBtn.style.display = "none";
        playBtn.style.display = "inline-block";
    };
}







// ==================== SEEK BAR ====================

function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}


const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");


audioPlayer.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
});

let isDragging = false;

const seekbarContainer = document.querySelector('.seekbar-container');
const seekbar = document.getElementById("seekbar");

// Helper to update seek position
function updateSeek(event) {
    if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return;

    const rect = seekbarContainer.getBoundingClientRect();
    let clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    let x = clientX - rect.left;

    // Clamp inside container
    x = Math.max(0, Math.min(x, rect.width));
    const percent = x / rect.width;

    audioPlayer.currentTime = percent * audioPlayer.duration;
    seekbar.style.width = (percent * 100) + "%";
}

// ---------- CLICK TO SEEK ----------
if (seekbarContainer) {
    seekbarContainer.addEventListener('click', e => updateSeek(e));

    // ---------- DRAG TO SEEK ----------
    seekbarContainer.addEventListener('mousedown', e => {
        isDragging = true;
        updateSeek(e);
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (isDragging) updateSeek(e);
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    // Touch support
    seekbarContainer.addEventListener('touchstart', e => {
        isDragging = true;
        updateSeek(e);
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (isDragging) updateSeek(e);
    }, { passive: true });

    document.addEventListener('touchend', () => { isDragging = false; });
}


audioPlayer.ontimeupdate = () => {
    if (!isDragging && audioPlayer.duration && isFinite(audioPlayer.duration)) {
        const progress =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

        seekbar.style.width = progress + "%";
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
};


const volumeSlider = document.getElementById("volumeSlider");
if (volumeSlider) {
    audioPlayer.volume = 1;
    volumeSlider.addEventListener("input", (e) => {
        audioPlayer.volume = e.target.value;
    });
}



