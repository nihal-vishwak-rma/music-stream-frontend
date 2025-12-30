import {
    showSuccessPopup,
    showErrorPopup,
    closeModal,
    openCreatePrivatePlaylistModel,
    openCreateCollabPlaylistModel
} from "./ui.js";
import { playSong  } from './music.js';
import { authFetch } from "./authFetch.js";


// ============ UI RELATED ===============

document.getElementById("create-playlist-btn-1")?.addEventListener("click", () => {
    openCreatePrivatePlaylistModel();
});

document.getElementById("create-playlist-btn-2")?.addEventListener("click", () => {
    openCreateCollabPlaylistModel();
});


function cleanErrorMessage(message) {
    if (!message || typeof message !== "string") {
        return "Something went wrong";
    }

    return message
        
        .replace(/\b[1-5]\d{2}\b/g, "")

       
        .replace(
            /\b(UNAUTHORIZED|FORBIDDEN|BAD REQUEST|CONFLICT|NOT FOUND|INTERNAL SERVER ERROR|SERVICE UNAVAILABLE|GATEWAY TIMEOUT|PAYLOAD TOO LARGE|UNSUPPORTED MEDIA TYPE|TOO MANY REQUESTS)\b/gi,
            ""
        )

       
        .replace(/\b(HTTP\/1\.1|HTTP\/2|HTTPS?)\b/gi, "")
        .replace(/\b(ERROR|EXCEPTION|STATUS|FAILED|FAILURE)\b/gi, "")

       
        .replace(/[:\-–|]/g, " ")

       
        .replace(/\s+/g, " ")
        .trim() ||

        
        "Something went wrong";
}




// ============= PLAYLIST LOGIC ============

const createPrivatePlaylist = document.querySelector('#create-private-playlist-model form');

if (createPrivatePlaylist) {

    createPrivatePlaylist.addEventListener('submit', async function (e) {
        e.preventDefault();

        document.getElementById('private-playlist-error').style.display = "none";
        document.getElementById('private-playlist-success').style.display = "none"

        const name = this.querySelector('input[type="text"]').value;

        try {

        

            const res = await authFetch(`${API_URL}/playlist/createPrivate`,

                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ name })
                }
            );

            const result = await res.json();

            if (res.ok) {

                const successBox = document.getElementById('private-playlist-success');

                successBox.innerText = result.message || "Playlist created successfully!";
                successBox.style.display = "block";
                successBox.style.color = "green";


                setTimeout(function () {
                    closeModal('create-private-playlist-model');

                }, 2000);




            }
            else {

                const errorBox = document.getElementById('private-playlist-error');

                errorBox.innerText = cleanErrorMessage(result.message) || "Something went wrong";
                errorBox.style.display = "block";
                errorBox.style.color = "red";

                console.error(result.message);

            }

        } catch (err) {
            console.error(err);
        }


    })


}

const createCollabPlaylist = document.querySelector('#create-collab-playlist-model form');


if (createCollabPlaylist) {

    createCollabPlaylist.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = this.querySelector('input[type="text"]').value;

        try {

        

            const res = await authFetch(`${API_URL}/playlist/createCollabPlayList`,

                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ name })
                }
            );



            const result = await res.json();

            if (res.ok) {
                document.getElementById('collab-playlist-success').innerText = result.message || "Playlist created!";
                document.getElementById('collab-playlist-success').style.display = 'block';
                document.getElementById('collab-playlist-error').style.display = 'none';

                console.log("Collab Playlist created:", result.data);

                setTimeout(function () {
                    closeModal('create-collab-playlist-model');

                }, 2000);



            }
            else {

                document.getElementById('collab-playlist-error').innerText = cleanErrorMessage(result.message);
                document.getElementById('collab-playlist-error').style.display = "block";
                document.getElementById('collab-playlist-success').style.display = "none";

                console.error(result.message);
            }

        } catch (err) {
            console.error(err);
        }


    })


}

const joinBtn = document.getElementById("join-code");

if (joinBtn) {
    joinBtn.addEventListener('click', async () => {
        const code = document.getElementById('join-code-input').value;

        try {
           

            const res = await authFetch(`${API_URL}/playlist/applycode`,

                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ code })
                }
            );


            console.log(res.status);

            const response = await res.json();


            if (res.ok) {
                document.getElementById('join-code-success').innerText = response.message || 'playlist Join Successful!';
                document.getElementById('join-code-success').style.display = 'block';
                document.getElementById('join-code-error').style.display = 'none';
                console.log(response);
            } else {
                document.getElementById('join-code-error').innerText = cleanErrorMessage(result.message) || "join failed";
                document.getElementById('join-code-error').style.display = 'block';
                document.getElementById('join-code-success').style.display = 'none';
                console.log(response);
            }

        } catch (error) {
            console.log(error);
        }

        setTimeout(function () {

            document.getElementById('join-code-success').style.display = 'none';
            document.getElementById('join-code-error').style.display = 'none';
        }, 5000);
    });

}



var viewPrivatePlaylist = document.getElementById("view-playlist-btn-1");
var viewCollabPlaylist = document.getElementById("view-playlist-btn-2");
var navViewPlaylist = document.querySelector(".nav-view-playlist");

viewPrivatePlaylist.addEventListener('click', async () => {
    try {
      

        const res = await authFetch(`${API_URL}/playlist/myPlayList`,

            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        if (res.ok) {
            const result = await res.json();
            

            navViewPlaylist.innerHTML = "";

            if (result.data && result.data.length > 0) {
                result.data.forEach(playlist => {
                    const div = document.createElement("div");
                    div.classList.add("playlist-item");
                    div.style.display = "flex";
                    div.style.alignItems = "center";
                    div.style.justifyContent = "space-between";
                    div.style.margin = "5px 0";

                    // Playlist name
                    const playlistName = document.createElement("span");
                    playlistName.textContent = `${playlist.name} (${playlist.totalsongs} songs)`;
                    playlistName.style.cursor = "pointer";

                    // Plus icon
                    const plusIcon = document.createElement("i");
                    plusIcon.classList.add("fa-solid", "fa-plus");
                    plusIcon.style.color = "green";
                    plusIcon.style.cursor = "pointer";
                    plusIcon.style.marginRight = "10px";

                    // Playlist code (only if not null)
                    let codeSpan = null;
                    if (playlist.code) {
                        codeSpan = document.createElement("span");
                        codeSpan.textContent = playlist.code;
                        codeSpan.style.color = "yellow";    // 👈 highlight color
                        codeSpan.style.fontSize = "0.9rem";
                        codeSpan.style.marginRight = "10px";
                        codeSpan.style.fontWeight = "bold";
                        codeSpan.style.background = "#333";
                        codeSpan.style.padding = "2px 6px";
                        codeSpan.style.borderRadius = "6px";
                    }

                    // Trash icon
                    const trashIcon = document.createElement("i");
                    trashIcon.classList.add("fa-solid", "fa-trash");
                    trashIcon.style.color = "red";
                    trashIcon.style.cursor = "pointer";
                    trashIcon.style.marginRight = "10px";

                    // Append in order: plus, remove, trash
                    div.appendChild(playlistName);
                    div.appendChild(plusIcon);
                    if (codeSpan) div.appendChild(codeSpan); // only show when not null
                    div.appendChild(trashIcon);



                    plusIcon.addEventListener("click", () => {
                        const modal = document.getElementById("addSongModal");
                        modal.style.display = "flex";

                        // Store playlistId in modal for later use
                        modal.dataset.playlistId = playlist.id;
                    });

                    document.getElementById("closeModalBtn").addEventListener("click", () => {
                        document.getElementById("addSongModal").style.display = "none";
                    });


                    // Click to toggle songs
                    playlistName.addEventListener("click", async () => {
                        await togglePlaylistSongs(div, playlist.id);
                    });



                    // Click to delete playlist


                    trashIcon.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        if (!confirm("Are you sure you want to delete this playlist?")) return;

                        try {
                           

                            const deleteRes = await authFetch(`${API_URL}/playlist/delete/${playlist.id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                                    }
                                }
                            );



                            if (deleteRes.ok) {
                                const updatedPlaylists = await deleteRes.json();
                                
                                viewPrivatePlaylist.click();
                                showSuccessPopup("Playlist deleted successfully");
                            } else if (deleteRes.status === 403) {
                               
                                showErrorPopup("Only the playlist admin can delete this playlist");
                            }
                            else if (deleteRes.status === 404) {
                                
                                showErrorPopup("Playlist not found or already deleted");
                            } else {
                                showErrorPopup("Failed to delete playlist")
                            }
                        } catch (error) {
                            console.error(error);
                            showErrorPopup("Failed to delete playlist");
                        }
                    });

                    navViewPlaylist.appendChild(div);
                });
            } else {
                navViewPlaylist.innerHTML = "<p style='color:white;'>No playlists exist</p>";
            }
        }
    } catch (error) {
        console.log(error);
    }
});





//------------VIEW COLLAB PLAYLIST --------------

viewCollabPlaylist.addEventListener('click', async () => {
    try {
        

         const res = await authFetch(`${API_URL}/playlist/collabPlayList` , 

                {
                method : 'GET' ,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }

                });



        if (res.ok) {
            const result = await res.json();
            navViewPlaylist.innerHTML = "";

            if (result.data && result.data.length > 0) {
                result.data.forEach(playlist => {
                    const div = document.createElement("div");
                    div.classList.add("playlist-item");
                    div.style.display = "flex";
                    div.style.alignItems = "center";
                    div.style.justifyContent = "space-between";
                    div.style.margin = "5px 0";

                    // Playlist name
                    const playlistName = document.createElement("span");
                    playlistName.textContent = `${playlist.name} (${playlist.totalsongs} songs)`;
                    playlistName.style.cursor = "pointer";

                    const plusIcon = document.createElement("i");
                    plusIcon.classList.add("fa-solid", "fa-plus");
                    plusIcon.style.color = "green";
                    plusIcon.style.cursor = "pointer";
                    plusIcon.style.marginRight = "10px";

                    // Remove icon
                    const removeIcon = document.createElement("i");
                    removeIcon.classList.add("fa-solid", "fa-right-from-bracket");
                    removeIcon.style.color = "white";
                    removeIcon.style.cursor = "pointer";
                    removeIcon.style.marginRight = "10px";

                    // Append elements
                    div.appendChild(playlistName);
                    div.appendChild(plusIcon);
                    div.appendChild(removeIcon);


                    plusIcon.addEventListener("click", () => {
                        const modal = document.getElementById("addSongModal");
                        modal.style.display = "flex";

                        // Store playlistId in modal for later use
                        modal.dataset.playlistId = playlist.id;
                    });

                    document.getElementById("closeModalBtn").addEventListener("click", () => {
                        document.getElementById("addSongModal").style.display = "none";
                    });


                    // Click to toggle songs
                    playlistName.addEventListener("click", async () => {
                        await togglePlaylistSongs(div, playlist.id);
                    });

                    // Click to delete playlist
                    removeIcon.addEventListener("click", async (e) => {
                        e.stopPropagation(); // prevent playlist toggle
                        if (!confirm("Are you sure you want to delete this playlist?")) return;

                        try {
                            const deleteRes = await fetch(`${API_URL}/playlist/remove/${playlist.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
                            });

                            if (deleteRes.ok) {
                                const updatedPlaylists = await deleteRes.json();

                                viewCollabPlaylist.click();
                                showSuccessPopup("Playlist remove successfully");

                            } else if (deleteRes.status === 403) {
                                // Access denied case
                                showErrorPopup("Only the playlist admin can delete this playlist");
                            }
                            else if (deleteRes.status === 404) {
                                // Playlist not found case
                                showErrorPopup("Playlist not found or already deleted");
                            } else {
                                showErrorPopup("Failed to delete playlist")
                            }
                        } catch (error) {
                            console.error(error);
                            showErrorPopup("Failed to delete playlist");
                        }
                    });

                    navViewPlaylist.appendChild(div);
                });
            } else {
                navViewPlaylist.innerHTML = "<p style='color:white;'>No playlists exist</p>";
            }
        }
    } catch (error) {
        console.log(error);
    }
});





    // Updated loadSongsFromPlaylist function
    async function togglePlaylistSongs(playlistElement, playlistId) {
        const isExpanded = playlistElement.dataset.expanded === "true";
        const playlistContainer = playlistElement.parentElement;
        const existingSongs = playlistContainer.querySelector(".playlist-songs");

        if (isExpanded) {
            if (existingSongs) existingSongs.remove();
            playlistElement.dataset.expanded = "false";
            return;
        }

        try {
            const res = await fetch(`${API_URL}/playlist/getPlayListSongs/${playlistId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const result = await res.json();

                if (existingSongs) existingSongs.remove();

                const songsContainer = document.createElement("div");
                songsContainer.classList.add("playlist-songs");

                if (result.data && result.data.length > 0) {
                    result.data.forEach((song, index) => {
                        const songItem = document.createElement("div");
                        songItem.classList.add("playlist-song-item");
                        songItem.style.display = "flex";
                        songItem.style.alignItems = "center";
                        songItem.style.margin = "5px 0";

                        songItem.innerHTML = `
                        <div class="song-thumbnail" style="position:relative; width:50px; height:50px; margin-right:10px;">
                            <img src="${song.thumbnailUrl || 'https://via.placeholder.com/50'}" alt="thumbnail" width="50" height="50">
                            <div class="song-play-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                                <i class="fa-solid fa-play" style="color:white;"></i>
                            </div>
                        </div>
                        <div class="song-details" style="flex:1;">
                            <div class="song-title-playlist" style="font-size:14px; color:white;">${song.title}</div>
                            <div class="song-artist-playlist" style="font-size:12px; color:#ccc;">${song.artist}</div>
                        </div>
                        <div class="song-duration-playlist" style="font-size:12px; color:#ccc; margin-left:10px;">${song.duration}</div>
                        <div class="song-delete-playlist" style="margin-left:10px; cursor:pointer; color:red;">
                            <i class="fa-solid fa-trash"></i>
                        </div>
                    `;

                        // Play button click
                        const playBtn = songItem.querySelector(".song-play-overlay");
                        playBtn.addEventListener("click", () => {
                            allsongs = result.data;
                            currentSongIndex = index;
                            playSong(song.videoId, song.title, song.artist);
                        });

                        // Delete button click
                        const deleteBtn = songItem.querySelector(".song-delete-playlist");
                        deleteBtn.addEventListener("click", async (e) => {
                            e.stopPropagation(); // prevent playing song on delete
                            try {
                                const deleteRes = await fetch(`${API_URL}/playlist/${playlistId}/song/${song.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });

                                if (deleteRes.ok) {
                                    const updatedSongs = await deleteRes.json();

                                    togglePlaylistSongs(playlistElement, playlistId); // collapse
                                    togglePlaylistSongs(playlistElement, playlistId); // expand
                                    showSuccessPopup("Song deleted successfully");
                                } else {
                                    showErrorPopup("Failed to delete song");
                                }
                            } catch (error) {
                                console.error(error);
                                showErrorPopup("Failed to delete song");
                                showErrorPopup();
                            }
                        });

                        songsContainer.appendChild(songItem);
                    });
                } else {
                    songsContainer.innerHTML = "<p class='no-songs-message' style='color:white;'>No songs in this playlist</p>";
                }

                playlistContainer.appendChild(songsContainer);
                playlistElement.dataset.expanded = "true";
            }
        } catch (error) {
            console.error(error);
            showErrorPopup("Failed to load playlist songs");
        }
    }



//--------ADD SONG IN PLAYLIST MODAL---------


document.getElementById("songSearchInput").addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (!query) return;

        try {
        

             const res = await authFetch(`${API_URL}/music/search?songname=${query}` , 

                {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
                }
             );

            if (res.ok) {
                const result = await res.json();
                const songs = result.data.songs || [];

                const resultsDiv = document.getElementById("songResults");
                resultsDiv.innerHTML = "";

                if (songs.length === 0) {
                    resultsDiv.innerHTML = "<p style='color:#bbb; text-align:center; font-size:14px;'>No songs found</p>";
                } else {
                    songs.forEach(song => {
                        const songDiv = document.createElement("div");
                        songDiv.style.display = "flex";
                        songDiv.style.alignItems = "center";
                        songDiv.style.justifyContent = "space-between";
                        songDiv.style.background = "linear-gradient(135deg, #1f1f1f, #2c2c2c)";
                        songDiv.style.padding = "10px 14px";
                        songDiv.style.borderRadius = "12px";
                        songDiv.style.margin = "8px 0";
                        songDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
                        songDiv.style.transition = "transform 0.2s, box-shadow 0.2s";
                        songDiv.onmouseover = () => {
                            songDiv.style.transform = "translateY(-3px)";
                            songDiv.style.boxShadow = "0 6px 16px rgba(0,0,0,0.6)";
                        };
                        songDiv.onmouseout = () => {
                            songDiv.style.transform = "translateY(0)";
                            songDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
                        };

                        // Left part (thumbnail + text)
                        const leftDiv = document.createElement("div");
                        leftDiv.style.display = "flex";
                        leftDiv.style.alignItems = "center";

                        const thumbnail = document.createElement("img");
                        thumbnail.src = song.thumbnailUrl;
                        thumbnail.alt = song.title;
                        thumbnail.style.width = "55px";
                        thumbnail.style.height = "55px";
                        thumbnail.style.borderRadius = "8px";
                        thumbnail.style.objectFit = "cover";
                        thumbnail.style.marginRight = "12px";
                        thumbnail.style.boxShadow = "0 3px 8px rgba(0,0,0,0.5)";

                        const textDiv = document.createElement("div");
                        const title = document.createElement("p");
                        title.textContent = song.title;
                        title.style.margin = "0";
                        title.style.fontWeight = "600";
                        title.style.fontSize = "15px";
                        title.style.color = "#fff";

                        const artist = document.createElement("small");
                        artist.textContent = song.artist;
                        artist.style.color = "#bbb";
                        artist.style.fontSize = "13px";

                        textDiv.appendChild(title);
                        textDiv.appendChild(artist);

                        leftDiv.appendChild(thumbnail);
                        leftDiv.appendChild(textDiv);

                        // Right part (Add button)
                        const addBtn = document.createElement("button");
                        addBtn.textContent = "➕ Add";
                        addBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
                        addBtn.style.color = "white";
                        addBtn.style.border = "none";
                        addBtn.style.padding = "8px 14px";
                        addBtn.style.borderRadius = "20px";
                        addBtn.style.cursor = "pointer";
                        addBtn.style.fontWeight = "600";
                        addBtn.style.letterSpacing = "0.5px";
                        addBtn.style.transition = "0.2s ease-in-out";

                        addBtn.onmouseover = () => {
                            addBtn.style.background = "linear-gradient(135deg, #16a34a, #22c55e)";
                            addBtn.style.transform = "scale(1.05)";
                        };
                        addBtn.onmouseout = () => {
                            addBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
                            addBtn.style.transform = "scale(1)";
                        };

                        addBtn.addEventListener("click", async () => {
                            const playlistId = document.getElementById("addSongModal").dataset.playlistId;

                            const dto = {
                                id: Number(playlistId),
                                song: [song.videoId]
                            };

                            try {
                                const addRes = await fetch(`${API_URL}/playlist/addSongInPlayList`, {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                                    },
                                    body: JSON.stringify(dto)
                                });

                                if (addRes.ok) {
                                    showSuccessPopup(` ${song.title} added to playlist!`);
                                } else {
                                    showErrorPopup(" Failed to add song");
                                }
                            } catch (err) {
                                console.error(err);
                                showErrorPopup(" Error adding song");
                            }
                        });

                        songDiv.appendChild(leftDiv);
                        songDiv.appendChild(addBtn);

                        resultsDiv.appendChild(songDiv);
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
});
