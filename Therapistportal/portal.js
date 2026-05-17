/* ========================= */
/* THERAPIST INFO */
/* ========================= */

const therapist = {

    name: "Dr. Sarah Johnson",

    role: "LCSW, PhD",

    initials: "SJ"

};

/* ========================= */
/* DYNAMIC SYSTEM DATA */
/* ========================= */

let activeClients = 28;

let sessionsToday = 5;

let unreadMessages = 3;

/* ========================= */
/* STRESS RELIEF TIPS */
/* ========================= */

const tips = [

    "Take a short walk, even around the room",

    "Listen to calming music or nature sounds",

    "Practice progressive muscle relaxation",

    "Write your thoughts in a journal",

    "Call a friend or family member",

    "Do something creative like drawing or coloring"

];

/* ========================= */
/* RESOURCES DATA */
/* ========================= */

let resources = [

    {
        title: "Breathing Techniques for Anxiety",

        description:
        "Simple breathing exercises that help reduce panic attacks and calm the mind.",

        link:
        "https://www.youtube.com/watch?v=odADwWzHR24",

        category: "Video",

        image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
    },

    {
        title: "Relaxing Sleep Podcast",

        description:
        "A peaceful guided sleep meditation and calming sounds for stress relief.",

        link:
        "https://open.spotify.com/",

        category: "Podcast",

        image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
    }

];

/* ========================= */
/* PROFILE INFO */
/* ========================= */

function loadTherapistInfo(){

    document.getElementById("therapistName").textContent =
    therapist.name;

    document.getElementById("therapistRole").textContent =
    therapist.role;

    document.getElementById("therapistInitials").textContent =
    therapist.initials;
}

/* ========================= */
/* OVERVIEW */
/* ========================= */

function loadOverview(){

    document.getElementById("activeClientsCount").textContent =
    activeClients;

    document.getElementById("sessionsTodayCount").textContent =
    sessionsToday;

    document.getElementById("unreadMessagesCount").textContent =
    unreadMessages;
}

/* ========================= */
/* TIPS */
/* ========================= */

function loadTips(){

    const tipsList =
    document.getElementById("tipsList");

    tipsList.innerHTML = "";

    tips.forEach((tip)=>{

        tipsList.innerHTML += `
            <li>${tip}</li>
        `;
    });

}

/* ========================= */
/* STATS */
/* ========================= */

function updateStats(){

    document.getElementById("totalResources").textContent =
    resources.length;

    const videoCount =
    resources.filter(resource =>
        resource.category === "Video"
    ).length;

    document.getElementById("videoCount").textContent =
    videoCount;

    const podcastCount =
    resources.filter(resource =>
        resource.category === "Podcast"
    ).length;

    document.getElementById("podcastCount").textContent =
    podcastCount;

    const categories = {};

    resources.forEach(resource => {

        if(categories[resource.category]){

            categories[resource.category]++;

        }else{

            categories[resource.category] = 1;
        }

    });

    let popularCategory = "None";

    let highest = 0;

    for(let category in categories){

        if(categories[category] > highest){

            highest = categories[category];

            popularCategory = category;
        }

    }

    document.getElementById("popularCategory").textContent =
    popularCategory;
}

/* ========================= */
/* LOAD RESOURCES */
/* ========================= */

function loadResources(){

    const resourcesContainer =
    document.getElementById("resourcesContainer");

    resourcesContainer.innerHTML = "";

    if(resources.length === 0){

        resourcesContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-folder-open"></i>

                <h3>No Resources Yet</h3>

                <p>
                    Uploaded resources will appear here.
                </p>

            </div>

        `;

        updateStats();

        return;
    }

    resources.forEach((resource,index)=>{

        let badgeClass = "badge-video";

        if(resource.category === "Podcast"){
            badgeClass = "badge-podcast";
        }

        if(resource.category === "Meditation"){
            badgeClass = "badge-meditation";
        }

        if(resource.category === "Motivation"){
            badgeClass = "badge-motivation";
        }

        resourcesContainer.innerHTML += `

            <div class="resource-item">

                <img
                    src="${resource.image}"
                    class="resource-image"
                >

                <div class="resource-content">

                    <div class="resource-top">

                        <span class="resource-badge ${badgeClass}">
                            ${resource.category}
                        </span>

                    </div>

                    <h4>${resource.title}</h4>

                    <p>${resource.description}</p>

                    <div class="resource-actions">

                        <button
                            class="open-btn"
                            onclick="window.open('${resource.link}')"
                        >
                            Open Resource
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteResource(${index})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>

            </div>

        `;
    });

    updateStats();
}

/* ========================= */
/* ADD RESOURCE */
/* ========================= */

const resourceForm =
document.getElementById("resourceForm");

resourceForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const title =
    document.getElementById("resourceTitle").value;

    const description =
    document.getElementById("resourceDescription").value;

    const link =
    document.getElementById("resourceLink").value;

    const category =
    document.getElementById("resourceCategory").value;

    const image =
    document.getElementById("resourceImage").value;

    const newResource = {

        title,

        description,

        link,

        category,

        image:
        image ||
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
    };

    resources.unshift(newResource);

    loadResources();

    resourceForm.reset();

});

/* ========================= */
/* DELETE RESOURCE */
/* ========================= */

function deleteResource(index){

    resources.splice(index,1);

    loadResources();

}

/* ========================= */
/* INIT */
/* ========================= */

loadTherapistInfo();

loadOverview();

loadTips();

loadResources();