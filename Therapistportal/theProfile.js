function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}
function addNewCredential() {
    const list = document.getElementById('credentials-list');
    
    // Create the HTML structure for a new credential card
    const newCred = document.createElement('div');
    newCred.className = 'cred-card';
    newCred.innerHTML = `
        <div class="cred-header">
            <strong contenteditable="true">Enter Certification Name...</strong>
            <i class="fa-solid fa-circle-check green"></i>
        </div>
        <p contenteditable="true">Issuing Organization...</p>
        <small contenteditable="true">Obtained: YYYY</small>
        <button class="remove-cred" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Append to the list
    list.appendChild(newCred);
    
    // Optional: Focus the title of the new card immediately
    newCred.querySelector('strong').focus();
}
